# BookSAN Learning Progress Tracker

A comprehensive learning management system for tracking educational progress and achievements with clean, intuitive interfaces for students, instructors, and administrators.

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/rai-12300063/Team77-BookSAN.git
   cd Team77-BookSAN
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies (backend and frontend)
   npm run install-all
   
   # Or install separately
   cd backend && npm install
   cd frontend && npm install
   ```

3. **Configure database connection**
   ```bash
   # Option 1: Quick setup with interactive script
   cd backend && node setup-database.js
   
   # Option 2: Manual setup
   cp backend/.env.example backend/.env
   # Edit backend/.env with your MongoDB URI and JWT secret
   
   # Option 3: Test database connection
   cd backend && node databasePopulate/testConnection.js
   ```

4. **Start development servers**
   ```bash
   # Start both frontend and backend
   npm start
   
   # Start only backend
   npm run dev:server
   
   # Start only frontend
   npm run dev:client
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## 🔑 Default Login Credentials

| Role       | Email                  | Password      |
|------------|------------------------|--------------|
| Admin      | admin@example.com      | Admin123!    |
| Student    | student@example.com    | Student123!  |
| Instructor | instructor@example.com | Instructor123!|
| Test User  | test@example.com       | Test123!     |

## 📚 Features

### For Students
- Track progress through courses and modules
- Take quizzes and view performance metrics
- View personalized learning insights and recommendations
- Set and track learning goals
- Access study materials and resources

### For Instructors
- Create and manage courses and modules
- Design quizzes and assessments
- Monitor student progress and performance
- Provide feedback and support

### For Administrators
- Manage users and permissions
- Generate reports and analytics
- Configure system settings
- Oversee platform content

## 🛠️ Technology Stack

- **Frontend**: React with Material-UI and Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JSON Web Tokens (JWT)
- **Testing**: Mocha and Chai

## 📂 Project Structure

```
project/
├── backend/           # Express server
│   ├── config/        # Configuration files
│   ├── controllers/   # Request handlers
│   ├── middleware/    # Express middleware
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   └── test/          # Backend tests
├── frontend/          # React application
│   ├── public/        # Static files
│   └── src/           # React components
│       ├── components/  # Reusable components
│       ├── context/     # React contexts
│       ├── pages/       # Page components
│       └── utils/       # Utility functions
```

## 🧪 Testing

Run tests using:

```bash
# Run all tests
npm test

# Test authentication
cd backend && node basicLoginTest.js

# Test database connection
cd backend && node databasePopulate/testConnection.js
```

## 🔧 Troubleshooting

### Database Connection Issues

If you're getting database connection errors after pulling from main:

1. **Missing .env file:**
   ```bash
   cd backend
   node setup-database.js  # Interactive setup
   # OR
   cp .env.example .env     # Manual setup
   ```

2. **MongoDB Atlas Issues:**
   - Verify your IP address is whitelisted
   - Check username/password in connection string
   - Ensure cluster is running

3. **Local MongoDB Issues:**
   ```bash
   # Start MongoDB service (macOS with Homebrew)
   brew services start mongodb-community
   
   # Or check if MongoDB is running
   mongosh --eval "db.runCommand({connectionStatus: 1})"
   ```

4. **Test connection:**
   ```bash
   cd backend && node databasePopulate/testConnection.js
   ```

### Common Error Messages

- **"MongooseError: Operation failed"** → Check internet connection and MongoDB URI
- **"Authentication failed"** → Verify username/password in connection string
- **"Network timeout"** → Check firewall settings and IP whitelist
- **"Cannot find module '.env'"** → Run `node setup-database.js` to create .env file

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course (instructor/admin)
- `GET /api/courses/:id` - Get course by ID
- `PUT /api/courses/:id` - Update course (instructor/admin)
- `DELETE /api/courses/:id` - Delete course (admin)
- `POST /api/courses/:id/enroll` - Enroll in course

### Learning Progress
- `GET /api/progress` - Get user's learning progress
- `PUT /api/progress/:moduleId` - Update module progress

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributors

- Team 77 - QUT MIT