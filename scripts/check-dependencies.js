const fs = require('fs');
const path = require('path');

const requiredDeps = ['bcrypt', 'express', 'mongoose'];
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json')));

const missing = requiredDeps.filter(dep => !packageJson.dependencies[dep]);

if (missing.length) {
    console.error('Missing dependencies:', missing);
    console.log('Run: npm install ' + missing.join(' '));
    process.exit(1);
}