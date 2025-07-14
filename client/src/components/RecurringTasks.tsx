import React, { useState, useEffect } from 'react';
import { recurringTaskAPI, RecurringTask } from '../services/api';
import './RecurringTasks.css';

const RecurringTasks: React.FC = () => {
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecurringTasks();
  }, []);

  const loadRecurringTasks = async () => {
    try {
      const data = await recurringTaskAPI.getRecurringTasks();
      setRecurringTasks(data);
    } catch (error) {
      console.error('Error loading recurring tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: number) => {
    try {
      await recurringTaskAPI.toggleRecurringTask(taskId);
      await loadRecurringTasks();
    } catch (error) {
      console.error('Error toggling recurring task:', error);
    }
  };

  const formatRecurrence = (type: string, value: number) => {
    if (value === 1) {
      switch (type) {
        case 'days': return 'Daily';
        case 'weeks': return 'Weekly';
        case 'months': return 'Monthly';
        default: return `Every ${value} ${type}`;
      }
    }
    return `Every ${value} ${type}`;
  };

  if (loading) {
    return <div className="loading">Loading recurring tasks...</div>;
  }

  return (
    <div className="recurring-tasks">
      <div className="recurring-tasks-header">
        <h1>Recurring Tasks</h1>
        <p>Manage tasks that automatically repeat</p>
      </div>
      
      {recurringTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔄</div>
          <h3>No recurring tasks yet</h3>
          <p>Create a task with the "recurring" option to see it here.</p>
        </div>
      ) : (
        <div className="recurring-tasks-grid">
          {recurringTasks.map((task) => (
            <div key={task.id} className={`recurring-task-card ${task.is_active ? 'active' : 'inactive'}`}>
              <div className="task-header">
                <h3>{task.title}</h3>
                <div className="task-status">
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className={`toggle-button ${task.is_active ? 'active' : 'inactive'}`}
                  >
                    {task.is_active ? 'Active' : 'Paused'}
                  </button>
                </div>
              </div>
              
              {task.description && (
                <p className="task-description">{task.description}</p>
              )}
              
              <div className="task-details">
                <div className="detail-item">
                  <span className="label">Points:</span>
                  <span className="value">{task.points}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Assigned to:</span>
                  <span className="value">{task.assigned_to_name || 'Not assigned'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Repeats:</span>
                  <span className="value">{formatRecurrence(task.recurrence_type, task.recurrence_value)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Created:</span>
                  <span className="value">{task.created_at ? new Date(task.created_at).toLocaleDateString() : 'Unknown'}</span>
                </div>
                {task.last_generated && (
                  <div className="detail-item">
                    <span className="label">Last generated:</span>
                    <span className="value">{new Date(task.last_generated).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <div className="task-info">
                {task.is_active ? (
                  <div className="info-active">
                    <span className="status-icon">✅</span>
                    This task will automatically create new instances based on the schedule.
                  </div>
                ) : (
                  <div className="info-inactive">
                    <span className="status-icon">⏸️</span>
                    This task is paused and won't create new instances.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecurringTasks;