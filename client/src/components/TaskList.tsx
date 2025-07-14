import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { taskAPI, userAPI, Task, User } from '../services/api';
import { handleApiError, getErrorMessage } from '../utils/errorHandler';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import './TaskList.css';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [tasksData, usersData] = await Promise.all([
        taskAPI.getTasks(),
        userAPI.getUsers()
      ]);
      
      setTasks(tasksData);
      setUsers(usersData);
    } catch (err) {
      const error = handleApiError(err);
      setError(error.message);
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCompleteTask = useCallback(async (taskId: number, completedBy: number) => {
    try {
      await taskAPI.completeTask(taskId, completedBy);
      await loadData();
    } catch (err) {
      const error = handleApiError(err);
      setError(error.message);
      console.error('Error completing task:', error);
    }
  }, [loadData]);

  // Memoized filter calculations for performance
  const taskCounts = useMemo(() => {
    const pending = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;
    return {
      all: tasks.length,
      pending,
      completed
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (filter === 'pending') return tasks.filter(task => !task.completed);
    if (filter === 'completed') return tasks.filter(task => task.completed);
    return tasks;
  }, [tasks, filter]);

  if (loading) {
    return <LoadingSpinner message="Loading tasks..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        title="Error loading tasks"
        message={error}
        onRetry={loadData}
      />
    );
  }

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h1>Tasks</h1>
        
        <div className="filter-buttons" role="tablist" aria-label="Task filters">
          <button 
            className={filter === 'all' ? 'filter-button active' : 'filter-button'}
            onClick={() => setFilter('all')}
            role="tab"
            aria-selected={filter === 'all'}
            aria-controls="task-list-content"
          >
            All ({taskCounts.all})
          </button>
          <button 
            className={filter === 'pending' ? 'filter-button active' : 'filter-button'}
            onClick={() => setFilter('pending')}
            role="tab"
            aria-selected={filter === 'pending'}
            aria-controls="task-list-content"
          >
            Pending ({taskCounts.pending})
          </button>
          <button 
            className={filter === 'completed' ? 'filter-button active' : 'filter-button'}
            onClick={() => setFilter('completed')}
            role="tab"
            aria-selected={filter === 'completed'}
            aria-controls="task-list-content"
          >
            Completed ({taskCounts.completed})
          </button>
        </div>
      </div>
      
      <div id="task-list-content" role="tabpanel" aria-label={`${filter} tasks`}>
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
                    aria-label={`Complete task "${task.title}" as user`}
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
    </div>
  );
};

export default TaskList;