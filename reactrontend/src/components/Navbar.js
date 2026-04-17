import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, History, Calculator, Home } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link to="/" className="nav-brand">
          Universal Converter
        </Link>

        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            <Home size={16} style={{ marginRight: '6px' }} />
            Home
          </Link>
          
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
            <Calculator size={16} style={{ marginRight: '6px' }} />
            Dashboard
          </Link>
          
          <Link to="/history" className={`nav-link ${isActive('/history')}`}>
            <History size={16} style={{ marginRight: '6px' }} />
            History
          </Link>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="user-chip">
                <User size={16} color="var(--accent)" />
                <span>{user?.name || user?.email || 'User'}</span>
              </div>
              <button 
                className="btn btn-ghost"
                onClick={logout}
                style={{ padding: '8px 12px' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" className="btn btn-ghost">
                Login
              </Link>
              <Link to="/signup" className="btn btn-accent">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
