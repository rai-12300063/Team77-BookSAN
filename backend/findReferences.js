// findReferences.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rootDir = path.join(__dirname); 

// Function to recursively search through directories
async function searchFiles(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory() && file !== 'node_modules') {
      // Recursively search subdirectories
      await searchFiles(fullPath);
    } else if (stats.isFile() && file.endsWith('.js')) {
      // Check if file contains references to LearningProgress
      await checkFile(fullPath);
    }
  }
}

// Function to check if a file contains references to LearningProgress
async function checkFile(filePath) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  let lineNumber = 0;
  let hasReference = false;
  
  for await (const line of rl) {
    lineNumber++;
    
    if (line.includes('LearningProgress')) {
      if (!hasReference) {
        console.log(`\nFile: ${filePath}`);
        hasReference = true;
      }
      console.log(`  Line ${lineNumber}: ${line.trim()}`);
    }
  }
}

// Start the search
console.log('Searching for references to LearningProgress...');
searchFiles(rootDir)
  .then(() => console.log('\nSearch complete!'))
  .catch(err => console.error('Error searching files:', err));