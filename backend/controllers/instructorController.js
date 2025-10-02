const Course = require('../models/Course');
const User = require('../models/User');
const LearningProgress = require('../models/LearningProgress');
const Task = require('../models/Task');
const { USER_ROLES } = require('../constants/roles');

const getMyCourses = async (req, res) => {
    try {
        const courses = await Course.find({ 'instructor.id': req.user.id });

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching instructor courses',
            error: error.message
        });
    }
};

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
            syllabus
        } = req.body;

        if (!title || !description || !category || !difficulty) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, category, and difficulty are required'
            });
        }

        const courseData = {
            title,
            description,
            category,
            difficulty,
            duration: duration || { weeks: 1, hoursPerWeek: 1 },
            estimatedCompletionTime: estimatedCompletionTime || 1,
            prerequisites: prerequisites || [],
            learningObjectives: learningObjectives || [],
            syllabus: syllabus || [],
            instructor: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email
            }
        };

        const course = await Course.create(courseData);

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while creating course',
            error: error.message
        });
    }
};

const updateCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        if (course.instructor.id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own courses'
            });
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            data: updatedCourse
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while updating course',
            error: error.message
        });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        if (course.instructor.id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own courses'
            });
        }

        await Course.findByIdAndDelete(courseId);

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while deleting course',
            error: error.message
        });
    }
};

const getCourseStudents = async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        if (course.instructor.id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only view students of your own courses'
            });
        }

        const enrollments = await LearningProgress.find({ courseId })
            .populate('userId', 'name email joinDate')
            .sort({ enrollmentDate: -1 });

        const students = enrollments.map(enrollment => ({
            student: enrollment.userId,
            enrollmentDate: enrollment.enrollmentDate,
            completionPercentage: enrollment.completionPercentage,
            currentModule: enrollment.currentModule,
            totalTimeSpent: enrollment.totalTimeSpent,
            lastAccessDate: enrollment.lastAccessDate,
            isCompleted: enrollment.isCompleted,
            grade: enrollment.grade
        }));

        res.status(200).json({
            success: true,
            course: {
                id: course._id,
                title: course.title
            },
            count: students.length,
            data: students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching course students',
            error: error.message
        });
    }
};

const getStudentProgress = async (req, res) => {
    try {
        const { courseId, studentId } = req.params;
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        if (course.instructor.id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only view progress of students in your courses'
            });
        }

        const progress = await LearningProgress.findOne({
            userId: studentId,
            courseId
        }).populate('userId', 'name email');

        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'Student progress not found'
            });
        }

        res.status(200).json({
            success: true,
            data: progress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching student progress',
            error: error.message
        });
    }
};

const updateStudentGrade = async (req, res) => {
    try {
        const { courseId, studentId } = req.params;
        const { grade, notes } = req.body;

        if (grade !== undefined && (grade < 0 || grade > 100)) {
            return res.status(400).json({
                success: false,
                message: 'Grade must be between 0 and 100'
            });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        if (course.instructor.id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only update grades for students in your courses'
            });
        }

        const updateData = {};
        if (grade !== undefined) updateData.grade = grade;
        if (notes !== undefined) updateData.notes = notes;

        const progress = await LearningProgress.findOneAndUpdate(
            { userId: studentId, courseId },
            updateData,
            { new: true }
        ).populate('userId', 'name email');

        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'Student progress not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Student grade updated successfully',
            data: progress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while updating student grade',
            error: error.message
        });
    }
};

const getCourseAnalytics = async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        if (course.instructor.id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only view analytics for your own courses'
            });
        }

        const enrollments = await LearningProgress.find({ courseId });

        const analytics = {
            totalEnrollments: enrollments.length,
            completedStudents: enrollments.filter(e => e.isCompleted).length,
            averageCompletionPercentage: enrollments.length > 0
                ? Math.round(enrollments.reduce((sum, e) => sum + e.completionPercentage, 0) / enrollments.length)
                : 0,
            averageGrade: enrollments.filter(e => e.grade !== undefined).length > 0
                ? Math.round(enrollments.filter(e => e.grade !== undefined).reduce((sum, e) => sum + e.grade, 0) / enrollments.filter(e => e.grade !== undefined).length)
                : null,
            totalTimeSpent: enrollments.reduce((sum, e) => sum + e.totalTimeSpent, 0),
            moduleCompletionRates: [],
            recentActivity: enrollments
                .sort((a, b) => new Date(b.lastAccessDate) - new Date(a.lastAccessDate))
                .slice(0, 10)
                .map(e => ({
                    studentId: e.userId,
                    lastAccess: e.lastAccessDate,
                    completionPercentage: e.completionPercentage
                }))
        };

        if (course.syllabus && course.syllabus.length > 0) {
            analytics.moduleCompletionRates = course.syllabus.map((module, index) => {
                const studentsCompletedModule = enrollments.filter(e =>
                    e.modulesCompleted.some(m => m.moduleIndex === index)
                ).length;

                return {
                    moduleIndex: index,
                    moduleTitle: module.moduleTitle,
                    completionRate: enrollments.length > 0
                        ? Math.round((studentsCompletedModule / enrollments.length) * 100)
                        : 0
                };
            });
        }

        res.status(200).json({
            success: true,
            course: {
                id: course._id,
                title: course.title
            },
            data: analytics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching course analytics',
            error: error.message
        });
    }
};

const getMyStudents = async (req, res) => {
    try {
        const myCourses = await Course.find({ 'instructor.id': req.user.id });
        const courseIds = myCourses.map(course => course._id);

        const allEnrollments = await LearningProgress.find({
            courseId: { $in: courseIds }
        })
        .populate('userId', 'name email')
        .populate('courseId', 'title')
        .sort({ lastAccessDate: -1 });

        const studentsMap = new Map();

        allEnrollments.forEach(enrollment => {
            const studentId = enrollment.userId._id.toString();
            if (!studentsMap.has(studentId)) {
                studentsMap.set(studentId, {
                    student: enrollment.userId,
                    courses: [],
                    totalCourses: 0,
                    completedCourses: 0,
                    averageProgress: 0
                });
            }

            const studentData = studentsMap.get(studentId);
            studentData.courses.push({
                course: enrollment.courseId,
                enrollmentDate: enrollment.enrollmentDate,
                completionPercentage: enrollment.completionPercentage,
                isCompleted: enrollment.isCompleted,
                lastAccessDate: enrollment.lastAccessDate,
                grade: enrollment.grade
            });
        });

        const students = Array.from(studentsMap.values()).map(student => {
            student.totalCourses = student.courses.length;
            student.completedCourses = student.courses.filter(c => c.isCompleted).length;
            student.averageProgress = student.courses.length > 0
                ? Math.round(student.courses.reduce((sum, c) => sum + c.completionPercentage, 0) / student.courses.length)
                : 0;
            return student;
        });

        res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching students',
            error: error.message
        });
    }
};

module.exports = {
    getMyCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseStudents,
    getStudentProgress,
    updateStudentGrade,
    getCourseAnalytics,
    getMyStudents
};