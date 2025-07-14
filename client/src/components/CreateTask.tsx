import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskAPI, userAPI, User, TaskSuggestion } from '../services/api';
import AutoCompleteInput from './AutoCompleteInput';
import './CreateTask.css';

const CreateTask: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points: 1,
    assigned_to: 0,
    is_recurring: false,
    recurrence_type: 'days',
    recurrence_value: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersData = await userAPI.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    
    if (formData.points < 1) {
      setError('Points must be at least 1');
      return;
    }

    if (formData.is_recurring && formData.recurrence_value < 1) {
      setError('Recurrence value must be at least 1');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const taskData: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        points: formData.points,
        assigned_to: formData.assigned_to || null,
      };

      if (formData.is_recurring) {
        taskData.is_recurring = true;
        taskData.recurrence_type = formData.recurrence_type;
        taskData.recurrence_value = formData.recurrence_value;
      }

      await taskAPI.createTask(taskData);
      
      navigate('/tasks');
    } catch (error: any) {
      setError(error.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               (name === 'points' || name === 'assigned_to' || name === 'recurrence_value') ? parseInt(value) || 0 : value
    }));
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({ ...prev, title: value }));
  };

  const handleSuggestionSelect = (suggestion: TaskSuggestion) => {
    setFormData(prev => ({
      ...prev,
      title: suggestion.title,
      description: suggestion.description,
      points: suggestion.points
    }));
  };

  return (
    <div className="create-task">
      <div className="create-task-container">
        <h1>Create New Task</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="title">Task Title *</label>
            <AutoCompleteInput
              id="title"
              name="title"
              value={formData.title}
              onChange={handleTitleChange}
              onSuggestionSelect={handleSuggestionSelect}
              placeholder="Enter task title or start typing to see suggestions..."
              required
            />
            <div className="input-hint">
              💡 Start typing to see suggestions from previous tasks
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description (optional)"
              rows={4}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="points">Points *</label>
              <input
                type="number"
                id="points"
                name="points"
                value={formData.points}
                onChange={handleChange}
                min="1"
                max="100"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="assigned_to">Assign To</label>
              <select
                id="assigned_to"
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
              >
                <option value={0}>No assignment (optional)</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-group recurring-section">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="is_recurring"
                name="is_recurring"
                checked={formData.is_recurring}
                onChange={handleChange}
              />
              <label htmlFor="is_recurring">Make this a recurring task</label>
            </div>
            
            {formData.is_recurring && (
              <div className="recurring-options">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="recurrence_value">Repeat every</label>
                    <input
                      type="number"
                      id="recurrence_value"
                      name="recurrence_value"
                      value={formData.recurrence_value}
                      onChange={handleChange}
                      min="1"
                      max="365"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="recurrence_type">Period</label>
                    <select
                      id="recurrence_type"
                      name="recurrence_type"
                      value={formData.recurrence_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="days">Day(s)</option>
                      <option value="weeks">Week(s)</option>
                      <option value="months">Month(s)</option>
                    </select>
                  </div>
                </div>
                
                <div className="recurring-info">
                  <p>
                    📅 This task will automatically reappear every{' '}
                    {formData.recurrence_value > 1 ? formData.recurrence_value : ''}{' '}
                    {formData.recurrence_type === 'days' && formData.recurrence_value === 1 ? 'day' : 
                     formData.recurrence_type === 'days' ? 'days' :
                     formData.recurrence_type === 'weeks' && formData.recurrence_value === 1 ? 'week' :
                     formData.recurrence_type === 'weeks' ? 'weeks' :
                     formData.recurrence_type === 'months' && formData.recurrence_value === 1 ? 'month' : 'months'}
                    {' '}after completion.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/tasks')}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;