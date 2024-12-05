const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4041;

app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World! this is updated on 10:40 pm');
});

app.get('/api/message', (req, res) => {
    res.json({ message: 'Hello from the backend! now updated on 11:10 pm' });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
