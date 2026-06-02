import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { LogIn, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, apiCall } = useAuth();
  const navigate = useNavigate();

  // Forgot Password modal state
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const validateForm = (): boolean => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      login(res.accessToken, res.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      setForgotError('Please enter a valid email address.');
      return;
    }

    setIsResetting(true);
    try {
      const res = await apiCall('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: forgotEmail }),
      });
      setForgotSuccess(
        `Success! Your password has been reset. Use this temporary password to log in: ${res.tempPassword}`
      );
      setForgotEmail('');
    } catch (err: any) {
      setForgotError(err.message || 'Failed to reset password.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="auth-page fade-in">
      <div className="card auth-card">
        <div className="auth-header">
          <div className="navbar-logo" style={{ justifyContent: 'center', marginBottom: '1rem', fontSize: '1.75rem' }}>
            StoreRating
          </div>
          <h2>Welcome Back</h2>
          <p>Login to submit ratings or manage stores</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="search-input-wrapper" style={{ width: '100%' }}>
              <Mail className="search-icon" size={18} />
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
              <span 
                onClick={() => {
                  setForgotEmail('');
                  setForgotError(null);
                  setForgotSuccess(null);
                  setIsForgotOpen(true);
                }}
                style={{ float: 'right', fontSize: '0.8rem', color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}
              >
                Forgot Password?
              </span>
            </label>
            <div className="search-input-wrapper" style={{ width: '100%' }}>
              <Lock className="search-icon" size={18} />
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
            {!isLoading && <LogIn size={16} />}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ fontWeight: '500' }}>Register here</Link>
        </div>
      </div>

      {/* Modal: Forgot Password */}
      <Modal 
        isOpen={isForgotOpen} 
        title="Recover Password" 
        onClose={() => setIsForgotOpen(false)}
      >
        {forgotError && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{forgotError}</span>
          </div>
        )}
        {forgotSuccess && (
          <div className="alert alert-success" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} />
              <span style={{ fontWeight: 600 }}>Password Reset!</span>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>{forgotSuccess}</p>
          </div>
        )}
        <form onSubmit={handleForgotSubmit}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Enter your registered email address. We will reset your account password and provide you with a temporary access key instantly.
          </p>
          <div className="form-group">
            <label className="form-label" htmlFor="forgotEmail">Email Address</label>
            <div className="search-input-wrapper" style={{ width: '100%' }}>
              <Mail className="search-icon" size={18} />
              <input
                id="forgotEmail"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                disabled={isResetting || !!forgotSuccess}
                required
              />
            </div>
          </div>
          <div className="modal-footer" style={{ padding: '1rem 0 0 0', border: 'none' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setIsForgotOpen(false)}
              disabled={isResetting}
            >
              Close
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isResetting || !!forgotSuccess}
            >
              {isResetting ? 'Processing...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Login;
