import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    address: ''
  });

  const API_URL = 'http://localhost:5001/api';

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, roleFilter, searchQuery]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUsers(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'student',
      address: ''
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openEditModal = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      address: user.address || ''
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (modalMode === 'add') {
        const response = await axios.post(
          `${API_URL}/admin/users`,
          formData,
          config
        );

        if (response.data.success) {
          setSuccess('User created successfully!');
          fetchUsers();
          setTimeout(() => {
            closeModal();
          }, 1500);
        }
      } else {
        // Update user role
        const response = await axios.put(
          `${API_URL}/admin/users/${selectedUser._id}`,
          { role: formData.role },
          config
        );

        if (response.data.success) {
          setSuccess('User updated successfully!');
          fetchUsers();
          setTimeout(() => {
            closeModal();
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user: ${userName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_URL}/admin/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSuccess('User deleted successfully!');
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.response?.data?.message || 'Failed to delete user');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'role-badge role-admin';
      case 'instructor':
        return 'role-badge role-instructor';
      case 'student':
        return 'role-badge role-student';
      default:
        return 'role-badge';
    }
  };

  const getRoleIcon = (role) => {
    return '';
  };

  if (loading) {
    return (
      <div className="user-management">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>User Management</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="role-filters">
          <button
            className={`filter-btn ${roleFilter === 'all' ? 'active' : ''}`}
            onClick={() => setRoleFilter('all')}
          >
            All Users
          </button>
          <button
            className={`filter-btn ${roleFilter === 'admin' ? 'active' : ''}`}
            onClick={() => setRoleFilter('admin')}
          >
            Admins
          </button>
          <button
            className={`filter-btn ${roleFilter === 'instructor' ? 'active' : ''}`}
            onClick={() => setRoleFilter('instructor')}
          >
            Instructors
          </button>
          <button
            className={`filter-btn ${roleFilter === 'student' ? 'active' : ''}`}
            onClick={() => setRoleFilter('student')}
          >
            Students
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Learning Hours</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <span className={getRoleBadgeClass(user.role)}>
                      {getRoleIcon(user.role)} {user.role}
                    </span>
                  </td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.joinDate).toLocaleDateString()}</td>
                  <td>{user.totalLearningHours || 0}h</td>
                  <td className="actions">
                    <button
                      className="btn btn-edit"
                      onClick={() => openEditModal(user)}
                      title="Edit user role"
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDelete(user._id, user.name)}
                      title="Delete user"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'add' ? 'Add New User' : 'Edit User Role'}</h2>
              <button className="close-btn" onClick={closeModal}>
                X
              </button>
            </div>

            <form onSubmit={handleSubmit} className="user-form">
              {modalMode === 'add' && (
                <>
                  <div className="form-group">
                    <label htmlFor="name">Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password *</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter password"
                      minLength="6"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter address (optional)"
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'add' ? 'Create User' : 'Update Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
