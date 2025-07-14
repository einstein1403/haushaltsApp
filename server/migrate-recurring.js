const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@database:5432/household_tasks',
});

async function migrateToRecurring() {
  try {
    console.log('Starting migration to add recurring task support...');
    
    // Add new columns to tasks table
    await pool.query(`
      ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS recurrence_type VARCHAR(20),
      ADD COLUMN IF NOT EXISTS recurrence_value INTEGER,
      ADD COLUMN IF NOT EXISTS parent_task_id INTEGER REFERENCES tasks(id),
      ADD COLUMN IF NOT EXISTS next_due_date TIMESTAMP
    `);
    
    console.log('✅ Added new columns to tasks table');
    
    // Create recurring_tasks table
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
    
    console.log('✅ Created recurring_tasks table');
    
    // Update parent_task_id reference to allow self-reference
    await pool.query(`
      ALTER TABLE tasks 
      DROP CONSTRAINT IF EXISTS tasks_parent_task_id_fkey
    `);
    
    await pool.query(`
      ALTER TABLE tasks 
      ADD CONSTRAINT tasks_parent_task_id_fkey 
      FOREIGN KEY (parent_task_id) REFERENCES recurring_tasks(id)
    `);
    
    console.log('✅ Updated foreign key constraints');
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration
migrateToRecurring()
  .then(() => {
    console.log('Migration script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });