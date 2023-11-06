require('dotenv').config();

const axios = require('axios');
const express = require('express');
const cors = require('cors');

// Caesar cipher function
function caesarCipher(str, shift) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  return str.split('').map(char => {
    let index = alphabet.indexOf(char);
    if(index === -1) {
      // Character not in the alphabet, leave it as is
      return char;
    }
    let newIndex = (alphabet.length / 2 + index + shift) % (alphabet.length / 2);
    return alphabet[index < alphabet.length / 2 ? newIndex : newIndex + alphabet.length / 2];
  }).join('');
}

// Function to apply Caesar cipher to every 10th word and track encrypted words
function applyCaesarCipherToPoem(poem, shift) {
  let words = poem.match(/[\w'’]+|[.,!?;"]/g) || [];
  let encryptedWordIndices = []; // This will hold the indices of encrypted words
  for (let i = 9; i < words.length; i += 10) {
    words[i] = caesarCipher(words[i], shift);
    encryptedWordIndices.push(i); // Store the index of the encrypted word
  }
  return { cipheredPoem: words.join(' '), encryptedWordIndices };
}


async function generatePoemWithAI(input) {
  try {
    const response = await axios.post('https://api.openai.com/v1/engines/text-davinci-003/completions', {
      prompt: input,
      max_tokens: 150,
      temperature: 0.7,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });
    return response.data.choices[0].text;
  } catch (error) {
    console.error('Error calling OpenAI API:', error.response ? error.response.data : error.message);
    return null;  
  }
}

const app = express();
app.use(express.static(''));
app.use(express.json());
app.use(cors());

app.post('/generate-poem', async (req, res) => {
  const userInput = req.body.input;
  const rawPoem = await generatePoemWithAI(userInput);
  if (rawPoem) {
    const { cipheredPoem, encryptedWordIndices } = applyCaesarCipherToPoem(rawPoem, 3); // Apply the cipher to the poem
    res.json({ poem: cipheredPoem, encryptedWordIndices });
  } else {
    res.status(500).json({ error: 'Could not generate poem' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


