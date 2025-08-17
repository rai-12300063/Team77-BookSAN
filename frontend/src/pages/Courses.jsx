import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { Link } from 'react-router-dom';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [filter, setFilter] = useState('all');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null); // Not currently used

  useEffect(() => {
    console.log('Component mounted, fetching data...');
    fetchCourses();
    fetchEnrolledCourses();
  }, []);

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Courses</h1>
        <p className="text-gray-600">Discover and enroll in courses to advance your learning journey</p>
      
        {/* Debug Info Panel */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
          <strong>Debug Info:</strong> 
          {Array.isArray(courses) ? courses.length : 0} total courses loaded | 
          {Array.isArray(enrolledCourses) ? enrolledCourses.length : 0} enrolled courses | 
          {Array.isArray(filteredCourses) ? filteredCourses.length : 0} shown after filters |
          Loading: {loading.toString()}
        </div>
      </div>


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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => {
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

                <div className="flex items-center justify-between">
                  {enrolled ? (
                    <Link 
                      to={`/courses/${course._id}`}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6 0v2a2 2 0 002 2h2a2 2 0 002-2v-2M7 7h2a2 2 0 012 2v1" />
                      </svg>
                      Continue Learning
                    </Link>
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
                  
                  <div className="flex items-center text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm">{course.rating || 'N/A'}</span>
                  </div>
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
  );
};

export default Courses;
