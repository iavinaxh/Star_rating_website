import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { RatingStars } from '../components/RatingStars';
import { 
  Search, Lock, CheckCircle, AlertCircle, Store as StoreIcon, Star, 
  MapPin, ShieldCheck, ArrowUpDown, X, MessageSquare 
} from 'lucide-react';

interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  overallRating: number;
  userSubmittedRating: number | null;
  userSubmittedComment: string | null;
}

export const UserDashboard: React.FC = () => {
  const { apiCall, user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  // Search & Sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  // Change Password state
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Inline review states
  const [activeReviewStoreId, setActiveReviewStoreId] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // View reviews states
  const [visibleReviewsStoreId, setVisibleReviewsStoreId] = useState<number | null>(null);
  const [storeReviews, setStoreReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // Load registered stores list
  const fetchStores = async () => {
    setIsLoadingStores(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.set('name', searchTerm);
      if (searchAddress) queryParams.set('address', searchAddress);
      if (sortBy) {
        queryParams.set('sortBy', sortBy);
        queryParams.set('sortOrder', sortOrder);
      }
      const data = await apiCall(`/api/stores?${queryParams.toString()}`);
      setStores(data);
    } catch (err) {
      console.error('Error loading stores:', err);
    } finally {
      setIsLoadingStores(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [searchTerm, searchAddress, sortBy, sortOrder]);

  const handleToggleReviewForm = (store: Store) => {
    if (activeReviewStoreId === store.id) {
      setActiveReviewStoreId(null);
      setReviewRating(0);
      setReviewComment('');
      setReviewError(null);
    } else {
      setActiveReviewStoreId(store.id);
      setReviewRating(store.userSubmittedRating || 0);
      setReviewComment(store.userSubmittedComment || '');
      setReviewError(null);
    }
  };

  const handleToggleViewReviews = async (storeId: number) => {
    if (visibleReviewsStoreId === storeId) {
      setVisibleReviewsStoreId(null);
      setStoreReviews([]);
    } else {
      setVisibleReviewsStoreId(storeId);
      setIsLoadingReviews(true);
      try {
        const data = await apiCall(`/api/stores/${storeId}/reviews`);
        setStoreReviews(data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setIsLoadingReviews(false);
      }
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent, storeId: number) => {
    e.preventDefault();

    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError('Please select a rating between 1 and 5 stars.');
      return;
    }

    if (reviewComment.length > 500) {
      setReviewError('Comment cannot exceed 500 characters.');
      return;
    }

    setIsSubmittingReview(true);
    setReviewError(null);

    try {
      await apiCall('/api/ratings', {
        method: 'POST',
        body: JSON.stringify({
          storeId,
          rating: reviewRating,
          comment: reviewComment.trim() || undefined,
        }),
      });
      // Refresh the stores list to show updated ratings/comments
      await fetchStores();
      // Close form
      setActiveReviewStoreId(null);
      setReviewRating(0);
      setReviewComment('');
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
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

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
  };

  return (
    <div className="slide-up">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome, {user?.name.split(' ')[0]}</h1>
        <p style={{ color: 'var(--text-secondary)', width: '100%', marginTop: '-1rem' }}>
          Explore stores and submit your ratings (1 - 5 stars).
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Double Columns on Desktop */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          
          {/* Main Store Listing Section */}
          <div style={{ gridColumn: 'span 2' }}>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <StoreIcon size={18} color="var(--accent)" />
                Browse Stores
              </h2>

              {/* Filtering Toolbar */}
              <div className="toolbar" style={{ marginBottom: '1.5rem' }}>
                <div className="search-input-wrapper">
                  <Search className="search-icon" size={16} />
                  <input
                    type="text"
                    placeholder="Search by store name..."
                    className="form-control"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Filter by address..."
                  className="form-control"
                  style={{ flex: 1, minWidth: '180px' }}
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '0.5rem', flex: '0 0 auto' }}>
                  <select
                    className="form-control"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="name">Sort by Name</option>
                    <option value="address">Sort by Address</option>
                    <option value="rating">Sort by Rating</option>
                  </select>
                  <button className="btn btn-secondary" onClick={toggleSortOrder} title="Toggle Sort Direction">
                    <ArrowUpDown size={16} />
                  </button>
                </div>
              </div>

              {/* Store Grid */}
              {isLoadingStores ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  Loading stores...
                </div>
              ) : stores.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No registered stores found matching your search.
                </div>
              ) : (
                <div className="store-grid">
                  {stores.map((store) => {
                    const hasRated = store.userSubmittedRating !== null;
                    return (
                      <div key={store.id} className="card store-card">
                        <div className="store-card-header">
                          <h3 className="store-name">{store.name}</h3>
                          <div className="store-address" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.25rem' }}>
                            <MapPin size={14} style={{ flexShrink: 0, marginTop: '0.2rem', color: 'var(--text-muted)' }} />
                            <span>{store.address}</span>
                          </div>
                        </div>

                        <div>
                          {/* Overall Rating Display */}
                          <div className="rating-row">
                            <span className="rating-label">Overall Rating:</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <RatingStars rating={Math.round(store.overallRating)} />
                              <span className="rating-value-badge">
                                <Star size={11} fill="#f59e0b" color="#f59e0b" />
                                {store.overallRating > 0 ? store.overallRating : 'N/A'}
                              </span>
                            </div>
                          </div>

                          {/* User submitted rating */}
                          <div className="user-rating-box" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '8px', border: 'var(--glass-border)', textAlign: 'left' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                              {hasRated ? "Your Rating & Review" : "You haven't rated this store"}
                            </span>

                            {hasRated ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <RatingStars rating={store.userSubmittedRating || 0} size={16} />
                                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', marginLeft: '0.25rem' }}>
                                    ({store.userSubmittedRating}/5)
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: store.userSubmittedComment ? 'normal' : 'italic', wordBreak: 'break-word', background: 'rgba(0,0,0,0.15)', padding: '0.5rem 0.75rem', borderRadius: '6px', minHeight: '34px' }}>
                                  {store.userSubmittedComment ? `"${store.userSubmittedComment}"` : 'No written review comment.'}
                                </div>
                                {activeReviewStoreId !== store.id && (
                                  <button className="btn btn-secondary" onClick={() => handleToggleReviewForm(store)} style={{ width: '100%', fontSize: '0.75rem', padding: '0.4rem', marginTop: '0.25rem' }}>
                                    Edit Rating & Review
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                <RatingStars rating={0} size={20} />
                                {activeReviewStoreId !== store.id && (
                                  <button className="btn btn-primary" onClick={() => handleToggleReviewForm(store)} style={{ width: '100%', fontSize: '0.75rem', padding: '0.4rem', marginTop: '0.25rem' }}>
                                    Rate & Review
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Inline Rating & Comment Form */}
                            {activeReviewStoreId === store.id && (
                              <form onSubmit={(e) => handleReviewSubmit(e, store.id)} style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }} className="slide-up">
                                {reviewError && (
                                  <div className="alert alert-error" style={{ padding: '0.5rem', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
                                    <AlertCircle size={14} />
                                    <span>{reviewError}</span>
                                  </div>
                                )}
                                
                                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.15)', padding: '0.75rem', borderRadius: '6px', marginBottom: '0.75rem' }}>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Your Rating</span>
                                  <RatingStars
                                    rating={reviewRating}
                                    interactive={true}
                                    onChange={(val) => setReviewRating(val)}
                                    size={24}
                                  />
                                </div>

                                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                                  <label className="form-label" htmlFor={`comment-${store.id}`} style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span>Comment (Optional)</span>
                                    <span style={{ color: reviewComment.length <= 500 ? 'var(--text-muted)' : 'var(--danger)' }}>
                                      {reviewComment.length}/500
                                    </span>
                                  </label>
                                  <textarea
                                    id={`comment-${store.id}`}
                                    className="form-control"
                                    rows={3}
                                    placeholder="Write your review comment here..."
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    maxLength={500}
                                    disabled={isSubmittingReview}
                                    style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                                  />
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => handleToggleReviewForm(store)}
                                    disabled={isSubmittingReview}
                                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isSubmittingReview || reviewRating === 0}
                                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }}
                                  >
                                    {isSubmittingReview ? 'Saving...' : 'Submit'}
                                  </button>
                                </div>
                              </form>
                            )}
                          </div>

                          {/* View All Reviews Button & List */}
                          <div style={{ marginTop: '0.75rem' }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => handleToggleViewReviews(store.id)}
                              style={{ width: '100%', fontSize: '0.8rem', padding: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                            >
                              <MessageSquare size={14} />
                              {visibleReviewsStoreId === store.id ? 'Hide Reviews' : 'View Reviews'}
                            </button>

                            {visibleReviewsStoreId === store.id && (
                              <div style={{ marginTop: '0.75rem', background: 'rgba(0,0,0,0.15)', padding: '0.75rem', borderRadius: '8px', border: 'var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }} className="slide-up">
                                <h4 style={{ fontSize: '0.8rem', fontWeight: '600', margin: '0 0 0.25rem 0', color: 'var(--accent)' }}>
                                  User Reviews
                                </h4>
                                {isLoadingReviews ? (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem' }}>
                                    Loading reviews...
                                  </div>
                                ) : storeReviews.length === 0 ? (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '0.5rem' }}>
                                    No reviews submitted yet.
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                                    {storeReviews.map((rev) => (
                                      <div key={rev.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                            {rev.user.name}
                                          </span>
                                          <RatingStars rating={rev.rating} size={12} />
                                        </div>
                                        {rev.comment ? (
                                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic', wordBreak: 'break-word' }}>
                                            "{rev.comment}"
                                          </p>
                                        ) : (
                                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Rated without comment.</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Change Password Section */}
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

    </div>
  );
};

export default UserDashboard;
