const { execSync } = require('child_process');

try {
    console.log('Installing bcrypt...');
    execSync('npm install bcrypt --save', { 
        stdio: 'inherit',
        cwd: process.cwd() // This ensures we run from project root
    });
    console.log('bcrypt installed successfully');
} catch (error) {
    console.error('Failed to install bcrypt:', error);
    process.exit(1);
}