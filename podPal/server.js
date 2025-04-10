// server.js
const express = require('express');
const fetch = require('node-fetch'); // Make sure to install this
require('dotenv').config(); // To load API key from .env file

const app = express();
const PORT = 3000;

app.use(express.static('public')); // Serve your HTML, CSS, JS files

app.get('/search', async (req, res) => {
  const query = req.query.q;
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!query) {
    return res.status(400).send('Missing search query');
  }

  try {
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${apiKey}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching YouTube API:', error);
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
