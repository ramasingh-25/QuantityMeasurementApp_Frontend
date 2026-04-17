import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  History as HistoryIcon, RefreshCw, Ruler, Weight, Thermometer, Beaker,
  ArrowRight, LogIn
} from 'lucide-react';

const API_URL = 'http://localhost:5263/api';

const getCategoryIcon = (measurementType) => {
  switch (measurementType?.toLowerCase()) {
    case 'length': return Ruler;
    case 'weight': return Weight;
    case 'temperature': return Thermometer;
    case 'volume': return Beaker;
    default: return Ruler;
  }
};

const getCategoryColor = (measurementType) => {
  switch (measurementType?.toLowerCase()) {
    case 'length': return '#00d4ff';
    case 'weight': return '#7b61ff';
    case 'temperature': return '#ff6b6b';
    case 'volume': return '#10b981';
    default: return '#00d4ff';
  }
};

const getTimeAgo = (date) => {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

const History = () => {
  const { token, isGuest } = useAuth();
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [operationFilter, setOperationFilter] = useState('all');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadHistory = async () => {
    if (isGuest || !token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/v1/quantities/history/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const items = data.Data || data.data || [];
        setHistoryData(items);
      } else {
        const errorText = await response.text();
        setError('Failed to load history');
        showToast('Failed to load history', 'error');
      }
    } catch (error) {
      setError('Connection error');
      showToast('Connection error', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [token]);

  const filteredData = historyData.filter(item => {
    const categoryMatch = categoryFilter === 'all' || item.measurementType?.toLowerCase() === categoryFilter;
    const operationMatch = operationFilter === 'all' || item.operation?.toLowerCase() === operationFilter;
    return categoryMatch && operationMatch;
  });

  const getOperationBadgeColor = (operation) => {
    switch (operation?.toUpperCase()) {
      case 'CONVERT': return '#00d4ff';
      case 'ADD': return '#10b981';
      case 'SUBTRACT': return '#f59e0b';
      case 'COMPARE': return '#7b61ff';
      case 'DIVIDE': return '#ff6b6b';
      default: return 'var(--text-secondary)';
    }
  };

  if (isGuest || !token) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '40px' }}>
        {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
        
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'rgba(0,212,255,0.1)', 
            border: '1px solid rgba(0,212,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <LogIn size={40} color="#00d4ff" />
          </div>
          
          <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Login Required</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
            Please login to view your conversion history
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <a href="/login" className="btn btn-accent">
              <LogIn size={18} style={{ marginRight: '8px' }} />
              Login / Sign Up
            </a>
            <a href="/dashboard" className="btn btn-ghost">
              Continue as Guest
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '24px' }}>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      {/* Header */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <HistoryIcon size={24} color="var(--accent)" />
              Conversion History
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              {historyData.length} total conversions
            </p>
          </div>
          
          <button 
            className="btn btn-ghost"
            onClick={loadHistory}
            disabled={loading}
          >
            <RefreshCw size={16} style={{ marginRight: '8px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              Category
            </label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              <option value="length">Length</option>
              <option value="weight">Weight</option>
              <option value="temperature">Temperature</option>
              <option value="volume">Volume</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              Operation
            </label>
            <select value={operationFilter} onChange={(e) => setOperationFilter(e.target.value)}>
              <option value="all">All Operations</option>
              <option value="convert">Convert</option>
              <option value="add">Add</option>
              <option value="subtract">Subtract</option>
              <option value="compare">Compare</option>
              <option value="divide">Divide</option>
            </select>
          </div>
        </div>
      </div>

      {/* History List */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading history...</p>
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <div className="empty-title">Error Loading History</div>
            <div className="empty-text">{error}</div>
            <button className="btn btn-accent" onClick={loadHistory}>Try Again</button>
          </div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div className="empty-state">
            <div className="empty-icon">history</div>
            <div className="empty-title">No History Found</div>
            <div className="empty-text">
              {historyData.length === 0 
                ? "Start performing conversions to see your history here."
                : "No conversions match your filters."
              }
            </div>
            <a href="/dashboard" className="btn btn-accent">
              Go to Dashboard
              <ArrowRight size={16} style={{ marginLeft: '8px' }} />
            </a>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredData.map((item, index) => {
            const Icon = getCategoryIcon(item.measurementType);
            const color = getCategoryColor(item.measurementType);
            const opColor = getOperationBadgeColor(item.operation);
            const date = new Date(item.createdAt || item.timestamp || Date.now());
            const timeAgo = getTimeAgo(date);

            return (
              <div key={index} className="history-item">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '10px', 
                      background: `${color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={20} color={color} />
                    </div>
                    
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span 
                          style={{ 
                            fontSize: '12px', 
                            padding: '2px 8px', 
                            borderRadius: '4px', 
                            background: `${opColor}20`,
                            color: opColor,
                            textTransform: 'uppercase',
                            fontWeight: '600'
                          }}
                        >
                          {item.operation}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {timeAgo}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: '14px', fontFamily: 'DM Mono, monospace' }}>
                        {item.operation?.toUpperCase() === 'CONVERT' ? (
                          <>
                            {item.firstValue} {item.firstUnit} → {item.result} {item.secondUnit}
                          </>
                        ) : item.operation?.toUpperCase() === 'COMPARE' ? (
                          <>
                            {item.firstValue} {item.firstUnit} vs {item.secondValue} {item.secondUnit}
                          </>
                        ) : (
                          <>
                            {item.firstValue} {item.firstUnit} {item.operation?.toLowerCase()} {item.secondValue} {item.secondUnit} = {item.result} {item.firstUnit}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {item.result && (
                    <div className="history-item-result">
                      {item.result}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
