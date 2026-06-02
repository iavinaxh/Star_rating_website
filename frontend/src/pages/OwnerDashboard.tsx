import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Table, type Column } from '../components/Table';
import { RatingStars } from '../components/RatingStars';
import { 
  Lock, CheckCircle, AlertCircle, Users, Award 
} from 'lucide-react';

interface Reviewer {
  id: number;
  rating: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
    address: string;
  };
}

export const OwnerDashboard: React.FC = () => {
  const { apiCall } = useAuth();
  
  const [storeName, setStoreName] = useState('');
  const [averageRating, setAverageRating] = useState<number>(0);
  const [ratings, setRatings] = useState<Reviewer[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  // Sorting state
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Change Password state
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Fetch store owner dashboard stats
  const fetchDashboardData = async () => {
    setIsLoadingDashboard(true);
    try {
      const queryParams = new URLSearchParams();
      if (sortBy) {
        queryParams.set('sortBy', sortBy);
        queryParams.set('sortOrder', sortOrder);
      }
      const data = await apiCall(`/api/stores/owner-dashboard?${queryParams.toString()}`);
      setStoreName(data.storeName);
      setAverageRating(data.averageRating);
      setRatings(data.ratings);
    } catch (err: any) {
      console.error('Error fetching owner dashboard:', err);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [sortBy, sortOrder]);

  const handleSort = (key: string, order: 'ASC' | 'DESC') => {
    setSortBy(key);
    setSortOrder(order);
  };

  // Handle password update
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    // Password validation
    if (passwordForm.newPassword.length < 8 || passwordForm.newPassword.length > 16) {
      setPasswordError('Password must be between 8 and 16 characters.');
      return;
    }

    const hasUppercase = /[A-Z]/.test(passwordForm.newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordForm.newPassword);
    if (!hasUppercase || !hasSpecialChar) {
      setPasswordError('Password must include at least one uppercase letter and one special character.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await apiCall('/api/auth/update-password', {
        method: 'PATCH',
        body: JSON.stringify({ password: passwordForm.newPassword }),
      });
      setPasswordSuccess('Password updated successfully!');
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'name',
      label: 'Reviewer Name',
      sortable: true,
      render: (row) => row.user.name,
    },
    {
      key: 'email',
      label: 'Reviewer Email',
      sortable: true,
      render: (row) => row.user.email,
    },
    {
      key: 'address',
      label: 'Address',
      render: (row) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {row.user.address}
        </span>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <RatingStars rating={row.rating} size={16} />
          <span className="rating-value-badge" style={{ padding: '0.1rem 0.35rem', fontSize: '0.75rem' }}>
            {row.rating}
          </span>
        </div>
      ),
    },
    {
      key: 'comment',
      label: 'Review Comment',
      render: (row) => (
        <span style={{ fontSize: '0.85rem', color: row.comment ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: row.comment ? 'normal' : 'italic' }}>
          {row.comment || 'No comment provided'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Submitted Date',
      sortable: true,
      render: (row) => new Date(row.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }),
    },
  ];

  return (
    <div className="slide-up">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Store Owner Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', width: '100%', marginTop: '-1rem' }}>
          {storeName ? `Managing store: "${storeName}"` : 'Loading associated store details...'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        
        {/* Main Dashboard Section */}
        <div style={{ gridColumn: 'span 2' }}>
          
          {/* Average Rating Hero Card */}
          <div className="card owner-card-hero" style={{ marginBottom: '1.5rem', borderRadius: '16px' }}>
            <Award size={36} color="var(--warning)" style={{ marginBottom: '0.5rem' }} />
            <div className="owner-big-rating">
              {averageRating > 0 ? averageRating : '0.0'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <RatingStars rating={Math.round(averageRating)} size={28} />
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              Store Average Rating (calculated from {ratings.length} user reviews)
            </p>
          </div>

          {/* List of Reviews Table */}
          <div className="card">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} color="var(--accent)" />
              User Submissions
            </h2>

            <Table
              columns={columns}
              data={ratings}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              isLoading={isLoadingDashboard}
              emptyMessage="No users have rated your store yet."
            />
          </div>
        </div>

        {/* Change Password Sidebar */}
        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} color="var(--accent)" />
            Security Settings
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Update your account password. Passwords require 8-16 characters with at least one uppercase letter and one special character.
          </p>

          {passwordError && (
            <div className="alert alert-error" style={{ padding: '0.75rem' }}>
              <AlertCircle size={16} />
              <span style={{ fontSize: '0.8rem' }}>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="alert alert-success" style={{ padding: '0.75rem' }}>
              <CheckCircle size={16} />
              <span style={{ fontSize: '0.8rem' }}>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                disabled={isUpdatingPassword}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                disabled={isUpdatingPassword}
                required
              />
            </div>

            <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={isUpdatingPassword}>
              {isUpdatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default OwnerDashboard;
