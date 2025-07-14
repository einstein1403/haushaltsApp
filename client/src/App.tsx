import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import CreateTask from './components/CreateTask';
import RecurringTasks from './components/RecurringTasks';
import Statistics from './components/Statistics';
import Navigation from './components/Navigation';
import AdminUserManagement from './components/AdminUserManagement';
import PendingApproval from './components/PendingApproval';
import { User } from './services/api';


function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (token) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
  }, [token]);

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return <Login onLogin={login} />;
  }

  // Check if user is approved
  if (user && !user.is_approved) {
    return <PendingApproval user={user} onLogout={logout} />;
  }

  return (
    <Router>
      <div className="app">
        <Navigation user={user} onLogout={logout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/create-task" element={<CreateTask />} />
            <Route path="/recurring-tasks" element={<RecurringTasks />} />
            <Route path="/statistics" element={<Statistics />} />
            {user && user.role === 'admin' && (
              <Route path="/admin" element={<AdminUserManagement token={token} />} />
            )}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
