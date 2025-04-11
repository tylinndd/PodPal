// Speech Recognition and Speech Synthesis Integration

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

  const micButton = document.getElementById('micButton');
  const micPopup = document.getElementById("micPopup");
  const screenOverlay = document.getElementById("screenOverlay");

  let micHoldTimer = null;

  // Handle press start
  function handlePressStart() {
    micHoldTimer = setTimeout(() => {
      micPopup.classList.add("show");
      screenOverlay.classList.add("show"); // darken background
      recognition.start();
      outputText.textContent = "Listening...";
    }, 750); // Delay before starting recording
  }

  // Handle press end
  function handlePressEnd() {
    clearTimeout(micHoldTimer);
    micHoldTimer = null;

    if (micPopup.classList.contains("show")) {
      micPopup.classList.remove("show");
      screenOverlay.classList.remove("show"); // remove dark overlay
      recognition.stop();
      outputText.textContent = "Stopped listening.";

      // Send captured text to the backend
      fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput: capturedText }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.assistantResponse) {
          outputText.textContent = "Assistant says: " + data.assistantResponse;

          // Text-to-speech: Use browser's speech synthesis to speak the response
          const speech = new SpeechSynthesisUtterance(data.assistantResponse);
          window.speechSynthesis.speak(speech);
        } else {
          outputText.textContent = "Error: Unable to get response from OpenAI.";
        }
      })
      .catch(error => {
        outputText.textContent = "Error: " + error.message;
      });
    }
  }

  micButton.addEventListener("mousedown", handlePressStart);
  micButton.addEventListener("mouseup", handlePressEnd);
  micButton.addEventListener("mouseleave", handlePressEnd);
  micButton.addEventListener("touchstart", handlePressStart);
  micButton.addEventListener("touchend", handlePressEnd);
  micButton.addEventListener("touchcancel", handlePressEnd);
}

const menuButton = document.querySelector(".button.menu");
const navMenu = document.getElementById("navMenu");
const screenOverlay = document.getElementById("screenOverlay");

menuButton.addEventListener("click", () => {
  const isOpen = navMenu.classList.contains("show");

  if (isOpen) {
    navMenu.classList.remove("show");
    screenOverlay.classList.remove("show");
    document.querySelector(".screen").classList.remove("no-scroll");
  } else {
    navMenu.classList.add("show");
    screenOverlay.classList.add("show");
    document.querySelector(".screen").classList.add("no-scroll");
  }
});

screenOverlay.addEventListener("click", () => {
  navMenu.classList.remove("show");
  screenOverlay.classList.remove("show");
  document.querySelector(".screen").classList.remove("no-scroll");
});

function showScreen(screenId) {
  // Hide all screens
  const screens = document.querySelectorAll('.app-screen');
  screens.forEach(screen => screen.classList.remove('show'));
  
  // Display the target screen. Expected id format: [screenId]-screen
  const targetScreen = document.getElementById(screenId + '-screen');
  if (targetScreen) {
    targetScreen.classList.add('show');
  } else {
    console.error('Screen with id "' + screenId + '-screen" not found.');
  }
  
  // Close the nav menu and remove overlay & no-scroll classes
  if (typeof navMenu !== 'undefined') navMenu.classList.remove('show');
  if (typeof screenOverlay !== 'undefined') screenOverlay.classList.remove('show');
  const screenContainer = document.querySelector('.screen');
  if (screenContainer) {
    screenContainer.classList.remove('no-scroll');
  }
}
