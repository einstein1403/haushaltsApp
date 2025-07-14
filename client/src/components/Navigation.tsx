import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../services/api';
import './Navigation.css';

interface NavigationProps {
  user: User | null;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ user, onLogout }) => {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h1>Household Tasks</h1>
      </div>
      
      <div className="nav-links">
        <Link 
          to="/" 
          className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
        >
          Dashboard
        </Link>
        <Link 
          to="/tasks" 
          className={location.pathname === '/tasks' ? 'nav-link active' : 'nav-link'}
        >
          Tasks
        </Link>
        <Link 
          to="/create-task" 
          className={location.pathname === '/create-task' ? 'nav-link active' : 'nav-link'}
        >
          Create Task
        </Link>
        <Link 
          to="/recurring-tasks" 
          className={location.pathname === '/recurring-tasks' ? 'nav-link active' : 'nav-link'}
        >
          Recurring Tasks
        </Link>
        <Link 
          to="/statistics" 
          className={location.pathname === '/statistics' ? 'nav-link active' : 'nav-link'}
        >
          Statistics
        </Link>
        {user && (user as any).role === 'admin' && (
          <Link 
            to="/admin" 
            className={location.pathname === '/admin' ? 'nav-link active admin-link' : 'nav-link admin-link'}
          >
            Admin
          </Link>
        )}
      </div>
      
      <div className="nav-user">
        {user && (
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-points">{user.points} pts</span>
            {(user as any).role === 'admin' && (
              <span className="admin-badge">Admin</span>
            )}
            <button onClick={onLogout} className="logout-button">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;