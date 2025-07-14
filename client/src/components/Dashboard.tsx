import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { userAPI, taskAPI, User, Task } from '../services/api';
import { handleApiError, getErrorMessage } from '../utils/errorHandler';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [usersData, tasksData] = await Promise.all([
        userAPI.getUsers(),
        taskAPI.getTasks()
      ]);
      
      setUsers(usersData);
      setRecentTasks(tasksData.slice(0, 5));
    } catch (err) {
      const error = handleApiError(err);
      setError(error.message);
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResetScores = async () => {
    if (window.confirm('Are you sure you want to reset all scores? This action cannot be undone.')) {
      try {
        await userAPI.resetScores();
        await loadData();
      } catch (error) {
        console.error('Error resetting scores:', error);
      }
    }
  };

  // Memoized calculations for performance
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => b.points - a.points);
  }, [users]);

  const dashboardStats = useMemo(() => {
    const completedTasks = recentTasks.filter(task => task.completed).length;
    const pendingTasks = recentTasks.filter(task => !task.completed).length;
    const totalPoints = users.reduce((sum, user) => sum + user.points, 0);
    
    return {
      completedTasks,
      pendingTasks,
      totalPoints,
      activeUsers: users.length
    };
  }, [users, recentTasks]);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        title="Error loading dashboard"
        message={error}
        onRetry={loadData}
      />
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleResetScores} className="reset-button">
          Reset All Scores
        </button>
      </div>
      
      <div className="dashboard-grid">
        <div className="card leaderboard-card">
          <h2>Leaderboard</h2>
          {sortedUsers.length === 0 ? (
            <p>No users found</p>
          ) : (
            <div className="leaderboard">
              {sortedUsers.map((user, index) => (
                <div key={user.id} className="leaderboard-item">
                  <span className="rank">#{index + 1}</span>
                  <span className="name">{user.name}</span>
                  <span className="points">{user.points} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="card recent-tasks-card">
          <h2>Recent Tasks</h2>
          {recentTasks.length === 0 ? (
            <p>No tasks found</p>
          ) : (
            <div className="recent-tasks">
              {recentTasks.map((task) => (
                <div key={task.id} className={`task-item ${task.completed ? 'completed' : 'pending'}`}>
                  <div className="task-info">
                    <h3>{task.title}</h3>
                    <p>Assigned to: {task.assigned_to_name || 'Not assigned'}</p>
                    <p>Points: {task.points}</p>
                  </div>
                  <div className="task-status">
                    {task.completed ? (
                      <span className="status-completed">
                        ✓ Completed by {task.completed_by_name}
                      </span>
                    ) : (
                      <span className="status-pending">Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-number">{users.length}</div>
        </div>
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <div className="stat-number">{recentTasks.length}</div>
        </div>
        <div className="stat-card">
          <h3>Completed Tasks</h3>
          <div className="stat-number">
            {recentTasks.filter(task => task.completed).length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;