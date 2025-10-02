/**
 * Database Setup Script for OLPT
 * ===============================
 * 
 * This script helps set up the database connection for new users
 * Run with: node setup-database.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 OLPT Database Setup');
console.log('======================\n');

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

async function setupDatabase() {
  try {
    // Check if .env already exists
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      console.log('✅ .env file already exists!');
      const overwrite = await askQuestion('Do you want to overwrite it? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('👋 Setup cancelled. Existing .env file preserved.');
        rl.close();
        return;
      }
    }

    console.log('Please provide your database connection details:\n');

    // Get database type
    console.log('Database options:');
    console.log('1. MongoDB Atlas (cloud)');
    console.log('2. Local MongoDB');
    console.log('3. Use demo/test database');
    
    const dbType = await askQuestion('Choose database type (1-3): ');

    let mongoUri = '';
    let jwtSecret = '';

    switch (dbType) {
      case '1':
        console.log('\n📝 MongoDB Atlas Setup:');
        console.log('1. Go to https://cloud.mongodb.com/');
        console.log('2. Create a cluster and get your connection string');
        console.log('3. Replace <username>, <password>, and <dbname>\n');
        
        mongoUri = await askQuestion('Enter your MongoDB Atlas URI: ');
        break;

      case '2':
        const dbName = await askQuestion('Enter database name (default: olpt): ') || 'olpt';
        const port = await askQuestion('Enter MongoDB port (default: 27017): ') || '27017';
        mongoUri = `mongodb://localhost:${port}/${dbName}`;
        break;

      case '3':
        console.log('🧪 Using demo database (read-only)');
        mongoUri = 'mongodb+srv://demo:demo123@cluster0.oiovem3.mongodb.net/olpt-demo?retryWrites=true&w=majority&appName=Cluster0';
        break;

      default:
        console.log('❌ Invalid option. Using local database as default.');
        mongoUri = 'mongodb://localhost:27017/olpt';
    }

    // Generate JWT Secret
    const generateSecret = await askQuestion('Generate random JWT secret? (Y/n): ');
    if (generateSecret.toLowerCase() !== 'n') {
      jwtSecret = require('crypto').randomBytes(32).toString('base64');
      console.log('🔑 Generated secure JWT secret');
    } else {
      jwtSecret = await askQuestion('Enter your JWT secret: ');
    }

    const port = await askQuestion('Enter server port (default: 5001): ') || '5001';

    // Create .env content
    const envContent = `# OLPT Environment Configuration
# Generated on ${new Date().toISOString()}

# MongoDB Connection
MONGO_URI=${mongoUri}

# JWT Secret for authentication
JWT_SECRET=${jwtSecret}

# Server Configuration
PORT=${port}

# Additional settings (uncomment if needed)
# NODE_ENV=development
# CORS_ORIGIN=http://localhost:3000
`;

    // Write .env file
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env file created successfully!');

    // Test connection
    console.log('\n🔍 Testing database connection...');
    try {
      require('dotenv').config();
      const mongoose = require('mongoose');
      
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Database connection successful!');
      await mongoose.disconnect();
    } catch (error) {
      console.log('❌ Database connection failed:', error.message);
      console.log('\n💡 Tips:');
      console.log('- Check your MongoDB URI');
      console.log('- Ensure your IP is whitelisted (for Atlas)');
      console.log('- Verify your username/password');
      console.log('- Make sure MongoDB service is running (for local)');
    }

    console.log('\n🎉 Setup complete! You can now start the server with:');
    console.log('   npm start  or  node server.js');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }

  rl.close();
}

setupDatabase();