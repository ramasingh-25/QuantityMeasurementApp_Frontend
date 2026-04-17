import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isLogin) {
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }
      setIsLoading(true);
      const result = await login(email, password);
      
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setError(result.error);
      }
    } else {
      if (!name || !email || !password || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      setIsLoading(true);
      const result = await signup(name, email, password);
      
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => setIsLogin(true), 2000);
      } else {
        setError(result.error);
      }
    }
    setIsLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', paddingTop: '40px' }}>
      <div className="card" style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Welcome Back</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Sign in to access your conversion history
        </p>

        {error && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '12px 16px', 
            background: 'rgba(239,68,68,0.1)', 
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px',
            marginBottom: '24px',
            color: '#ef4444',
            fontSize: '14px'
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '12px 16px', 
            background: 'rgba(34,197,94,0.1)', 
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '8px',
            marginBottom: '24px',
            color: '#22c55e',
            fontSize: '14px'
          }}>
            <AlertCircle size={18} />
            {success}
          </div>
        )}

        {/* Tab Switch */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
          <button
            className={`btn ${isLogin ? 'btn-accent' : 'btn-ghost'}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`btn ${!isLogin ? 'btn-accent' : 'btn-ghost'}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        {/* Login Form */}
        {isLogin ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', textAlign: 'left' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{ paddingLeft: '44px' }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', textAlign: 'left' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{ paddingLeft: '44px' }}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-accent"
              style={{ width: '100%' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="spinner" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', textAlign: 'left' }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', textAlign: 'left' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{ paddingLeft: '44px' }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', textAlign: 'left' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  style={{ paddingLeft: '44px' }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', textAlign: 'left' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  style={{ paddingLeft: '44px' }}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-accent"
              style={{ width: '100%' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="spinner" />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                </>
              )}
            </button>
          </form>
        )}

        <p style={{ marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                Sign Up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                Sign In
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;
