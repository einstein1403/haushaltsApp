import React, { useState, useEffect } from 'react';
import './AdminUserManagement.css';
import { User } from '../services/api';

interface AdminUser extends User {
  approved_by_name?: string;
}

interface AdminUserManagementProps {
  token: string;
}

const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ token }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pendingUsers, setPendingUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchPendingUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch('/api/admin/pending-users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending users');
      }
      
      const data = await response.json();
      setPendingUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve user');
      }
      
      await fetchUsers();
      await fetchPendingUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const rejectUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/reject`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject user');
      }
      
      await fetchUsers();
      await fetchPendingUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const deleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      await fetchUsers();
      await fetchPendingUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading user management...</div>;
  }

  return (
    <div className="admin-user-management">
      <h2>User Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {pendingUsers.length > 0 && (
        <div className="pending-users-section">
          <h3>Pending Approval ({pendingUsers.length})</h3>
          <div className="pending-users">
            {pendingUsers.map(user => (
              <div key={user.id} className="pending-user-card">
                <div className="user-info">
                  <h4>{user.name}</h4>
                  <p>{user.email}</p>
                  <p className="created-date">
                    Registered: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="user-actions">
                  <button 
                    onClick={() => approveUser(user.id)}
                    className="approve-btn"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => deleteUser(user.id)}
                    className="reject-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="all-users-section">
        <h3>All Users ({users.length})</h3>
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Points</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.points}</td>
                  <td>
                    <span className={`status-badge ${user.is_approved ? 'approved' : 'pending'}`}>
                      {user.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    {user.role !== 'admin' && (
                      <div className="table-actions">
                        {user.is_approved ? (
                          <button 
                            onClick={() => rejectUser(user.id)}
                            className="revoke-btn"
                          >
                            Revoke
                          </button>
                        ) : (
                          <button 
                            onClick={() => approveUser(user.id)}
                            className="approve-btn"
                          >
                            Approve
                          </button>
                        )}
                        <button 
                          onClick={() => deleteUser(user.id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;