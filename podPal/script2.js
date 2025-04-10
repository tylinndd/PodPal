const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const outputText = document.getElementById('output-text');
let capturedText = '';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  outputText.textContent = "Speech Recognition not supported in this browser.";
} else {
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = 'en-US';
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript;
    }
    capturedText = transcript;
    outputText.textContent = "You said: " + transcript;
  };

  recognition.onerror = (event) => {
    outputText.textContent = 'Error occurred: ' + event.error;
  };

  startButton.addEventListener('click', () => {
    recognition.start();
    outputText.textContent = "Listening...";
  });

  stopButton.addEventListener('click', async () => {
    recognition.stop();
    outputText.textContent = "Stopped listening.";

    // Send the captured text to the backend serverless function
    const response = await fetch('/api/assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput: capturedText }),
    });

    const data = await response.json();
    if (data.assistantResponse) {
      outputText.textContent = "Assistant says: " + data.assistantResponse;
    } else {
      outputText.textContent = "Error: Unable to get response from OpenAI.";
    }
  });
}