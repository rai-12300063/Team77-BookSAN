import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InstructorsPage.css';

const InstructorsPage = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/instructors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setInstructors(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching instructors:', error);
      setError('Failed to fetch instructors');
      setLoading(false);
    }
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
      password: ''
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openEditModal = (instructor) => {
    setModalMode('edit');
    setSelectedInstructor(instructor);
    setFormData({
      name: instructor.name,
      email: instructor.email,
      password: ''
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInstructor(null);
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

      const submitData = { ...formData };
      if (modalMode === 'edit' && !submitData.password) {
        delete submitData.password;
      }

      if (modalMode === 'add') {
        const response = await axios.post(
          'http://localhost:5001/api/instructors',
          submitData,
          config
        );
        if (response.data.success) {
          setSuccess('Instructor added successfully!');
          fetchInstructors();
          setTimeout(() => closeModal(), 1500);
        }
      } else {
        const response = await axios.put(
          `http://localhost:5001/api/instructors/${selectedInstructor._id}`,
          submitData,
          config
        );
        if (response.data.success) {
          setSuccess('Instructor updated successfully!');
          fetchInstructors();
          setTimeout(() => closeModal(), 1500);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleDelete = async (instructorId) => {
    if (!window.confirm('Are you sure you want to delete this instructor?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://localhost:5001/api/instructors/${instructorId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSuccess('Instructor deleted successfully!');
        fetchInstructors();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete instructor');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return <div className="loading">Loading instructors...</div>;
  }

  return (
    <div className="instructors-page">
      <div className="page-header">
        <h1>Instructors Management</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          + Add Instructor
        </button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {instructors.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">No instructors found</td>
              </tr>
            ) : (
              instructors.map((instructor) => (
                <tr key={instructor._id}>
                  <td>{instructor.name}</td>
                  <td>{instructor.email}</td>
                  <td>
                    <span className="badge badge-instructor">{instructor.role}</span>
                  </td>
                  <td>{new Date(instructor.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-edit"
                      onClick={() => openEditModal(instructor)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={() => handleDelete(instructor._id)}
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

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'add' ? 'Add New Instructor' : 'Edit Instructor'}</h2>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
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
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Password {modalMode === 'add' ? '*' : '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={modalMode === 'add'}
                  minLength={6}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'add' ? 'Add Instructor' : 'Update Instructor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorsPage;
