const express = require('express');
const bcrypt = require('bcrypt');  // Hashing library
const bodyParser = require('body-parser');  // For parsing incoming request bodies
const cors = require('cors');  // Cross-origin resource sharing (CORS) middleware

const app = express();
const port = 3000;

// Middleware to parse JSON bodies in POST requests
app.use(bodyParser.json());

// Enable CORS for the frontend to interact with the backend
app.use(cors({
    origin: ['http://localhost:8000', 'http://127.0.0.1:5500'],  // Allow these origins for frontend communication
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

// Serve static files (like HTML, CSS, JS)
app.use(express.static('public'));

// Example route for user signup
app.post('/signup', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    // Validate input
    if (!username || !email || !password || password !== confirmPassword) {
        return res.status(400).json({ error: 'Invalid input or passwords do not match' });
    }
});



// Example route for user login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Compare the provided password with the stored (hashed) password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Success, return a success message (could also return a JWT token here)
        res.status(200).json({ message: 'Login successful!' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// A test route to check if the server is working
app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
