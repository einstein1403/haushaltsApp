import React, { useState, useEffect } from 'react';
import { statsAPI, Stats } from '../services/api';
import './Statistics.css';

const Statistics: React.FC = () => {
  const [weeklyStats, setWeeklyStats] = useState<Stats[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [weekly, monthly] = await Promise.all([
        statsAPI.getWeeklyStats(),
        statsAPI.getMonthlyStats()
      ]);
      
      setWeeklyStats(weekly);
      setMonthlyStats(monthly);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStatsTable = (stats: Stats[], pointsKey: 'weekly_points' | 'monthly_points') => {
    if (stats.length === 0) {
      return (
        <div className="empty-stats">
          <p>No data available</p>
        </div>
      );
    }

    return (
      <div className="stats-table">
        <div className="stats-header">
          <div className="rank-header">Rank</div>
          <div className="name-header">Name</div>
          <div className="points-header">Points</div>
        </div>
        
        {stats.map((stat, index) => (
          <div key={stat.name} className="stats-row">
            <div className="rank">
              {index === 0 && '🥇'}
              {index === 1 && '🥈'}
              {index === 2 && '🥉'}
              {index > 2 && `#${index + 1}`}
            </div>
            <div className="name">{stat.name}</div>
            <div className="points">{stat[pointsKey] || 0}</div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading statistics...</div>;
  }

  return (
    <div className="statistics">
      <div className="statistics-header">
        <h1>Statistics</h1>
        <p>Track performance over time periods</p>
      </div>
      
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          Weekly Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          Monthly Overview
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'weekly' && (
          <div className="stats-section">
            <div className="section-header">
              <h2>Last 7 Days</h2>
              <p>Points earned in the past week</p>
            </div>
            {renderStatsTable(weeklyStats, 'weekly_points')}
          </div>
        )}
        
        {activeTab === 'monthly' && (
          <div className="stats-section">
            <div className="section-header">
              <h2>Last 30 Days</h2>
              <p>Points earned in the past month</p>
            </div>
            {renderStatsTable(monthlyStats, 'monthly_points')}
          </div>
        )}
      </div>
      
      <div className="statistics-summary">
        <div className="summary-card">
          <h3>Top Weekly Performer</h3>
          <div className="top-performer">
            {weeklyStats[0] ? (
              <>
                <span className="performer-name">{weeklyStats[0].name}</span>
                <span className="performer-points">{weeklyStats[0].weekly_points} pts</span>
              </>
            ) : (
              <span className="no-data">No data</span>
            )}
          </div>
        </div>
        
        <div className="summary-card">
          <h3>Top Monthly Performer</h3>
          <div className="top-performer">
            {monthlyStats[0] ? (
              <>
                <span className="performer-name">{monthlyStats[0].name}</span>
                <span className="performer-points">{monthlyStats[0].monthly_points} pts</span>
              </>
            ) : (
              <span className="no-data">No data</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;