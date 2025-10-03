const Course = require('../models/Course');
const LearningProgress = require('../models/LearningProgress');
const User = require('../models/User'); // Add this import for unenroll function

// Get all courses with pagination and filtering
const getCourses = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            difficulty,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const filter = { isActive: true };

        // Role-based filtering
        if (req.user) {
            if (req.user.role === 'student') {
                // Students only see courses they are enrolled in
                const enrollments = await LearningProgress.find({ userId: req.user.id }).select('courseId');
                const enrolledCourseIds = enrollments.map(e => e.courseId);
                filter._id = { $in: enrolledCourseIds };
            } else if (req.user.role === 'instructor') {
                // Instructors see courses they created or all courses (to enroll students)
                // No additional filter - instructors can see all courses to manage enrollments
            }
            // Admins see all courses (no additional filter needed)
        }

        if (category) filter.category = category;
        if (difficulty) filter.difficulty = difficulty;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const courses = await Course.find(filter)
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('instructor.id', 'name email');

        const total = await Course.countDocuments(filter);

        res.json({
            courses,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single course by ID
const getCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor.id', 'name email');
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new course (instructor/admin only)
const createCourse = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            difficulty,
            duration,
            estimatedCompletionTime,
            prerequisites,
            learningObjectives,
            syllabus,
            instructorId  // Admin can specify instructor
        } = req.body;

        let instructorData;

        // If admin is creating the course, they can assign an instructor
        if (req.user.role === 'admin' && instructorId) {
            const instructor = await User.findById(instructorId);
            if (!instructor) {
                return res.status(404).json({ message: 'Instructor not found' });
            }
            if (instructor.role !== 'instructor' && instructor.role !== 'admin') {
                return res.status(400).json({ message: 'Selected user is not an instructor' });
            }
            instructorData = {
                id: instructor._id,
                name: instructor.name,
                email: instructor.email
            };
        } else {
            // Instructor creating their own course
            instructorData = {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email
            };
        }

        const course = await Course.create({
            title,
            description,
            category,
            difficulty,
            instructor: instructorData,
            duration,
            estimatedCompletionTime,
            prerequisites: prerequisites || [],
            learningObjectives: learningObjectives || [],
            syllabus: syllabus || []
        });

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update course (instructor/admin only)
const updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if user is instructor or admin
        if (course.instructor.id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }

        const {
            title,
            description,
            category,
            difficulty,
            duration,
            estimatedCompletionTime,
            prerequisites,
            learningObjectives,
            syllabus,
            isActive,
            instructorId  // Admin can reassign instructor
        } = req.body;

        course.title = title || course.title;
        course.description = description || course.description;
        course.category = category || course.category;
        course.difficulty = difficulty || course.difficulty;
        course.duration = duration || course.duration;
        course.estimatedCompletionTime = estimatedCompletionTime || course.estimatedCompletionTime;
        course.prerequisites = prerequisites || course.prerequisites;
        course.learningObjectives = learningObjectives || course.learningObjectives;
        course.syllabus = syllabus || course.syllabus;
        course.isActive = isActive !== undefined ? isActive : course.isActive;

        // Admin can reassign instructor
        if (req.user.role === 'admin' && instructorId) {
            const instructor = await User.findById(instructorId);
            if (!instructor) {
                return res.status(404).json({ message: 'Instructor not found' });
            }
            if (instructor.role !== 'instructor' && instructor.role !== 'admin') {
                return res.status(400).json({ message: 'Selected user is not an instructor' });
            }
            course.instructor = {
                id: instructor._id,
                name: instructor.name,
                email: instructor.email
            };
        }

        const updatedCourse = await course.save();
        res.json(updatedCourse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete course (admin only)
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        await course.remove();
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Enroll in course
const enrollInCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if already enrolled
        const existingProgress = await LearningProgress.findOne({
            userId: req.user.id,
            courseId: req.params.id
        });

        if (existingProgress) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        // Create learning progress record
        const progress = await LearningProgress.create({
            userId: req.user.id,
            courseId: req.params.id
        });

        // Increment enrollment count
        course.enrollmentCount += 1;
        await course.save();

        res.status(201).json({ 
            message: 'Successfully enrolled in course',
            progress 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user's enrolled courses
const getEnrolledCourses = async (req, res) => {
    try {
        const enrollments = await LearningProgress.find({ userId: req.user.id })
            .populate('courseId')
            .sort({ enrollmentDate: -1 });

        // Return the enrollments directly with populated courseId
        res.json(enrollments);
    } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        res.status(500).json({ message: error.message });
    }
};

// Unenroll from course
const unenrollFromCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId || req.user.id; // Handle both userId and id

        // Check if course exists
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if user is enrolled in the course
        const existingProgress = await LearningProgress.findOne({
            userId: userId,
            courseId: id
        });

        if (!existingProgress) {
            return res.status(400).json({ message: 'You are not enrolled in this course' });
        }

        // Remove the learning progress record
        await LearningProgress.findOneAndDelete({
            userId: userId,
            courseId: id
        });

        // Decrement enrollment count
        if (course.enrollmentCount > 0) {
            course.enrollmentCount -= 1;
            await course.save();
        }

        res.status(200).json({ 
            message: 'Successfully unenrolled from course',
            courseId: id
        });

    } catch (error) {
        console.error('Unenroll error:', error);
        res.status(500).json({ message: 'Error unenrolling from course', error: error.message });
    }
};

// Admin/Instructor: Enroll student in course
const enrollStudentInCourse = async (req, res) => {
    try {
        const { courseId, studentId } = req.body;

        // Only admin and instructors can enroll students
        if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
            return res.status(403).json({ message: 'Only admin and instructors can enroll students' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // If instructor, verify they are assigned to this course
        if (req.user.role === 'instructor' && course.instructor.id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only enroll students in your assigned courses' });
        }

        const student = await User.findById(studentId);
        if (!student || student.role !== 'student') {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if already enrolled
        const existingProgress = await LearningProgress.findOne({
            userId: studentId,
            courseId: courseId
        });

        if (existingProgress) {
            return res.status(400).json({ message: 'Student already enrolled in this course' });
        }

        // Create learning progress record
        const progress = await LearningProgress.create({
            userId: studentId,
            courseId: courseId
        });

        // Increment enrollment count
        course.enrollmentCount += 1;
        await course.save();

        res.status(201).json({
            message: 'Student enrolled successfully',
            progress
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin/Instructor: Unenroll student from course
const unenrollStudentFromCourse = async (req, res) => {
    try {
        const { courseId, studentId } = req.body;

        // Only admin and instructors can unenroll students
        if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
            return res.status(403).json({ message: 'Only admin and instructors can unenroll students' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // If instructor, verify they are assigned to this course
        if (req.user.role === 'instructor' && course.instructor.id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only unenroll students from your assigned courses' });
        }

        const existingProgress = await LearningProgress.findOne({
            userId: studentId,
            courseId: courseId
        });

        if (!existingProgress) {
            return res.status(400).json({ message: 'Student not enrolled in this course' });
        }

        // Remove the learning progress record
        await LearningProgress.findOneAndDelete({
            userId: studentId,
            courseId: courseId
        });

        // Decrement enrollment count
        if (course.enrollmentCount > 0) {
            course.enrollmentCount -= 1;
            await course.save();
        }

        res.status(200).json({
            message: 'Student unenrolled successfully',
            courseId: courseId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get course enrollments (admin/instructor)
const getCourseEnrollments = async (req, res) => {
    try {
        const courseId = req.params.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // If instructor, verify they are assigned to this course
        if (req.user.role === 'instructor' && course.instructor.id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only view enrollments for your assigned courses' });
        }

        const enrollments = await LearningProgress.find({ courseId })
            .populate('userId', 'name email role')
            .sort({ enrollmentDate: -1 });

        res.json({
            success: true,
            count: enrollments.length,
            data: enrollments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollInCourse,
    unenrollFromCourse,
    getEnrolledCourses,
    enrollStudentInCourse,
    unenrollStudentFromCourse,
    getCourseEnrollments
};