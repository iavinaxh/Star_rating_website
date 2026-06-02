import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Table, type Column } from '../components/Table';
import { Modal } from '../components/Modal';
import { RatingStars } from '../components/RatingStars';
import { 
  Users, Store as StoreIcon, Star, Plus, Eye, Search, AlertCircle, CheckCircle
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

export const AdminDashboard: React.FC = () => {
  const { apiCall } = useAuth();

  // Active Tab: 'users' | 'stores'
  const [activeTab, setActiveTab] = useState<'users' | 'stores'>('users');
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalStores: 0, totalRatings: 0 });

  // Users Management state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userFilters, setUserFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [userSort, setUserSort] = useState<{ field: string; order: 'ASC' | 'DESC' }>({ field: 'id', order: 'DESC' });
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Stores Management state
  const [storesList, setStoresList] = useState<any[]>([]);
  const [storeFilters, setStoreFilters] = useState({ name: '', address: '' });
  const [storeSort, setStoreSort] = useState<{ field: string; order: 'ASC' | 'DESC' }>({ field: 'id', order: 'DESC' });
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  // Add User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [addUserForm, setAddUserForm] = useState({ name: '', email: '', address: '', password: '', role: 'user' });
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [addUserSuccess, setAddUserSuccess] = useState<string | null>(null);
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Add Store Modal State
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [addStoreForm, setAddStoreForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [addStoreError, setAddStoreError] = useState<string | null>(null);
  const [addStoreSuccess, setAddStoreSuccess] = useState<string | null>(null);
  const [isSavingStore, setIsSavingStore] = useState(false);
  const [availableOwners, setAvailableOwners] = useState<any[]>([]);

  // User Details Modal State
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Load Admin stats
  const fetchStats = async () => {
    try {
      const data = await apiCall('/api/users/dashboard/stats');
      setStats(data);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    }
  };

  // Load Users List
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const queryParams = new URLSearchParams();
      if (userFilters.name) queryParams.set('name', userFilters.name);
      if (userFilters.email) queryParams.set('email', userFilters.email);
      if (userFilters.address) queryParams.set('address', userFilters.address);
      if (userFilters.role) queryParams.set('role', userFilters.role);
      if (userSort.field) {
        queryParams.set('sortBy', userSort.field);
        queryParams.set('sortOrder', userSort.order);
      }

      const data = await apiCall(`/api/users?${queryParams.toString()}`);
      setUsersList(data);
    } catch (err) {
      console.error('Error loading users list:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Load Stores List
  const fetchStores = async () => {
    setIsLoadingStores(true);
    try {
      const queryParams = new URLSearchParams();
      if (storeFilters.name) queryParams.set('name', storeFilters.name);
      if (storeFilters.address) queryParams.set('address', storeFilters.address);
      if (storeSort.field) {
        queryParams.set('sortBy', storeSort.field);
        queryParams.set('sortOrder', storeSort.order);
      }

      const data = await apiCall(`/api/stores?${queryParams.toString()}`);
      setStoresList(data);
    } catch (err) {
      console.error('Error loading stores list:', err);
    } finally {
      setIsLoadingStores(false);
    }
  };

  // Fetch store owners for store creation linking
  const fetchAvailableOwners = async () => {
    try {
      // Find all owners
      const data = await apiCall('/api/users?role=owner');
      // Filter out those who already own a store (unless we editing)
      const freeOwners = data.filter((owner: any) => !owner.store);
      setAvailableOwners(freeOwners);
    } catch (err) {
      console.error('Error loading store owners:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchStores();
    }
  }, [activeTab, userFilters, userSort, storeFilters, storeSort]);

  // Handle User Table Sort
  const handleUserSort = (key: string, order: 'ASC' | 'DESC') => {
    setUserSort({ field: key, order });
  };

  // Handle Store Table Sort
  const handleStoreSort = (key: string, order: 'ASC' | 'DESC') => {
    setStoreSort({ field: key, order });
  };

  // Handle View User Details
  const handleViewDetails = async (userId: number) => {
    setIsDetailsOpen(true);
    setIsLoadingDetails(true);
    setSelectedUserDetails(null);
    try {
      const details = await apiCall(`/api/users/${userId}`);
      setSelectedUserDetails(details);
    } catch (err) {
      console.error('Error loading user details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Form Validation for User Creation
  const validateUserForm = (): boolean => {
    if (addUserForm.name.length < 2 || addUserForm.name.length > 60) {
      setAddUserError(`Name must be 2 to 60 characters. Current length: ${addUserForm.name.length}`);
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addUserForm.email)) {
      setAddUserError('Please enter a valid email address.');
      return false;
    }
    if (!addUserForm.address || addUserForm.address.length > 400) {
      setAddUserError('Address is required and must be maximum 400 characters.');
      return false;
    }
    if (addUserForm.password.length < 8 || addUserForm.password.length > 16) {
      setAddUserError('Password must be between 8 and 16 characters.');
      return false;
    }
    const hasUppercase = /[A-Z]/.test(addUserForm.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_+\-=\[\]{};':"\\|,.<>\/?]/.test(addUserForm.password);
    if (!hasUppercase || !hasSpecialChar) {
      setAddUserError('Password must include at least one uppercase letter and one special character.');
      return false;
    }
    return true;
  };

  // Handle Create User Submit
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError(null);
    setAddUserSuccess(null);

    if (!validateUserForm()) return;

    setIsSavingUser(true);
    try {
      await apiCall('/api/users', {
        method: 'POST',
        body: JSON.stringify(addUserForm),
      });
      setAddUserSuccess('User added successfully!');
      setAddUserForm({ name: '', email: '', address: '', password: '', role: 'user' });
      fetchUsers();
      fetchStats();
      setTimeout(() => {
        setIsAddUserOpen(false);
        setAddUserSuccess(null);
      }, 1500);
    } catch (err: any) {
      setAddUserError(err.message || 'Failed to create user.');
    } finally {
      setIsSavingUser(false);
    }
  };

  // Form Validation for Store Creation
  const validateStoreForm = (): boolean => {
    if (addStoreForm.name.length < 2 || addStoreForm.name.length > 60) {
      setAddStoreError(`Store Name must be 2 to 60 characters. Current length: ${addStoreForm.name.length}`);
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addStoreForm.email)) {
      setAddStoreError('Please enter a valid store email address.');
      return false;
    }
    if (!addStoreForm.address || addStoreForm.address.length > 400) {
      setAddStoreError('Store Address is required and must be maximum 400 characters.');
      return false;
    }
    return true;
  };

  // Handle Create Store Submit
  const handleAddStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddStoreError(null);
    setAddStoreSuccess(null);

    if (!validateStoreForm()) return;

    setIsSavingStore(true);
    try {
      const payload: any = {
        name: addStoreForm.name,
        email: addStoreForm.email,
        address: addStoreForm.address,
      };
      if (addStoreForm.ownerId) {
        payload.ownerId = parseInt(addStoreForm.ownerId, 10);
      }

      await apiCall('/api/stores', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setAddStoreSuccess('Store registered successfully!');
      setAddStoreForm({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
      fetchStats();
      setTimeout(() => {
        setIsAddStoreOpen(false);
        setAddStoreSuccess(null);
      }, 1500);
    } catch (err: any) {
      setAddStoreError(err.message || 'Failed to create store.');
    } finally {
      setIsSavingStore(false);
    }
  };

  // Columns for Users table
  const userColumns: Column<any>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (row) => (
        <span className={`role-badge role-${row.role}`}>
          {row.role === 'owner' ? 'Store Owner' : row.role}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleViewDetails(row.id)}>
          <Eye size={14} /> Details
        </button>
      ),
    },
  ];

  // Columns for Stores table
  const storeColumns: Column<any>[] = [
    { key: 'name', label: 'Store Name', sortable: true },
    { key: 'email', label: 'Store Email', sortable: true },
    { key: 'address', label: 'Store Address', sortable: true },
    {
      key: 'overallRating',
      label: 'Overall Rating',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RatingStars rating={Math.round(row.overallRating)} />
          <span className="rating-value-badge">
            <Star size={12} fill="#f59e0b" color="#f59e0b" />
            {row.overallRating > 0 ? row.overallRating : 'N/A'}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="slide-up">
      <div className="dashboard-header">
        <h1 className="dashboard-title">System Administrator Dashboard</h1>
      </div>

      {/* Stats Widgets */}
      <div className="grid-stats">
        <div className="card stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon">
            <StoreIcon size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.totalStores}</div>
            <div className="stat-label">Registered Stores</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon">
            <Star size={24} style={{ color: 'var(--warning)' }} />
          </div>
          <div>
            <div className="stat-value">{stats.totalRatings}</div>
            <div className="stat-label">Submitted Ratings</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users Management
        </button>
        <button
          className={`tab-btn ${activeTab === 'stores' ? 'active' : ''}`}
          onClick={() => setActiveTab('stores')}
        >
          Stores Management
        </button>
      </div>

      {/* Tab Contents: Users */}
      {activeTab === 'users' && (
        <div className="card fade-in">
          {/* User Filtering Toolbar */}
          <div className="toolbar">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="Filter by name..."
                className="form-control"
                value={userFilters.name}
                onChange={(e) => setUserFilters({ ...userFilters, name: e.target.value })}
              />
            </div>
            <input
              type="text"
              placeholder="Filter by email..."
              className="form-control"
              style={{ flex: 1, minWidth: '200px' }}
              value={userFilters.email}
              onChange={(e) => setUserFilters({ ...userFilters, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Filter by address..."
              className="form-control"
              style={{ flex: 1, minWidth: '200px' }}
              value={userFilters.address}
              onChange={(e) => setUserFilters({ ...userFilters, address: e.target.value })}
            />
            <select
              className="form-control"
              style={{ flex: '0 0 150px' }}
              value={userFilters.role}
              onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
            >
              <option value="">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="user">Normal User</option>
              <option value="owner">Store Owner</option>
            </select>
            <button className="btn btn-primary" onClick={() => setIsAddUserOpen(true)}>
              <Plus size={16} /> Add User
            </button>
          </div>

          <Table
            columns={userColumns}
            data={usersList}
            sortBy={userSort.field}
            sortOrder={userSort.order}
            onSort={handleUserSort}
            isLoading={isLoadingUsers}
            emptyMessage="No users match the active filters."
          />
        </div>
      )}

      {/* Tab Contents: Stores */}
      {activeTab === 'stores' && (
        <div className="card fade-in">
          {/* Store Filtering Toolbar */}
          <div className="toolbar">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="Filter by store name..."
                className="form-control"
                value={storeFilters.name}
                onChange={(e) => setStoreFilters({ ...storeFilters, name: e.target.value })}
              />
            </div>
            <input
              type="text"
              placeholder="Filter by store address..."
              className="form-control"
              style={{ flex: 1, minWidth: '260px' }}
              value={storeFilters.address}
              onChange={(e) => setStoreFilters({ ...storeFilters, address: e.target.value })}
            />
            <button className="btn btn-primary" onClick={() => { fetchAvailableOwners(); setIsAddStoreOpen(true); }}>
              <Plus size={16} /> Register Store
            </button>
          </div>

          <Table
            columns={storeColumns}
            data={storesList}
            sortBy={storeSort.field}
            sortOrder={storeSort.order}
            onSort={handleStoreSort}
            isLoading={isLoadingStores}
            emptyMessage="No stores match the active filters."
          />
        </div>
      )}

      {/* Modal: Add User */}
      <Modal isOpen={isAddUserOpen} title="Register New User" onClose={() => setIsAddUserOpen(false)}>
        {addUserError && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{addUserError}</span>
          </div>
        )}
        {addUserSuccess && (
          <div className="alert alert-success">
            <CheckCircle size={18} />
            <span>{addUserSuccess}</span>
          </div>
        )}
        <form onSubmit={handleAddUserSubmit}>
          <div className="form-group">
            <label className="form-label">
              Full Name 
              <span style={{ float: 'right', fontSize: '0.75rem', color: addUserForm.name.length >= 2 && addUserForm.name.length <= 60 ? 'var(--success)' : 'var(--text-muted)' }}>
                {addUserForm.name.length}/60 chars (min 2)
              </span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Professor Alexander Sebastian"
              value={addUserForm.name}
              onChange={(e) => setAddUserForm({ ...addUserForm, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="user@example.com"
              value={addUserForm.email}
              onChange={(e) => setAddUserForm({ ...addUserForm, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className="form-control"
              value={addUserForm.role}
              onChange={(e) => setAddUserForm({ ...addUserForm, role: e.target.value })}
            >
              <option value="user">Normal User</option>
              <option value="admin">System Administrator</option>
              <option value="owner">Store Owner</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">
              Address
              <span style={{ float: 'right', fontSize: '0.75rem', color: addUserForm.address.length <= 400 ? 'var(--text-muted)' : 'var(--danger)' }}>
                {addUserForm.address.length}/400 chars
              </span>
            </label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Enter complete residential address..."
              value={addUserForm.address}
              onChange={(e) => setAddUserForm({ ...addUserForm, address: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password (8-16 chars, 1 uppercase, 1 special)</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={addUserForm.password}
              onChange={(e) => setAddUserForm({ ...addUserForm, password: e.target.value })}
              required
            />
          </div>
          <div className="modal-footer" style={{ padding: '1rem 0 0 0', border: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddUserOpen(false)} disabled={isSavingUser}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSavingUser}>
              {isSavingUser ? 'Saving...' : 'Add User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Store */}
      <Modal isOpen={isAddStoreOpen} title="Register New Store" onClose={() => setIsAddStoreOpen(false)}>
        {addStoreError && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{addStoreError}</span>
          </div>
        )}
        {addStoreSuccess && (
          <div className="alert alert-success">
            <CheckCircle size={18} />
            <span>{addStoreSuccess}</span>
          </div>
        )}
        <form onSubmit={handleAddStoreSubmit}>
          <div className="form-group">
            <label className="form-label">
              Store Name 
              <span style={{ float: 'right', fontSize: '0.75rem', color: addStoreForm.name.length >= 2 && addStoreForm.name.length <= 60 ? 'var(--success)' : 'var(--text-muted)' }}>
                {addStoreForm.name.length}/60 chars (min 2)
              </span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Elegant Delights Sweet Shop"
              value={addStoreForm.name}
              onChange={(e) => setAddStoreForm({ ...addStoreForm, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Store Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="store@example.com"
              value={addStoreForm.email}
              onChange={(e) => setAddStoreForm({ ...addStoreForm, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Store Address
              <span style={{ float: 'right', fontSize: '0.75rem', color: addStoreForm.address.length <= 400 ? 'var(--text-muted)' : 'var(--danger)' }}>
                {addStoreForm.address.length}/400 chars
              </span>
            </label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Enter complete store physical address..."
              value={addStoreForm.address}
              onChange={(e) => setAddStoreForm({ ...addStoreForm, address: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Assign Store Owner (Optional)</label>
            <select
              className="form-control"
              value={addStoreForm.ownerId}
              onChange={(e) => setAddStoreForm({ ...addStoreForm, ownerId: e.target.value })}
            >
              <option value="">No Owner Assigned</option>
              {availableOwners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Only shows Store Owners who do not currently own a store.
            </span>
          </div>
          <div className="modal-footer" style={{ padding: '1rem 0 0 0', border: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddStoreOpen(false)} disabled={isSavingStore}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSavingStore}>
              {isSavingStore ? 'Saving...' : 'Register Store'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: View User Details */}
      <Modal isOpen={isDetailsOpen} title="User Profile Details" onClose={() => setIsDetailsOpen(false)}>
        {isLoadingDetails ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading profile details...</div>
        ) : selectedUserDetails ? (
          <div className="details-list">
            <div className="details-item">
              <span className="details-label">Full Name</span>
              <span className="details-value" style={{ fontWeight: 600 }}>{selectedUserDetails.name}</span>
            </div>
            <div className="details-item">
              <span className="details-label">Email Address</span>
              <span className="details-value">{selectedUserDetails.email}</span>
            </div>
            <div className="details-item">
              <span className="details-label">Address</span>
              <span className="details-value">{selectedUserDetails.address}</span>
            </div>
            <div className="details-item">
              <span className="details-label">Role</span>
              <span className="details-value">
                <span className={`role-badge role-${selectedUserDetails.role}`}>
                  {selectedUserDetails.role === 'owner' ? 'Store Owner' : selectedUserDetails.role}
                </span>
              </span>
            </div>

            {/* If Store Owner, show store details and average rating */}
            {selectedUserDetails.role === 'owner' && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <StoreIcon size={16} color="var(--accent)" />
                  Associated Store Info
                </h4>
                {selectedUserDetails.store ? (
                  <div className="details-list" style={{ gap: '0.75rem' }}>
                    <div className="details-item" style={{ border: 'none', padding: 0 }}>
                      <span className="details-label">Store Name</span>
                      <span className="details-value" style={{ fontSize: '0.875rem' }}>{selectedUserDetails.store.name}</span>
                    </div>
                    <div className="details-item" style={{ border: 'none', padding: 0 }}>
                      <span className="details-label">Store Email</span>
                      <span className="details-value" style={{ fontSize: '0.875rem' }}>{selectedUserDetails.store.email}</span>
                    </div>
                    <div className="details-item" style={{ border: 'none', padding: 0 }}>
                      <span className="details-label">Overall Rating</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <RatingStars rating={Math.round(selectedUserDetails.storeRating || 0)} />
                        <span className="rating-value-badge">
                          <Star size={12} fill="#f59e0b" color="#f59e0b" />
                          {selectedUserDetails.storeRating > 0 ? selectedUserDetails.storeRating : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No store currently registered for this owner.</span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger)' }}>Could not load user profile details.</div>
        )}
        <div className="modal-footer" style={{ padding: '1rem 0 0 0', border: 'none' }}>
          <button className="btn btn-secondary" onClick={() => setIsDetailsOpen(false)}>
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
