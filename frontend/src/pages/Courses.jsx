import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ModulesCompletedSidebar from '../components/modules/ModulesCompletedSidebar';


const Courses = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isInstructor } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [filter, setFilter] = useState('all');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [courseQuizzes, setCourseQuizzes] = useState({}); // Store quizzes for each course
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Programming',
    difficulty: 'Beginner',
    duration: { weeks: 1, hoursPerWeek: 1 },
    estimatedCompletionTime: 1,
    prerequisites: '',
    learningObjectives: '',
    syllabus: ''
  });
  const [creating, setCreating] = useState(false);
  // const [error, setError] = useState(null); // Not currently used

  useEffect(() => {
    console.log('Component mounted, fetching data...');
    fetchCourses();
    fetchEnrolledCourses();
    if (isInstructor) {
      fetchInstructorCourses();
    }
  }, [isInstructor]);

  // Fetch quizzes for enrolled courses when enrolledCourses changes
  useEffect(() => {
    if (enrolledCourses.length > 0) {
      enrolledCourses.forEach(course => {
        fetchCourseQuizzes(course._id);
      });
    }
  }, [enrolledCourses]);

  const fetchCourses = async () => {
    try {
      console.log('🔄 Fetching courses...');
      const response = await axiosInstance.get('/api/courses');
      console.log('✅ Courses API response:', response.data);
      
      // Handle paginated response with null safety
      const coursesData = response.data?.courses || response.data || [];
      
      // Ensure we have an array
      if (Array.isArray(coursesData)) {
        setCourses(coursesData);
        console.log('📚 Courses set:', coursesData.length, 'courses');
      } else {
        console.warn('⚠️ Courses data is not an array:', coursesData);
        setCourses([]);
      }
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      setCourses([]); // Set empty array on error
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      console.log('🔄 Fetching enrolled courses...');
      const response = await axiosInstance.get('/api/courses/enrolled/my');

      // Ensure we have an array
      const enrolledData = response.data || [];
      if (Array.isArray(enrolledData)) {
        setEnrolledCourses(enrolledData);
        console.log('✅ Enrolled courses:', enrolledData);
      } else {
        console.warn('⚠️ Enrolled courses data is not an array:', enrolledData);
        setEnrolledCourses([]);
      }
    } catch (error) {
      console.error('❌ Error fetching enrolled courses (this is normal if not logged in):', error.response?.status);
      setEnrolledCourses([]); // Set empty array on error
    } finally {
      setLoading(false);
      console.log('🏁 Loading complete');
    }
  };

    const fetchInstructorCourses = async () => {
    try {
      console.log('🔄 Fetching instructor courses...');
      const response = await axiosInstance.get('/api/quiz/instructor/courses');
      console.log('✅ Instructor courses fetched:', response.data);
      setInstructorCourses(response.data || []);
    } catch (error) {
      console.error('❌ Error fetching instructor courses:', error);
    }
  };

  const fetchCourseQuizzes = async (courseId) => {
    try {
      console.log('🔄 Fetching quizzes for course:', courseId);
      const response = await axiosInstance.get(`/api/quizzes/course/${courseId}`);
      console.log('✅ Course quizzes fetched:', response.data);
      setCourseQuizzes(prev => ({
        ...prev,
        [courseId]: response.data || []
      }));
      return response.data || [];
    } catch (error) {
      console.error('❌ Error fetching course quizzes:', error);
      setCourseQuizzes(prev => ({
        ...prev,
        [courseId]: []
      }));
      return [];
    }
  };

  const canCreateQuizForCourse = (courseId) => {
    if (isAdmin) return true;
    if (isInstructor) {
      return instructorCourses.some(course => course._id === courseId);
    }
    return false;
  };

  const isEnrolledInCourse = (courseId) => {
    return enrolledCourses.some(course => course._id === courseId);
  };

  const handleAddQuiz = (courseId) => {
    if (isAdmin) {
      navigate('/admin/quizzes', { state: { selectedCourseId: courseId } });
    } else if (isInstructor) {
      navigate('/instructor/quizzes', { state: { selectedCourseId: courseId } });
    }
  };

  const handleTakeQuiz = async (courseId) => {
    try {
      console.log('🔄 Getting available quizzes for course:', courseId);
      let quizzes = courseQuizzes[courseId];
      
      // If quizzes not loaded yet, fetch them
      if (!quizzes) {
        quizzes = await fetchCourseQuizzes(courseId);
      }

      if (quizzes && quizzes.length > 0) {
        // If there's only one quiz, navigate directly to it
        if (quizzes.length === 1) {
          navigate(`/courses/${courseId}/quiz/${quizzes[0]._id}`);
        } else {
          // If multiple quizzes, you could navigate to a quiz selection page
          // For now, let's just take the first available quiz
          navigate(`/courses/${courseId}/quiz/${quizzes[0]._id}`);
        }
      } else {
        alert('No quizzes are currently available for this course.');
      }
    } catch (error) {
      console.error('❌ Error handling take quiz:', error);
      alert('Failed to load quizzes. Please try again.');
    }
  };

  const handleEnrollment = async (courseId) => {
    try {
      console.log('🔄 Attempting to enroll in course:', courseId);
      const response = await axiosInstance.post(`/api/courses/${courseId}/enroll`);
      console.log('✅ Enrollment successful:', response.data);
      
      // Refresh enrolled courses
      await fetchEnrolledCourses();
      alert('Successfully enrolled in course!');
    } catch (error) {
      console.error('❌ Error enrolling in course:', error);
      
      if (error.response?.status === 400) {
        alert('You are already enrolled in this course!');
      } else if (error.response?.status === 401) {
        alert('Please log in to enroll in courses.');
      } else {
        alert('Failed to enroll in course. Please try again.');
      }
    }
  };

  // Handle course unenrollment
  const handleUnenrollment = async (courseId) => {
    // Get course title for confirmation
    const course = courses.find(c => c._id === courseId);
    const courseName = course ? course.title : 'this course';

    // Show confirmation dialog
    const isConfirmed = window.confirm(
      `Are you sure you want to drop "${courseName}"?\n\nThis will remove all your progress and you'll need to re-enroll to continue learning.`
    );

    if (!isConfirmed) {
      return; // User cancelled
    }

    try {
      console.log('🔄 Attempting to unenroll from course:', courseId);
      const response = await axiosInstance.post(`/api/courses/${courseId}/unenroll`);
      console.log('✅ Unenrollment successful:', response.data);

      // Refresh both courses and enrolled courses
      await Promise.all([
        fetchCourses(),
        fetchEnrolledCourses()
      ]);

      alert('Successfully dropped the course!');
    } catch (error) {
      console.error('❌ Error unenrolling from course:', error);
      const errorMessage = error.response?.data?.message || 'Failed to drop course. Please try again.';
      alert(errorMessage);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      // Parse arrays from comma-separated strings
      const prerequisites = formData.prerequisites
        ? formData.prerequisites.split(',').map(p => p.trim()).filter(Boolean)
        : [];

      const learningObjectives = formData.learningObjectives
        ? formData.learningObjectives.split(',').map(o => o.trim()).filter(Boolean)
        : [];

      // Parse syllabus (format: "Module Title:Topic1,Topic2:3" per line)
      const syllabus = formData.syllabus
        ? formData.syllabus.split('\n').map(line => {
            const parts = line.trim().split(':');
            if (parts.length >= 3) {
              return {
                moduleTitle: parts[0].trim(),
                topics: parts[1].split(',').map(t => t.trim()).filter(Boolean),
                estimatedHours: parseInt(parts[2]) || 1
              };
            }
            return null;
          }).filter(Boolean)
        : [];

      const courseData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        duration: formData.duration,
        estimatedCompletionTime: formData.estimatedCompletionTime,
        prerequisites,
        learningObjectives,
        syllabus
      };

      await axiosInstance.post('/api/courses', courseData);
      alert('Course created successfully!');
      setShowCreateModal(false);

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'Programming',
        difficulty: 'Beginner',
        duration: { weeks: 1, hoursPerWeek: 1 },
        estimatedCompletionTime: 1,
        prerequisites: '',
        learningObjectives: '',
        syllabus: ''
      });

      // Refresh courses
      fetchCourses();
    } catch (error) {
      console.error('Error creating course:', error);
      alert(error.response?.data?.message || 'Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('duration.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        duration: { ...prev.duration, [field]: parseInt(value) || 0 }
      }));
    } else if (name === 'estimatedCompletionTime') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const isEnrolled = (courseId) => {
    return Array.isArray(enrolledCourses) && enrolledCourses.some(course => 
      course?.courseId?._id === courseId
    );
  };

  const getProgressForCourse = (courseId) => {
    if (!Array.isArray(enrolledCourses)) return 0;
    const enrolled = enrolledCourses.find(course => 
      course?.courseId?._id === courseId
    );
    return enrolled?.completionPercentage || 0;
  };

  const filteredCourses = Array.isArray(courses) ? courses.filter(course => {
    if (!course) return false;
    
    if (filter === 'enrolled') {
      return isEnrolled(course._id);
    }
    if (filter === 'available') {
      return !isEnrolled(course._id);
    }
    if (category !== 'all') {
      return course.category?.toLowerCase() === category.toLowerCase();
    }
    return true;
  }) : [];

  const categories = Array.isArray(courses) 
    ? [...new Set(courses.map(course => course?.category).filter(Boolean))]
    : [];

  // Debug logging with error handling
  try {
    console.log('🔍 Component render state:', {
      loading,
      coursesCount: Array.isArray(courses) ? courses.length : 0,
      enrolledCount: Array.isArray(enrolledCourses) ? enrolledCourses.length : 0,
      filter,
      category,
      filteredCount: Array.isArray(filteredCourses) ? filteredCourses.length : 0
    });
  } catch (debugError) {
    console.warn('⚠️ Debug logging error:', debugError);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold text-gray-800">Courses</h1>
          {isAdmin() && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Course
            </button>
          )}
        </div>
        <p className="text-gray-600">Discover and enroll in courses to advance your learning journey</p>

        {/* Debug Info Panel */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
          <strong>Debug Info:</strong>
          {Array.isArray(courses) ? courses.length : 0} total courses loaded |
          {Array.isArray(enrolledCourses) ? enrolledCourses.length : 0} enrolled courses |
          {Array.isArray(filteredCourses) ? filteredCourses.length : 0} shown after filters |
          Loading: {loading.toString()} |
          User: {user?.name || 'Not logged in'} |
          Role: {user?.role || 'N/A'} |
          isAdmin(): {isAdmin().toString()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Show</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white"
            >
              <option value="all">All Courses</option>
              <option value="enrolled">My Courses</option>
              <option value="available">Available Courses</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {courses.length} courses available {filteredCourses.length !== courses.length && `(${filteredCourses.length} shown)`}
        </p>
      </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.isArray(filteredCourses) && filteredCourses.map(course => {
          const enrolled = isEnrolled(course._id);
          const progress = getProgressForCourse(course._id);
          
          return (
            <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 line-clamp-2">{course.title}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {course.category}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Level: {course.difficulty}</span>
                  <span>{course.estimatedCompletionTime}h</span>
                </div>

                {enrolled && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    {enrolled ? (
                      <div className="flex space-x-2 w-full">
                        <Link
                          to={`/courses/${course._id}`}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200 flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6 0v2a2 2 0 002 2h2a2 2 0 002-2v-2M7 7h2a2 2 0 012 2v1" />
                          </svg>
                          Continue Learning
                        </Link>
                        <button
                          onClick={() => handleUnenrollment(course._id)}
                          className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition duration-200"
                          title="Drop Course"
                        >
                          Drop
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEnrollment(course._id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Enroll Now
                      </button>
                    )}

                    <div className="flex items-center text-gray-500 ml-4">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm">{course.rating || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Quiz Button - Add Quiz for Admin/Instructors, Take Quiz for Students */}
                  {canCreateQuizForCourse(course._id) ? (
                    <button
                      onClick={() => handleAddQuiz(course._id)}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-200 flex items-center justify-center text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      Add Quiz
                    </button>
                  ) : isEnrolledInCourse(course._id) && user?.role === 'student' ? (
                    <button
                      onClick={() => handleTakeQuiz(course._id)}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200 flex items-center justify-center text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Take Quiz
                    </button>
                  ) : null}
                </div>

                {course.prerequisites?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <strong>Prerequisites:</strong> {course.prerequisites.join(', ')}
                    </p>
                  </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'enrolled' 
                  ? "You haven't enrolled in any courses yet."
                  : "No courses match your current filters."
                }
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <ModulesCompletedSidebar />
        </div>
      </div>
    </div>
  );
};

export default Courses;
