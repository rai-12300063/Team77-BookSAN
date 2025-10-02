# Database Models Reference

This document provides an overview of the database models in the Online Learning Progress Tracker application.

## User Model

**Purpose**: Represents users in the system including students, instructors, and administrators.

**Key Fields**:
- `name`: User's full name
- `email`: User's email address (unique)
- `password`: Hashed password
- `role`: User role (admin, instructor, student)
- `createdAt`: Account creation date
- `updatedAt`: Last account update

## Course Model

**Purpose**: Represents educational courses offered in the system.

**Key Fields**:
- `title`: Course title
- `description`: Course description
- `category`: Subject category
- `difficulty`: Course difficulty level (Beginner, Intermediate, Advanced)
- `instructor`: Reference to instructor user
- `duration`: Course duration (weeks and hours per week)
- `modules`: Array of references to Module documents
- `enrollmentCount`: Number of enrolled students
- `isActive`: Whether course is currently active

## Module Model

**Purpose**: Represents individual learning modules within courses.

**Key Fields**:
- `title`: Module title
- `description`: Module description
- `content`: HTML content for the module
- `courseId`: Reference to parent course
- `moduleNumber`: Position in course sequence
- `createdBy`: Reference to creator user
- `difficulty`: Module difficulty
- `estimatedDuration`: Estimated completion time in minutes
- `isPublished`: Whether module is visible to students

## Quiz Model

**Purpose**: Represents assessments for testing knowledge.

**Key Fields**:
- `title`: Quiz title
- `description`: Quiz description
- `courseId`: Reference to associated course
- `questions`: Array of question objects containing:
  - `question`: Question text
  - `options`: Possible answers
  - `correctAnswer`: Correct answer
  - `points`: Points awarded for correct answer
- `createdBy`: Reference to creator user
- `timeLimit`: Time limit in minutes (optional)
- `passingScore`: Minimum score to pass

## LearningProgress Model

**Purpose**: Tracks student progress through courses.

**Key Fields**:
- `userId`: Reference to student user
- `courseId`: Reference to course
- `enrollmentDate`: When student enrolled
- `completionPercentage`: Overall course completion percentage
- `moduleProgress`: Array of objects tracking progress in each module:
  - `moduleId`: Reference to module
  - `completed`: Whether module is completed
  - `progressPercentage`: Percentage complete
  - `startedAt`: When module was started
  - `completedAt`: When module was completed

## QuizAttempt Model

**Purpose**: Records student attempts at quizzes.

**Key Fields**:
- `userId`: Reference to student user
- `quizId`: Reference to quiz
- `courseId`: Reference to course
- `startedAt`: When attempt was started
- `completedAt`: When attempt was completed
- `score`: Points earned
- `isPassed`: Whether attempt achieved passing score
- `answers`: Array of answers submitted by student