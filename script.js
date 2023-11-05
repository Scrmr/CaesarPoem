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
    
    // Mock function to generate a poem with one "encrypted" word
    function generatePoem(input) {
        const words = input.split(/\s+/);
        const poemWords = words.map(word => word); // Keep the words as is for "poem" generation
        const randomIndex = Math.floor(Math.random() * poemWords.length); // Choose a random word to "encrypt"
        const encryptedWord = encryptWord(words[randomIndex]); // Encrypt the original word
        poemWords[randomIndex] = encryptedWord; // Replace one word with its "encrypted" version
        return { poemWords, encryptedWord }; // Return both the poem and the encrypted word
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

    });
