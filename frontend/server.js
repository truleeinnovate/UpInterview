const express = require('express');
const path = require('path');
const app = express();
 
// Serve static files from the build folder
app.use(express.static(path.join(__dirname, 'build')));
 
// Handle all routes with index.html for React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
 
// Use process.env.PORT if available, otherwise default to 3000
const port = process.env.PORT || 3000;
 
// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use.`);
    process.exit(1);
  }
});