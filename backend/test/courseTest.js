const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Course = require('../models/Course');
const LearningProgress = require('../models/LearningProgress');
const { getCourses, createCourse, enrollInCourse } = require('../controllers/courseController');
const { expect } = chai;

describe('Course Management Tests', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('getCourses Function', () => {
        it('should return courses with pagination', async () => {
            const mockCourses = [
                {
                    _id: new mongoose.Types.ObjectId(),
                    title: 'JavaScript Fundamentals',
                    category: 'Programming',
                    difficulty: 'Beginner',
                    isActive: true
                }
            ];

            const findStub = sandbox.stub(Course, 'find').returns({
                sort: sandbox.stub().returns({
                    limit: sandbox.stub().returns({
                        skip: sandbox.stub().returns({
                            populate: sandbox.stub().resolves(mockCourses)
                        })
                    })
                })
            });
            const countStub = sandbox.stub(Course, 'countDocuments').resolves(1);

            const req = { query: {} };
            const res = {
                json: sandbox.spy(),
                status: sandbox.stub().returnsThis()
            };

            await getCourses(req, res);

            expect(res.json.calledOnce).to.be.true;
            // Check that json was called with an object containing the expected structure
            const callArgs = res.json.getCall(0).args[0];
            expect(callArgs).to.have.property('courses');
            expect(callArgs).to.have.property('totalPages');
            expect(callArgs).to.have.property('currentPage');
            expect(callArgs).to.have.property('total');
            expect(callArgs.courses).to.deep.equal(mockCourses);
        });

        it('should handle errors gracefully', async () => {
            sandbox.stub(Course, 'find').throws(new Error('Database error'));

            const req = { query: {} };
            const res = {
                json: sandbox.spy(),
                status: sandbox.stub().returnsThis()
            };

            await getCourses(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith({ message: 'Database error' })).to.be.true;
        });
    });

    describe('createCourse Function', () => {
        it('should create a new course successfully', async () => {
            const mockCourse = {
                _id: new mongoose.Types.ObjectId(),
                title: 'React Advanced',
                description: 'Advanced React concepts',
                category: 'Programming',
                difficulty: 'Advanced'
            };

            const createStub = sandbox.stub(Course, 'create').resolves(mockCourse);

            const req = {
                body: {
                    title: 'React Advanced',
                    description: 'Advanced React concepts',
                    category: 'Programming',
                    difficulty: 'Advanced',
                    duration: { weeks: 8, hoursPerWeek: 5 },
                    estimatedCompletionTime: 40
                },
                user: {
                    id: new mongoose.Types.ObjectId(),
                    name: 'John Instructor',
                    email: 'john@example.com'
                }
            };

            const res = {
                json: sandbox.spy(),
                status: sandbox.stub().returnsThis()
            };

            await createCourse(req, res);

            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(mockCourse)).to.be.true;
            expect(createStub.calledOnce).to.be.true;
        });
    });

    describe('enrollInCourse Function', () => {
        it('should enroll user in course successfully', async () => {
            const courseId = new mongoose.Types.ObjectId();
            const userId = new mongoose.Types.ObjectId();
            
            const mockCourse = {
                _id: courseId,
                title: 'Test Course',
                enrollmentCount: 5,
                save: sandbox.stub().resolves()
            };

            const mockProgress = {
                _id: new mongoose.Types.ObjectId(),
                userId,
                courseId,
                completionPercentage: 0
            };

            sandbox.stub(Course, 'findById').resolves(mockCourse);
            sandbox.stub(LearningProgress, 'findOne').resolves(null); // No existing enrollment
            sandbox.stub(LearningProgress, 'create').resolves(mockProgress);

            const req = {
                params: { id: courseId },
                user: { id: userId }
            };

            const res = {
                json: sandbox.spy(),
                status: sandbox.stub().returnsThis()
            };

            await enrollInCourse(req, res);

            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith({
                message: 'Successfully enrolled in course',
                progress: mockProgress
            })).to.be.true;
            expect(mockCourse.enrollmentCount).to.equal(6);
        });

        it('should prevent duplicate enrollment', async () => {
            const courseId = new mongoose.Types.ObjectId();
            const userId = new mongoose.Types.ObjectId();
            
            const mockCourse = {
                _id: courseId,
                title: 'Test Course'
            };

            const existingProgress = {
                userId,
                courseId,
                completionPercentage: 25
            };

            sandbox.stub(Course, 'findById').resolves(mockCourse);
            sandbox.stub(LearningProgress, 'findOne').resolves(existingProgress); // Existing enrollment

            const req = {
                params: { id: courseId },
                user: { id: userId }
            };

            const res = {
                json: sandbox.spy(),
                status: sandbox.stub().returnsThis()
            };

            await enrollInCourse(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWith({ message: 'Already enrolled in this course' })).to.be.true;
        });
    });
});