// Run cd Downloads/ProjectWebsite/ProjectWebsite
// node server.js

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const bodyParser = require('body-parser');  // Make sure body-parser is imported

const app = express();
const port = 3000;

// Enable CORS for the FastAPI backend's address
app.use(cors({
    origin: "http://localhost:8000",  // Frontend origin
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],  // Add any headers you might use
}));

// Serve static files like HTML, CSS, and JS
app.use(express.static('public'));

// API route to handle search requests
app.get('/search', async (req, res) => {
    const query = req.body.query || '';  // Get the query parameter from body
    console.log('Received query: ', query); // Log the query

    try {
        const response = await fetch('http://localhost:8000/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: query })  // Correctly forward the name field
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Error Response Body: ', errorBody);
            throw new Error(`Failed to fetch data from FastAPI. Status: ${response.status}. Response: ${errorBody}`);
        }

        const data = await response.json();
        console.log('Fetched Data: ', data);

        if (Array.isArray(data)) {
            // Fetch detailed game information for the first match
            const gameInfo = await fetchDetailedGameInfo(data[0]); // Assuming the first match is the right one
            res.json(data);
        } else {
            res.json([]);  // Return an empty array if no results
        }

    } catch (error) {
        console.error('Error fetching games: ', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/add-game', (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Game name is required' });
    }

    // Example database interaction (replace with actual DB logic)
    console.log(`Adding game: ${name}`);
    
    // Simulate success
    res.status(200).json({ message: `${name} added to the database!` });
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
