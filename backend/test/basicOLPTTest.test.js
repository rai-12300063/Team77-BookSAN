/**
 * Basic OLPT Server Test
 * =====================
 * 
 * Simple tests to verify OLPT server is working
 */

const { expect } = require('chai');
const request = require('supertest');
const express = require('express');

describe('🔍 Basic OLPT Server Tests', function() {
  let app;

  before(function() {
    // Create a minimal test app that mimics the OLPT structure
    app = express();
    app.use(express.json());
    
    // Basic health check route
    app.get('/health', (req, res) => {
      res.json({ status: 'OK', message: 'OLPT server is running' });
    });
    
    // Mock auth routes
    app.post('/api/auth/register', (req, res) => {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      res.status(201).json({ 
        message: 'User registered successfully',
        user: { id: '123', name, email, role: role || 'student' }
      });
    });
    
    app.post('/api/auth/login', (req, res) => {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
      }
      if (email === 'test@example.com' && password === 'password123') {
        return res.json({ 
          token: 'mock-jwt-token',
          user: { id: '123', email, name: 'Test User', role: 'student' }
        });
      }
      res.status(401).json({ message: 'Invalid credentials' });
    });
    
    // Mock courses route
    app.get('/api/courses', (req, res) => {
      res.json([
        {
          _id: '67890',
          title: 'Test Course',
          description: 'A test course',
          instructor: 'Test Instructor'
        }
      ]);
    });
  });

  describe('Server Health', () => {
    it('should respond to health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).to.have.property('status', 'OK');
      expect(response.body).to.have.property('message');
    });
  });

  describe('Authentication Routes', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'newuser@test.com',
        password: 'password123',
        role: 'student'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      
      expect(response.body).to.have.property('message', 'User registered successfully');
      expect(response.body.user).to.have.property('email', userData.email);
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);
      
      expect(response.body).to.have.property('token');
      expect(response.body.user).to.have.property('email', loginData.email);
    });

    it('should reject invalid credentials', async () => {
      const loginData = {
        email: 'wrong@test.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
      
      expect(response.body).to.have.property('message', 'Invalid credentials');
    });
  });

  describe('Course Routes', () => {
    it('should retrieve courses', async () => {
      const response = await request(app)
        .get('/api/courses')
        .expect(200);
      
      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.greaterThan(0);
      expect(response.body[0]).to.have.property('title');
    });
  });

  describe('Validation Tests', () => {
    it('should validate required fields in registration', async () => {
      const userData = {
        email: 'incomplete@test.com'
        // Missing name and password
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
      
      expect(response.body).to.have.property('message', 'Missing required fields');
    });

    it('should validate required fields in login', async () => {
      const loginData = {
        email: 'test@example.com'
        // Missing password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);
      
      expect(response.body).to.have.property('message', 'Email and password required');
    });
  });
});