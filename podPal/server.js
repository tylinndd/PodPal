// server.js
const express = require('express');
const fetch = require('node-fetch'); // install it if needed
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public')); // serve your files

// Endpoint for assistant
app.post('/api/assistant', async (req, res) => {
  const userInput = req.body.userInput;

  if (!userInput) {
    return res.status(400).send('Missing user input');
  }

  try {
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ASSIST_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // ✅ using gpt-4o-mini
        messages: [
          { role: 'system', content: 'You are a music assistant for Auri. Only reply with a simple sentence suggesting a search query, like: "Play Taylor Swift" or "Find Lo-Fi Chill Beats".' },
          { role: 'user', content: userInput },
        ],
        max_tokens: 100,
        temperature: 0.5,
      }),
    });

    const data = await openAIResponse.json();
    const assistantResponse = data.choices[0].message.content.trim();

    res.status(200).json({ assistantResponse });
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    res.status(500).send('Failed to get response from OpenAI');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
