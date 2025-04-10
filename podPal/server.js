const express = require('express');
const fetch = require('node-fetch'); // Make sure to install this
require('dotenv').config(); // To load API key from .env file

const app = express();
const PORT = 3000;

app.use(express.json());  // To parse JSON body data
app.use(express.static('public')); // Serve your HTML, CSS, JS files

// Endpoint for assistant to process input
app.post('/api/assistant', async (req, res) => {
  const userInput = req.body.userInput;

  if (!userInput) {
    return res.status(400).send('Missing user input');
  }

  try {
    const openAIResponse = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-davinci-003',
        prompt: userInput,
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    const data = await openAIResponse.json();
    const assistantResponse = data.choices[0].text.trim();

    res.status(200).json({ assistantResponse });
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    res.status(500).send('Failed to get response from OpenAI');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
