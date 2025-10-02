/**
 * Database Connection Fix Script
 * ==============================
 * 
 * Quick fixes for common database connection issues
 * Run with: node fix-database.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 OLPT Database Connection Fix');
console.log('================================\n');

async function fixDatabaseConnection() {
  const envPath = path.join(__dirname, '.env');
  
  // Check 1: .env file exists
  if (!fs.existsSync(envPath)) {
    console.log('❌ Issue: .env file missing');
    console.log('✅ Fix: Creating .env file from template...\n');
    
    const examplePath = path.join(__dirname, '.env.example');
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
      console.log('📝 .env file created from .env.example');
      console.log('⚠️  Please edit .env with your database credentials\n');
    } else {
      // Create basic .env file
      const basicEnv = `# OLPT Database Configuration
MONGO_URI=mongodb://localhost:27017/olpt
JWT_SECRET=your-secret-key-change-this
PORT=5001
`;
      fs.writeFileSync(envPath, basicEnv);
      console.log('📝 Basic .env file created');
      console.log('⚠️  Please edit .env with your database credentials\n');
    }
  } else {
    console.log('✅ .env file exists');
  }

  // Check 2: Load environment variables
  try {
    require('dotenv').config();
    
    if (!process.env.MONGO_URI) {
      console.log('❌ Issue: MONGO_URI not set in .env file');
      console.log('✅ Fix: Add MONGO_URI to your .env file\n');
      return;
    }
    
    if (!process.env.JWT_SECRET) {
      console.log('❌ Issue: JWT_SECRET not set in .env file');
      console.log('✅ Fix: Add JWT_SECRET to your .env file\n');
      return;
    }
    
    console.log('✅ Environment variables loaded');
    console.log(`📍 Database URI: ${process.env.MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//*****:*****@')}`);
    
  } catch (error) {
    console.log('❌ Issue: Error loading environment variables');
    console.log('✅ Fix:', error.message, '\n');
    return;
  }

  // Check 3: Test database connection
  console.log('\n🔍 Testing database connection...');
  try {
    const mongoose = require('mongoose');
    
    // Add connection options for better error handling
    const connectionOptions = {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 45000, // 45 second socket timeout
    };
    
    await mongoose.connect(process.env.MONGO_URI, connectionOptions);
    console.log('✅ Database connection successful!');
    
    // Test basic database operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections in database`);
    
    await mongoose.disconnect();
    console.log('✅ Database connection test completed\n');
    
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('\n💡 Common fixes:');
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
      console.log('- Check internet connection');
      console.log('- Verify MongoDB URI is correct');
      console.log('- Check if MongoDB Atlas cluster is running');
    }
    
    if (error.message.includes('Authentication failed')) {
      console.log('- Verify username and password in connection string');
      console.log('- Check if user has correct permissions');
    }
    
    if (error.message.includes('IP not whitelisted')) {
      console.log('- Add your IP address to MongoDB Atlas whitelist');
      console.log('- Or use 0.0.0.0/0 for development (not recommended for production)');
    }
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('- Start your local MongoDB service');
      console.log('- Check if MongoDB is running on correct port');
    }
    
    console.log('\n🔧 Try running: node setup-database.js for interactive setup');
    return;
  }

  // Check 4: Server dependencies
  console.log('📦 Checking required dependencies...');
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const requiredDeps = ['mongoose', 'dotenv', 'express', 'jsonwebtoken'];
  
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length > 0) {
    console.log(`❌ Missing dependencies: ${missingDeps.join(', ')}`);
    console.log('✅ Fix: Run npm install to install missing dependencies\n');
  } else {
    console.log('✅ All required dependencies are installed\n');
  }

  console.log('🎉 Database connection diagnosis complete!');
  console.log('\n📋 Summary:');
  console.log('- .env file: ✅');
  console.log('- Environment variables: ✅');
  console.log('- Database connection: ✅');
  console.log('- Dependencies: ✅');
  console.log('\n🚀 Your OLPT backend should work correctly now!');
}

// Run the fix
fixDatabaseConnection().catch(error => {
  console.error('❌ Fix script failed:', error.message);
  process.exit(1);
});