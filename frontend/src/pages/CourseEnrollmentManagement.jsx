import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './CourseEnrollmentManagement.css';

const CourseEnrollmentManagement = () => {
  const { user, isAdmin, isInstructor } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showAssignInstructorModal, setShowAssignInstructorModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = 'http://localhost:5001/api';

  useEffect(() => {
    fetchCourses();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchEnrollments(selectedCourse._id);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const coursesData = response.data?.courses || response.data || [];

      // Filter courses based on role
      let filteredCourses = coursesData;
      if (isInstructor() && !isAdmin()) {
        // Instructors only see their assigned courses
        filteredCourses = coursesData.filter(course =>
          course.instructor?.id === user.id || course.instructor?.id === user._id
        );
      }

      setCourses(filteredCourses);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to fetch courses');
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const users = response.data.data;
        setAllUsers(users);
        setInstructors(users.filter(u => u.role === 'instructor' || u.role === 'admin'));
        setStudents(users.filter(u => u.role === 'student'));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchEnrollments = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/courses/${courseId}/enrollments`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setEnrollments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setError('Failed to fetch enrollments');
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setError('');
    setSuccess('');
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/courses/enroll-student`,
        {
          courseId: selectedCourse._id,
          studentId: selectedStudent
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data) {
        setSuccess('Student enrolled successfully!');
        fetchEnrollments(selectedCourse._id);
        setSelectedStudent('');
        setTimeout(() => {
          setShowEnrollModal(false);
          setSuccess('');
        }, 1500);
      }
    } catch (error) {
      console.error('Error enrolling student:', error);
      setError(error.response?.data?.message || 'Failed to enroll student');
    }
  };

  const handleUnenrollStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to unenroll ${studentName} from this course?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/courses/unenroll-student`,
        {
          courseId: selectedCourse._id,
          studentId: studentId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data) {
        setSuccess('Student unenrolled successfully!');
        fetchEnrollments(selectedCourse._id);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error unenrolling student:', error);
      setError(error.response?.data?.message || 'Failed to unenroll student');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAssignInstructor = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedInstructor) {
      setError('Please select an instructor');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/courses/${selectedCourse._id}`,
        {
          instructorId: selectedInstructor
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data) {
        setSuccess('Instructor assigned successfully!');
        fetchCourses();
        setSelectedInstructor('');
        setTimeout(() => {
          setShowAssignInstructorModal(false);
          setSuccess('');
        }, 1500);
      }
    } catch (error) {
      console.error('Error assigning instructor:', error);
      setError(error.response?.data?.message || 'Failed to assign instructor');
    }
  };

  const openEnrollModal = () => {
    setShowEnrollModal(true);
    setError('');
    setSuccess('');
  };

  const openAssignInstructorModal = () => {
    setShowAssignInstructorModal(true);
    setSelectedInstructor(selectedCourse?.instructor?.id || '');
    setError('');
    setSuccess('');
  };

  if (!user || (!isAdmin() && !isInstructor())) {
    return (
      <div className="enrollment-management">
        <div className="alert alert-error">
          Access denied. Only admins and instructors can access this page.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="enrollment-management">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="enrollment-management">
      <div className="page-header">
        <h1>Course Enrollment Management</h1>
        <p>Manage course instructors and student enrollments</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Course Selection Dropdown */}
      <div className="course-selector">
        <label htmlFor="course-select">Select Course:</label>
        <select
          id="course-select"
          value={selectedCourse?._id || ''}
          onChange={(e) => {
            const course = courses.find(c => c._id === e.target.value);
            handleCourseSelect(course);
          }}
        >
          <option value="">-- Choose a course --</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.title} - {course.instructor?.name || 'No instructor'} ({course.enrollmentCount || 0} students)
            </option>
          ))}
        </select>
      </div>

      <div className="management-container">
        {selectedCourse ? (
          <div className="enrollments-panel-full">
            <div className="panel-header">
              <div>
                <h2>{selectedCourse.title}</h2>
                <p className="instructor-info">
                  Current Instructor: <strong>{selectedCourse.instructor?.name || 'Not assigned'}</strong>
                </p>
              </div>
              <div className="panel-actions">
                {isAdmin() && (
                  <button
                    className="btn btn-secondary"
                    onClick={openAssignInstructorModal}
                  >
                    Assign Instructor
                  </button>
                )}
                <button
                  className="btn btn-primary"
                  onClick={openEnrollModal}
                >
                  Enroll Student
                </button>
              </div>
            </div>

            <div className="enrollments-section">
              <h3>Enrolled Students ({enrollments.length})</h3>

              {enrollments.length === 0 ? (
                <div className="no-data">
                  No students enrolled yet. Click "Enroll Student" to add students.
                </div>
              ) : (
                <div className="enrollments-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Enrolled Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((enrollment) => (
                        <tr key={enrollment._id}>
                          <td>{enrollment.userId?.name || 'N/A'}</td>
                          <td>{enrollment.userId?.email || 'N/A'}</td>
                          <td>{new Date(enrollment.enrollmentDate).toLocaleDateString()}</td>
                          <td>
                            <button
                              className="btn btn-delete btn-sm"
                              onClick={() => handleUnenrollStudent(
                                enrollment.userId._id,
                                enrollment.userId.name
                              )}
                            >
                              Unenroll
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="enrollments-panel-full">
            <div className="no-selection">
              <h3>Select a course to manage enrollments</h3>
              <p>Choose a course from the dropdown above to view and manage student enrollments.</p>
            </div>
          </div>
        )}
      </div>

      {/* Enroll Student Modal */}
      {showEnrollModal && (
        <div className="modal-overlay" onClick={() => setShowEnrollModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Enroll Student</h2>
              <button className="close-btn" onClick={() => setShowEnrollModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleEnrollStudent} className="enrollment-form">
              <div className="form-group">
                <label htmlFor="student">Select Student</label>
                <select
                  id="student"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  required
                >
                  <option value="">Choose a student...</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-info">
                <p>Course: <strong>{selectedCourse?.title}</strong></p>
              </div>

              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEnrollModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Instructor Modal */}
      {showAssignInstructorModal && (
        <div className="modal-overlay" onClick={() => setShowAssignInstructorModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Instructor</h2>
              <button className="close-btn" onClick={() => setShowAssignInstructorModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleAssignInstructor} className="enrollment-form">
              <div className="form-group">
                <label htmlFor="instructor">Select Instructor</label>
                <select
                  id="instructor"
                  value={selectedInstructor}
                  onChange={(e) => setSelectedInstructor(e.target.value)}
                  required
                >
                  <option value="">Choose an instructor...</option>
                  {instructors.map((instructor) => (
                    <option key={instructor._id} value={instructor._id}>
                      {instructor.name} ({instructor.email}) - {instructor.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-info">
                <p>Course: <strong>{selectedCourse?.title}</strong></p>
                <p>Current Instructor: <strong>{selectedCourse?.instructor?.name || 'None'}</strong></p>
              </div>

              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAssignInstructorModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Assign Instructor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseEnrollmentManagement;
