const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@database:5432/household_tasks',
});

const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        points INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        points INTEGER NOT NULL DEFAULT 1,
        created_by INTEGER REFERENCES users(id),
        assigned_to INTEGER REFERENCES users(id),
        completed BOOLEAN DEFAULT FALSE,
        completed_by INTEGER REFERENCES users(id),
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_recurring BOOLEAN DEFAULT FALSE,
        recurrence_type VARCHAR(20),
        recurrence_value INTEGER,
        parent_task_id INTEGER REFERENCES tasks(id),
        next_due_date TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS recurring_tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        points INTEGER NOT NULL DEFAULT 1,
        created_by INTEGER REFERENCES users(id),
        assigned_to INTEGER REFERENCES users(id),
        recurrence_type VARCHAR(20) NOT NULL,
        recurrence_value INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_generated TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS point_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        task_id INTEGER REFERENCES tasks(id),
        points INTEGER NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

module.exports = { pool, initDatabase };