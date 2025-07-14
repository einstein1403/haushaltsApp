import React from 'react';
import './PendingApproval.css';

interface PendingApprovalProps {
  user: any;
  onLogout: () => void;
}

const PendingApproval: React.FC<PendingApprovalProps> = ({ user, onLogout }) => {
  return (
    <div className="pending-approval">
      <div className="pending-approval-card">
        <div className="pending-icon">⏳</div>
        <h2>Account Pending Approval</h2>
        <p>Hello <strong>{user.name}</strong>,</p>
        <p>
          Your account has been successfully created but is currently pending approval 
          from an administrator. You will be able to access the application once your 
          account has been approved.
        </p>
        <p>
          Please check back later or contact an administrator if you have any questions.
        </p>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default PendingApproval;