import React, { useState, useEffect } from 'react';
import { taskAPI, userAPI, Task, User } from '../services/api';
import './TaskList.css';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksData, usersData] = await Promise.all([
        taskAPI.getTasks(),
        userAPI.getUsers()
      ]);
      
      setTasks(tasksData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: number, completedBy: number) => {
    try {
      await taskAPI.completeTask(taskId, completedBy);
      await loadData();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h1>Tasks</h1>
        
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'filter-button active' : 'filter-button'}
            onClick={() => setFilter('all')}
          >
            All ({tasks.length})
          </button>
          <button 
            className={filter === 'pending' ? 'filter-button active' : 'filter-button'}
            onClick={() => setFilter('pending')}
          >
            Pending ({tasks.filter(t => !t.completed).length})
          </button>
          <button 
            className={filter === 'completed' ? 'filter-button active' : 'filter-button'}
            onClick={() => setFilter('completed')}
          >
            Completed ({tasks.filter(t => t.completed).length})
          </button>
        </div>
      </div>
      
      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks found</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {filteredTasks.map((task) => (
            <div key={task.id} className={`task-card ${task.completed ? 'completed' : 'pending'}`}>
              <div className="task-header">
                <h3>
                  {task.title}
                  {task.is_recurring && (
                    <span className="recurring-badge">🔄 Recurring</span>
                  )}
                </h3>
                <div className="task-points">{task.points} pts</div>
              </div>
              
              {task.description && (
                <p className="task-description">{task.description}</p>
              )}
              
              <div className="task-meta">
                <div className="task-assignment">
                  <strong>Created by:</strong> {task.created_by_name}
                </div>
                <div className="task-assignment">
                  <strong>Assigned to:</strong> {task.assigned_to_name || 'Not assigned'}
                </div>
                <div className="task-date">
                  <strong>Created:</strong> {new Date(task.created_at).toLocaleDateString()}
                </div>
                {task.is_recurring && (
                  <div className="task-recurrence">
                    <strong>Repeats:</strong> Every {task.recurrence_value} {task.recurrence_type}
                  </div>
                )}
              </div>
              
              {task.completed ? (
                <div className="task-completion">
                  <div className="completion-info">
                    ✓ Completed by {task.completed_by_name}
                  </div>
                  <div className="completion-date">
                    {new Date(task.completed_at!).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div className="task-actions">
                  <label htmlFor={`complete-${task.id}`}>Complete as:</label>
                  <select
                    id={`complete-${task.id}`}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleCompleteTask(task.id, parseInt(e.target.value));
                      }
                    }}
                    value=""
                  >
                    <option value="">Select user...</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;