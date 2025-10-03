const Student = require('../models/Student');
const LearningProgress = require('../models/LearningProgress');

class StudentController {
  // Get all students
  async getAllStudents(req, res) {
    try {
      // CRITICAL: Filter by role 'student'
      const students = await Student.find({ 
        role: 'student',
        isActive: true 
      })
        .select('-password')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: students.length,
        data: students
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching students',
        error: error.message
      });
    }
  }

  // Get student by ID
  async getStudentById(req, res) {
    try {
      const student = await Student.findOne({ 
        _id: req.params.id,
        role: 'student'  // Add role filter
      }).select('-password');

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      res.status(200).json({
        success: true,
        data: student
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching student',
        error: error.message
      });
    }
  }

  // Create new student
  async createStudent(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required'
        });
      }

      const existingStudent = await Student.findOne({ email });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Student with this email already exists'
        });
      }

      // Explicitly set role to 'student'
      const student = await Student.create({
        name,
        email,
        password,
        role: 'student'  // Force role to student
      });

      res.status(201).json({
        success: true,
        message: 'Student created successfully',
        data: student
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating student',
        error: error.message
      });
    }
  }

  // Update student
  async updateStudent(req, res) {
    try {
      const { name, email, password } = req.body;

      const student = await Student.findOne({ 
        _id: req.params.id,
        role: 'student'  // Add role filter
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      if (email && email !== student.email) {
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
          return res.status(400).json({
            success: false,
            message: 'Email already in use'
          });
        }
      }

      if (name) student.name = name;
      if (email) student.email = email;
      if (password) student.password = password;

      await student.save();

      res.status(200).json({
        success: true,
        message: 'Student updated successfully',
        data: student
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating student',
        error: error.message
      });
    }
  }

  async deleteStudent(req, res) {
    try {
      console.log('=== DELETE STUDENT CALLED ===');
      console.log('ID:', req.params.id);
      
      await LearningProgress.deleteMany({ userId: req.params.id });
      
      // Delete only if role is 'student'
      const result = await Student.deleteOne({ 
        _id: req.params.id,
        role: 'student'  // Add role filter
      });
      
      console.log('DELETE RESULT:', result);

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Student deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting student',
        error: error.message
      });
    }
  }

  // Get student statistics
  async getStudentStats(req, res) {
    try {
      const totalStudents = await Student.countDocuments({ 
        role: 'student',  // Add role filter
        isActive: true 
      });

      res.status(200).json({
        success: true,
        data: {
          total: totalStudents
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching student statistics',
        error: error.message
      });
    }
  }
}

module.exports = new StudentController();
