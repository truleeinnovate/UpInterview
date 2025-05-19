require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the "build" folder
app.use(express.static(path.join(__dirname, 'build')));

// Handle SPA routing: serve index.html for all unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

console.log('frontend server.js process.env.PORT :', process.env.PORT)

// Use the PORT environment variable provided by Azure
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});