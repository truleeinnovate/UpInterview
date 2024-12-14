const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4041;

// Custom middleware to log CORS details
app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    console.log(`Origin: ${req.headers.origin}`);
    next();
});

// Enable CORS and log CORS status
const corsOptions = {
    origin: (origin, callback) => {
        console.log(`Checking CORS for Origin: ${origin}`);
        callback(null, true); // Allow all origins; adjust as needed
    },
};
app.use(cors(corsOptions));

app.get('/', (req, res) => {
    res.send('hi this is backend home page');
});

app.get('/api/message', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
