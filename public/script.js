document.addEventListener('DOMContentLoaded', (event) => {
    // Get references to the DOM elements
    const wordInput = document.getElementById('word-input');
    const generateBtn = document.getElementById('generate-btn');
    const poemContainer = document.getElementById('poem-container');

    // Function to validate the input is 10 words or fewer
    function validateInput(input) {
        const words = input.split(/\s+/); // Split by any whitespace
        return words.length <= 10 && words.length > 0;
    }

    // Mock function to "encrypt" a word - for now, we'll just reverse it
    function encryptWord(word) {
        return word.split('').reverse().join('');
    }

    // Function to "decrypt" the encrypted word - for now, it's just reversing it back
    function decryptWord(encryptedWord) {
        return encryptedWord.split('').reverse().join('');
    }

    // Function to handle the decryption attempt
    function handleDecryptionAttempt(encryptedSpan) {
        const originalWord = decryptWord(encryptedSpan.textContent.trim());
        const userGuess = prompt('What is the decrypted word?').trim();

        if (userGuess.toLowerCase() === originalWord.toLowerCase()) {
            encryptedSpan.textContent = originalWord;
            encryptedSpan.classList.remove('encrypted');
            encryptedSpan.classList.add('correct'); // Add this new class to highlight correct guesses
            alert('Correct!');
        } else {
            alert('Not quite, try again.');
        }
    }

   // Event listener for the generate button
generateBtn.addEventListener('click', async () => {
    const userInput = wordInput.value.trim();
    if (!validateInput(userInput)) {
        alert('Please enter up to 10 words.');
        return;
    }

    try {
        const response = await fetch('/generate-poem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input: userInput }),
        });
        const data = await response.json();
        if (data.poem) {
            displayPoem(data.poem); // Implement this function to display the poem
        } else {
            alert('Failed to generate poem.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while generating the poem.');
    }
});

function displayPoem(poem) {
    poemContainer.innerHTML = ''; // Clear the previous poem
    const lines = poem.split('\n'); // Assuming the poem is separated by new lines
    lines.forEach(line => {
        const p = document.createElement('p');
        p.textContent = line;
        poemContainer.appendChild(p);
    });
}


function caesarCipher(str, shift) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    return str
      .toLowerCase()
      .split('')
      .map(char => {
        if (alphabet.includes(char)) {
          let newIndex = (alphabet.indexOf(char) + shift) % 26;
          return alphabet[newIndex];
        }
        return char;
      })
      .join('');
  }
  

    });
