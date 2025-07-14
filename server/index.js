const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { pool, initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors());
app.use(express.json());

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, async (err, user) => {
    if (err) return res.sendStatus(403);
    
    // Get user details from database
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [user.userId]);
    if (userResult.rows.length === 0) {
      return res.sendStatus(403);
    }
    
    req.user = userResult.rows[0];
    next();
  });
};

// Middleware to check if user is approved
const requireApproval = (req, res, next) => {
  if (!req.user.is_approved) {
    return res.status(403).json({ error: 'Account pending approval' });
  }
  next();
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Auth routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if this is the first user
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const isFirstUser = parseInt(userCount.rows[0].count) === 0;
    
    console.log('User count:', userCount.rows[0].count, 'isFirstUser:', isFirstUser);
    
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, is_approved, approved_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, is_approved',
      [name, email, hashedPassword, isFirstUser ? 'admin' : 'user', isFirstUser, isFirstUser ? new Date() : null]
    );
    
    const token = jwt.sign({ userId: result.rows[0].id }, JWT_SECRET);
    
    res.json({ 
      token, 
      user: result.rows[0],
      message: isFirstUser ? 'Welcome! You are now the administrator.' : 'Registration successful. Waiting for admin approval.'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (user && await bcrypt.compare(password, user.password_hash)) {
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          points: user.points,
          role: user.role,
          is_approved: user.is_approved
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// User routes
app.get('/api/users', authenticateToken, requireApproval, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, points FROM users WHERE is_approved = TRUE ORDER BY points DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/reset-scores', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE users SET points = 0');
    await pool.query('DELETE FROM point_history');
    res.json({ message: 'All scores reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Task routes
app.get('/api/tasks', authenticateToken, requireApproval, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, 
             u1.name as created_by_name,
             u2.name as assigned_to_name,
             u3.name as completed_by_name
      FROM tasks t
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      LEFT JOIN users u3 ON t.completed_by = u3.id
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Task suggestions route
app.get('/api/task-suggestions', authenticateToken, requireApproval, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }
    
    // Get unique task titles and descriptions from both tasks and recurring_tasks
    const result = await pool.query(`
      SELECT DISTINCT title, description, points, 
             COUNT(*) as usage_count,
             MAX(created_at) as last_used
      FROM (
        SELECT title, description, points, created_at FROM tasks
        WHERE LOWER(title) LIKE LOWER($1)
        UNION ALL
        SELECT title, description, points, created_at FROM recurring_tasks  
        WHERE LOWER(title) LIKE LOWER($1)
      ) combined_tasks
      GROUP BY title, description, points
      ORDER BY usage_count DESC, last_used DESC
      LIMIT 10
    `, [`%${q}%`]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', authenticateToken, requireApproval, async (req, res) => {
  try {
    const { title, description, points, assigned_to, is_recurring, recurrence_type, recurrence_value } = req.body;
    
    if (is_recurring && recurrence_type && recurrence_value) {
      const recurringResult = await pool.query(
        'INSERT INTO recurring_tasks (title, description, points, created_by, assigned_to, recurrence_type, recurrence_value) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [title, description, points, req.user.userId, assigned_to, recurrence_type, recurrence_value]
      );
      
      const taskResult = await pool.query(
        'INSERT INTO tasks (title, description, points, created_by, assigned_to, is_recurring, recurrence_type, recurrence_value, parent_task_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [title, description, points, req.user.userId, assigned_to, true, recurrence_type, recurrence_value, recurringResult.rows[0].id]
      );
      
      res.json(taskResult.rows[0]);
    } else {
      const result = await pool.query(
        'INSERT INTO tasks (title, description, points, created_by, assigned_to) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [title, description, points, req.user.userId, assigned_to]
      );
      
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.patch('/api/tasks/:id/complete', authenticateToken, requireApproval, async (req, res) => {
  try {
    const { id } = req.params;
    const { completed_by } = req.body;
    
    const task = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (task.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const points = task.rows[0].points;
    const isRecurring = task.rows[0].is_recurring;
    const parentTaskId = task.rows[0].parent_task_id;
    
    await pool.query(
      'UPDATE tasks SET completed = TRUE, completed_by = $1, completed_at = CURRENT_TIMESTAMP WHERE id = $2',
      [completed_by, id]
    );
    
    await pool.query(
      'UPDATE users SET points = points + $1 WHERE id = $2',
      [points, completed_by]
    );
    
    await pool.query(
      'INSERT INTO point_history (user_id, task_id, points) VALUES ($1, $2, $3)',
      [completed_by, id, points]
    );
    
    if (isRecurring && parentTaskId) {
      const recurringTask = await pool.query('SELECT * FROM recurring_tasks WHERE id = $1', [parentTaskId]);
      if (recurringTask.rows.length > 0) {
        const recurring = recurringTask.rows[0];
        const nextDate = calculateNextDate(recurring.recurrence_type, recurring.recurrence_value);
        
        await pool.query(
          'INSERT INTO tasks (title, description, points, created_by, assigned_to, is_recurring, recurrence_type, recurrence_value, parent_task_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
          [recurring.title, recurring.description, recurring.points, recurring.created_by, recurring.assigned_to, true, recurring.recurrence_type, recurring.recurrence_value, parentTaskId, nextDate]
        );
        
        await pool.query(
          'UPDATE recurring_tasks SET last_generated = CURRENT_TIMESTAMP WHERE id = $1',
          [parentTaskId]
        );
      }
    }
    
    res.json({ message: 'Task completed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recurring tasks routes
app.get('/api/recurring-tasks', authenticateToken, requireApproval, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT rt.*, 
             u1.name as created_by_name,
             u2.name as assigned_to_name
      FROM recurring_tasks rt
      LEFT JOIN users u1 ON rt.created_by = u1.id
      LEFT JOIN users u2 ON rt.assigned_to = u2.id
      WHERE rt.is_active = TRUE
      ORDER BY rt.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/recurring-tasks/:id/toggle', authenticateToken, requireApproval, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE recurring_tasks SET is_active = NOT is_active WHERE id = $1 RETURNING *',
      [id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to calculate next date
function calculateNextDate(recurrenceType, recurrenceValue) {
  const now = new Date();
  switch (recurrenceType) {
    case 'days':
      return new Date(now.getTime() + (recurrenceValue * 24 * 60 * 60 * 1000));
    case 'weeks':
      return new Date(now.getTime() + (recurrenceValue * 7 * 24 * 60 * 60 * 1000));
    case 'months':
      const nextMonth = new Date(now);
      nextMonth.setMonth(now.getMonth() + recurrenceValue);
      return nextMonth;
    default:
      return new Date(now.getTime() + (24 * 60 * 60 * 1000)); // Default to 1 day
  }
}

// Scheduler function to create recurring tasks
async function generateRecurringTasks() {
  try {
    const result = await pool.query(`
      SELECT * FROM recurring_tasks 
      WHERE is_active = TRUE 
      AND (last_generated IS NULL OR last_generated < CURRENT_TIMESTAMP - INTERVAL '23 hours')
    `);
    
    for (const recurring of result.rows) {
      const lastTask = await pool.query(`
        SELECT * FROM tasks 
        WHERE parent_task_id = $1 
        ORDER BY created_at DESC 
        LIMIT 1
      `, [recurring.id]);
      
      let shouldGenerate = false;
      
      if (lastTask.rows.length === 0) {
        shouldGenerate = true;
      } else {
        const lastTaskDate = new Date(lastTask.rows[0].created_at);
        const now = new Date();
        const timeDiff = now - lastTaskDate;
        
        switch (recurring.recurrence_type) {
          case 'days':
            shouldGenerate = timeDiff >= (recurring.recurrence_value * 24 * 60 * 60 * 1000);
            break;
          case 'weeks':
            shouldGenerate = timeDiff >= (recurring.recurrence_value * 7 * 24 * 60 * 60 * 1000);
            break;
          case 'months':
            const monthsDiff = (now.getFullYear() - lastTaskDate.getFullYear()) * 12 + (now.getMonth() - lastTaskDate.getMonth());
            shouldGenerate = monthsDiff >= recurring.recurrence_value;
            break;
        }
      }
      
      if (shouldGenerate) {
        await pool.query(
          'INSERT INTO tasks (title, description, points, created_by, assigned_to, is_recurring, recurrence_type, recurrence_value, parent_task_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [recurring.title, recurring.description, recurring.points, recurring.created_by, recurring.assigned_to, true, recurring.recurrence_type, recurring.recurrence_value, recurring.id]
        );
        
        await pool.query(
          'UPDATE recurring_tasks SET last_generated = CURRENT_TIMESTAMP WHERE id = $1',
          [recurring.id]
        );
        
        console.log(`Generated recurring task: ${recurring.title}`);
      }
    }
  } catch (error) {
    console.error('Error generating recurring tasks:', error);
  }
}

// Run scheduler every hour
setInterval(generateRecurringTasks, 60 * 60 * 1000);

// Statistics routes
app.get('/api/stats/weekly', authenticateToken, requireApproval, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.name, COALESCE(SUM(ph.points), 0) as weekly_points
      FROM users u
      LEFT JOIN point_history ph ON u.id = ph.user_id 
        AND ph.earned_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY u.id, u.name
      ORDER BY weekly_points DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats/monthly', authenticateToken, requireApproval, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.name, COALESCE(SUM(ph.points), 0) as monthly_points
      FROM users u
      LEFT JOIN point_history ph ON u.id = ph.user_id 
        AND ph.earned_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY u.id, u.name
      ORDER BY monthly_points DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin routes for user management
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.points, u.role, u.is_approved, u.created_at,
             approver.name as approved_by_name, u.approved_at
      FROM users u
      LEFT JOIN users approver ON u.approved_by = approver.id
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/users/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE users SET is_approved = TRUE, approved_by = $1, approved_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [req.user.id, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User approved successfully', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/users/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE users SET is_approved = FALSE, approved_by = NULL, approved_at = NULL WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User approval revoked', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Don't allow deleting yourself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/pending-users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, created_at
      FROM users 
      WHERE is_approved = FALSE
      ORDER BY created_at ASC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize database and start server
const startServer = async () => {
  await initDatabase();
  
  // Generate initial recurring tasks
  setTimeout(generateRecurringTasks, 5000);
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Recurring task scheduler started');
  });
};

startServer();