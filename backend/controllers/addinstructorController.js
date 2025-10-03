const Instructor = require('../models/Instructor');
const Course = require('../models/Course');

class InstructorController {
  // Get all instructors
  async getAllInstructors(req, res) {
    try {
      const instructors = await Instructor.find({ role: 'instructor', isActive: true })
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
      const instructor = await Instructor.findOne({ 
        _id: req.params.id,
        role: 'instructor'  // ADD THIS
      }).select('-password');

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
      console.log('Creating instructor with data:', req.body);
      
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters'
        });
      }

      const existingInstructor = await Instructor.findOne({ email: email.toLowerCase() });
      if (existingInstructor) {
        return res.status(400).json({
          success: false,
          message: 'Instructor with this email already exists'
        });
      }

      // Explicitly set role to 'instructor'
      const instructor = await Instructor.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: 'instructor'  // EXPLICITLY SET ROLE
      });

      console.log('Instructor created successfully:', instructor._id);

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
        details: error.stack
      });
    }
  }

  // Update instructor
  async updateInstructor(req, res) {
    try {
      console.log('Updating instructor:', req.params.id, 'with data:', req.body);
      
      const { name, email, password } = req.body;

      const instructor = await Instructor.findOne({ 
        _id: req.params.id,
        role: 'instructor'  // ADD THIS
      });

      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: 'Instructor not found'
        });
      }

      if (email && email.toLowerCase() !== instructor.email) {
        const existingInstructor = await Instructor.findOne({ email: email.toLowerCase() });
        if (existingInstructor) {
          return res.status(400).json({
            success: false,
            message: 'Email already in use'
          });
        }
      }

      if (name) instructor.name = name.trim();
      if (email) instructor.email = email.toLowerCase().trim();
      if (password && password.length >= 6) instructor.password = password;

      await instructor.save();

      console.log('Instructor updated successfully');

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

  // Delete instructor
  async deleteInstructor(req, res) {
    try {
      console.log('=== DELETE INSTRUCTOR CALLED ===');
      console.log('ID:', req.params.id);
      
      // Delete only if role is 'instructor'
      const result = await Instructor.deleteOne({ 
        _id: req.params.id,
        role: 'instructor'  // ADD THIS
      });
      
      console.log('DELETE RESULT:', result);

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Instructor not found'
        });
      }

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
      const totalInstructors = await Instructor.countDocuments({ 
        role: 'instructor',  // ADD THIS
        isActive: true 
      });

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
