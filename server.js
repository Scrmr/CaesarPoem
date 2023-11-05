require('dotenv').config();

const axios = require('axios');

async function generatePoemWithAI(input) {
  try {
    const response = await axios.post('https://api.openai.com/v1/engines/text-davinci-003/completions', {
      prompt: input,
      max_tokens: 150, // Adjust based on how long you want the poem to be
      temperature: 0.7, // Adjust for creativity
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });
    return response.data.choices[0].text;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return null; // Handle the error appropriately in your application
  }
}




const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.static('public'));
app.use(express.json());
app.use(cors());


app.post('/generate-poem', async (req, res) => {
  const userInput = req.body.input;
  const poem = await generatePoemWithAI(userInput);
  if (poem) {
    res.json({ poem });
  } else {
    res.status(500).json({ error: 'Could not generate poem' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Add this function within your server.js
function applyCaesarCipherToPoem(poem, shift) {
  return poem.split(' ').map(word => {
    // Randomly decide to encrypt the word or not
    if (Math.random() > 0.5) {
      return caesarCipher(word, shift);
    }
    return word;
  }).join(' ');
}