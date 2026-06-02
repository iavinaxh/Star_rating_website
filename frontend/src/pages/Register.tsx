import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User as UserIcon, MapPin, AlertCircle, CheckCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { apiCall } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    // Name validation
    if (name.length < 2 || name.length > 60) {
      setError(`Name must be between 2 and 60 characters. Current length: ${name.length} characters.`);
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    // Address validation
    if (!address) {
      setError('Address is required.');
      return false;
    }
    if (address.length > 400) {
      setError(`Address must not exceed 400 characters. Current length: ${address.length} characters.`);
      return false;
    }

    // Password validation
    if (password.length < 8 || password.length > 16) {
      setError('Password must be between 8 and 16 characters.');
      return false;
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    if (!hasUppercase || !hasSpecialChar) {
      setError('Password must include at least one uppercase letter and one special character.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await apiCall('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, address, password }),
      });
      setSuccess('Registration successful! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page fade-in">
      <div className="card auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <div className="navbar-logo" style={{ justifyContent: 'center', marginBottom: '1rem', fontSize: '1.75rem' }}>
            StoreRating
          </div>
          <h2>Create Account</h2>
          <p>Register as a normal user to start rating stores</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name 
              <span style={{ float: 'right', fontSize: '0.75rem', color: name.length >= 2 && name.length <= 60 ? 'var(--success)' : 'var(--text-muted)' }}>
                {name.length}/60 chars (min 2)
              </span>
            </label>
            <div className="search-input-wrapper" style={{ width: '100%' }}>
              <UserIcon className="search-icon" size={18} />
              <input
                id="name"
                type="text"
                className="form-control"
                placeholder="e.g. Professor Alexander Sebastian"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading || !!success}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="search-input-wrapper" style={{ width: '100%' }}>
              <Mail className="search-icon" size={18} />
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="alexander@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || !!success}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">
              Address
              <span style={{ float: 'right', fontSize: '0.75rem', color: address.length <= 400 ? 'var(--text-muted)' : 'var(--danger)' }}>
                {address.length}/400 chars
              </span>
            </label>
            <div className="search-input-wrapper" style={{ width: '100%' }}>
              <MapPin className="search-icon" size={18} style={{ top: '1.25rem', transform: 'none' }} />
              <textarea
                id="address"
                className="form-control"
                rows={3}
                placeholder="Enter your complete residential address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isLoading || !!success}
                style={{ paddingLeft: '2.25rem', resize: 'vertical' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password (8-16 chars, 1 uppercase, 1 special)</label>
            <div className="search-input-wrapper" style={{ width: '100%' }}>
              <Lock className="search-icon" size={18} />
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || !!success}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div className="search-input-wrapper" style={{ width: '100%' }}>
              <Lock className="search-icon" size={18} />
              <input
                id="confirmPassword"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading || !!success}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading || !!success}>
            {isLoading ? 'Creating Account...' : 'Register'}
            {!isLoading && <UserPlus size={16} />}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: '500' }}>Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
