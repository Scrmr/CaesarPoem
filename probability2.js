document.addEventListener('DOMContentLoaded', () => {
    console.log("Probability2 script loaded successfully!");
    
    let userInputHistory = [];
    let correctPredictions = 0;
    let totalPredictions = 0;

    function handleUserInput(input) {
        console.log("User input:", input);
        userInputHistory.push(input);

        // Send the current state (last input) to get a prediction
        sendPredictionRequest(input);
    }

    function sendPredictionRequest(lastInput) {
        fetch('https://probability2-8ca2d64f5bb4.herokuapp.com/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state: lastInput })
        })
        .then(response => response.json())
        .then(data => {
            displayPrediction(data.action);
            updateModel(lastInput, data.action);
        })
        .catch(error => console.error('Error:', error));
    }

    function updateModel(lastInput, predictedInput) {
        let actualNextInput = userInputHistory[userInputHistory.length - 1];
        let reward = actualNextInput === predictedInput ? 1 : 0;
        if (reward === 1) correctPredictions++;

        fetch('https://probability2-8ca2d64f5bb4.herokuapp.com/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                state: lastInput,
                action: predictedInput,
                reward: reward,
                next_state: actualNextInput
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                totalPredictions++;
                updateAccuracyDisplay();
            }
        })
        .catch(error => console.error('Error:', error));
    }

    function displayPrediction(prediction) {
        document.getElementById('qLearningPrediction').textContent = prediction;
    }

    function updateAccuracyDisplay() {
        let accuracy = (correctPredictions / totalPredictions) * 100;
        document.getElementById('qLearningAccuracy').textContent = `Accuracy: ${accuracy.toFixed(2)}%`;
    }

    function resetGame() {
        userInputHistory = [];
        correctPredictions = 0;
        totalPredictions = 0;
        document.getElementById('buttonPressCount').textContent = '0';
        document.getElementById('qLearningPrediction').textContent = '-';
        document.getElementById('qLearningAccuracy').textContent = '0%';
    }

    // Event listeners for user input
    document.getElementById('buttonA').addEventListener('click', () => handleUserInput('a'));
    document.getElementById('buttonD').addEventListener('click', () => handleUserInput('d'));

    // Event listener for the reset button
    document.getElementById('resetButton').addEventListener('click', resetGame);

    document.addEventListener('keypress', (event) => {
        if (event.key.toLowerCase() === 'a') handleUserInput('a');
        if (event.key.toLowerCase() === 'd') handleUserInput('d');
    });
});
