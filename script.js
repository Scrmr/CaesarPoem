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
    } // This closing brace was missing

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
        const poemWords = words.map(word => word.split('').reverse().join('')); // Reverse each word to simulate "poem" generation
        const randomIndex = Math.floor(Math.random() * poemWords.length); // Choose a random word to "encrypt"
        poemWords[randomIndex] = encryptWord(poemWords[randomIndex]); // "Encrypt" one random word
        return poemWords.join(' '); // Join the words back into a string
    }

    // Event listener for the generate button
    generateBtn.addEventListener('click', () => {
        const userInput = wordInput.value.trim();

        // Validate the input
        if (!validateInput(userInput)) {
            alert('Please enter up to 10 words.');
            return;
        }

        // Generate the poem and display it
        const poem = generatePoem(userInput);
        poemContainer.textContent = ''; // Clear the container
        poem.split(/\s+/).forEach((word, index) => {
            const span = document.createElement('span');
            span.textContent = word + ' ';
            if (word === encryptWord(word)) { // If the word is the "encrypted" one, add a class
                span.classList.add('encrypted');
            }
            poemContainer.appendChild(span);
        });

        // Add click event listeners to the encrypted words to allow decryption attempts
        const encryptedSpans = document.querySelectorAll('.encrypted');
        encryptedSpans.forEach(span => {
            span.addEventListener('click', () => handleDecryptionAttempt(span));
        });
    });
});
