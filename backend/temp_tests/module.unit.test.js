/**
 * Module Management Unit Tests
 * ===========================
 * 
 * Focused unit tests for the course module management system
 * covering CRUD operations, content generation, and validation
 */

const { expect } = require('chai');
const sinon = require('sinon');

// Import the module controller
const moduleController = require('../controllers/moduleController');

// Import models
const Module = require('../models/Module');
const Course = require('../models/Course');
const ModuleProgress = require('../models/ModuleProgress');

describe('📚 Module Management Unit Tests', function() {
    let req, res, next;
    
    beforeEach(function() {
        // Mock Express objects
        req = {
            body: {},
            params: {},
            user: { 
                id: '507f1f77bcf86cd799439011', 
                role: 'admin' 
            }
        };
        
        res = {
            json: sinon.spy(),
            status: sinon.stub().returnsThis()
        };
        
        next = sinon.spy();
    });

    afterEach(function() {
        sinon.restore();
    });

    describe('Create Module', function() {
        it('should create module with valid data', async function() {
            req.body = {
                title: 'Test Module',
                description: 'Test Description',
                courseId: '507f1f77bcf86cd799439012',
                difficulty: 'Beginner',
                estimatedDuration: 60,
                learningObjectives: ['Learn basics'],
                topics: ['JavaScript']
            };

            // Mock course lookup
            sinon.stub(Course, 'findById').resolves({
                _id: '507f1f77bcf86cd799439012',
                instructor: { id: req.user.id }
            });

            // Mock module creation
            sinon.stub(Module, 'create').resolves({
                _id: '507f1f77bcf86cd799439013',
                ...req.body
            });

            await moduleController.createModule(req, res);

            expect(res.json.called).to.be.true;
        });

        it('should require difficulty field', async function() {
            req.body = {
                title: 'Test Module',
                description: 'Test Description',
                courseId: '507f1f77bcf86cd799439012'
                // Missing difficulty field
            };

            sinon.stub(Course, 'findById').resolves({
                instructor: { id: req.user.id }
            });

            sinon.stub(Module, 'create').rejects(new Error('difficulty is required'));

            await moduleController.createModule(req, res);

            expect(res.status.calledWith(500)).to.be.true;
        });
    });

    describe('Update Module', function() {
        it('should update existing module', async function() {
            req.params.moduleId = '507f1f77bcf86cd799439013';
            req.body = {
                title: 'Updated Module',
                description: 'Updated Description'
            };

            // Mock module lookup with course population
            sinon.stub(Module, 'findById').returns({
                populate: sinon.stub().resolves({
                    _id: '507f1f77bcf86cd799439013',
                    courseId: {
                        instructor: { id: req.user.id }
                    }
                })
            });

            // Mock module update
            sinon.stub(Module, 'findByIdAndUpdate').returns({
                populate: sinon.stub().resolves({
                    _id: '507f1f77bcf86cd799439013',
                    title: 'Updated Module'
                })
            });

            await moduleController.updateModule(req, res);

            expect(res.json.called).to.be.true;
        });
    });

    describe('Delete Module', function() {
        it('should delete module and cleanup data', async function() {
            req.params.moduleId = '507f1f77bcf86cd799439013';

            // Mock module lookup
            sinon.stub(Module, 'findById').returns({
                populate: sinon.stub().resolves({
                    _id: '507f1f77bcf86cd799439013',
                    courseId: {
                        _id: '507f1f77bcf86cd799439012',
                        instructor: { id: req.user.id }
                    }
                })
            });

            // Mock cleanup operations
            sinon.stub(ModuleProgress, 'deleteMany').resolves();
            sinon.stub(Course, 'findByIdAndUpdate').resolves();
            sinon.stub(Module, 'findByIdAndDelete').resolves();

            await moduleController.deleteModule(req, res);

            expect(res.json.called).to.be.true;
        });
    });

    describe('Get Course Modules', function() {
        it('should retrieve modules for course', async function() {
            req.params.courseId = '507f1f77bcf86cd799439012';

            const mockModules = [{
                _id: '507f1f77bcf86cd799439013',
                title: 'Test Module',
                courseId: '507f1f77bcf86cd799439012'
            }];

            sinon.stub(Module, 'find').returns({
                populate: sinon.stub().returns({
                    sort: sinon.stub().resolves(mockModules)
                })
            });

            await moduleController.getCourseModules(req, res);

            expect(res.json.called).to.be.true;
        });
    });

    describe('Authorization Tests', function() {
        it('should deny access to non-admin/instructor users', async function() {
            req.user.role = 'student'; // Change to student role
            req.body = {
                title: 'Unauthorized Module',
                courseId: '507f1f77bcf86cd799439012'
            };

            sinon.stub(Course, 'findById').resolves({
                instructor: { id: 'different-user-id' } // Different instructor
            });

            await moduleController.createModule(req, res);

            expect(res.status.calledWith(403)).to.be.true;
        });
    });
});