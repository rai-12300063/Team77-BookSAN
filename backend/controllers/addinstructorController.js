
const Instructor = require('../models/Instructor');
const Course = require('../models/Course');

class InstructorController {
  // Get all instructors
  async getAllInstructors(req, res) {
    try {
      const instructors = await Instructor.find({ isActive: true })
        .select('-password')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: instructors.length,
        data: instructors
      });
    } catch (error) {
      console.error('Error fetching instructors:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching instructors',
        error: error.message
      });
    }
  }

  // Get instructor by ID
  async getInstructorById(req, res) {
    try {
      const instructor = await Instructor.findById(req.params.id).select('-password');

      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: 'Instructor not found'
        });
      }

      res.status(200).json({
        success: true,
        data: instructor
      });
    } catch (error) {
      console.error('Error fetching instructor:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching instructor',
        error: error.message
      });
    }
  }

  // Create new instructor
  async createInstructor(req, res) {
    try {
      console.log('Creating instructor with data:', req.body); // Debug log
      
      const { name, email, password } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required'
        });
      }

      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters'
        });
      }

      // Check if instructor already exists
      const existingInstructor = await Instructor.findOne({ email: email.toLowerCase() });
      if (existingInstructor) {
        return res.status(400).json({
          success: false,
          message: 'Instructor with this email already exists'
        });
      }

      // Create instructor
      const instructor = await Instructor.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password
      });

      console.log('Instructor created successfully:', instructor._id); // Debug log

      res.status(201).json({
        success: true,
        message: 'Instructor created successfully',
        data: instructor
      });
    } catch (error) {
      console.error('Error creating instructor:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating instructor',
        error: error.message,
        details: error.stack // Add stack trace for debugging
      });
    }
  }

  // Update instructor
  async updateInstructor(req, res) {
    try {
      console.log('Updating instructor:', req.params.id, 'with data:', req.body); // Debug log
      
      const { name, email, password } = req.body;

      const instructor = await Instructor.findById(req.params.id);

      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: 'Instructor not found'
        });
      }

      // Check if email is being changed and if it already exists
      if (email && email.toLowerCase() !== instructor.email) {
        const existingInstructor = await Instructor.findOne({ email: email.toLowerCase() });
        if (existingInstructor) {
          return res.status(400).json({
            success: false,
            message: 'Email already in use'
          });
        }
      }

      // Update fields
      if (name) instructor.name = name.trim();
      if (email) instructor.email = email.toLowerCase().trim();
      if (password && password.length >= 6) instructor.password = password;

      await instructor.save();

      console.log('Instructor updated successfully'); // Debug log

      res.status(200).json({
        success: true,
        message: 'Instructor updated successfully',
        data: instructor
      });
    } catch (error) {
      console.error('Error updating instructor:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating instructor',
        error: error.message
      });
    }
  }

  // Delete instructor (soft delete)
  async deleteInstructor(req, res) {
    try {
      const instructor = await Instructor.findById(req.params.id);

      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: 'Instructor not found'
        });
      }

      // Check if instructor has active courses
      const courseCount = await Course.countDocuments({ 
        'instructor.id': req.params.id 
      });

      if (courseCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete instructor with ${courseCount} active course(s). Please reassign or delete courses first.`
        });
      }

      // Soft delete
      instructor.isActive = false;
      await instructor.save();

      res.status(200).json({
        success: true,
        message: 'Instructor deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting instructor:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting instructor',
        error: error.message
      });
    }
  }

  // Get instructor statistics
  async getInstructorStats(req, res) {
    try {
      const totalInstructors = await Instructor.countDocuments({ isActive: true });

      res.status(200).json({
        success: true,
        data: {
          total: totalInstructors
        }
      });
    } catch (error) {
      console.error('Error fetching instructor statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching instructor statistics',
        error: error.message
      });
    }
  }
}

module.exports = new InstructorController();
