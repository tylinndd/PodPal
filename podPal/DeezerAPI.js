let musicPlaylist = []; // stores all tracks from search
let currentTrackIndex = 0;

function searchDeezer(queryString = null) {
  const query = queryString || document.getElementById("searchQuery").value.trim();
  
  if (!query) {
    alert("Please enter a search query.");
    return;
  }

  console.log("🎯 Searching for:", query);

  const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&output=jsonp&callback=handleResults`;

  // Remove any existing JSONP script to prevent duplicates
  const oldScript = document.getElementById("jsonpScript");
  if (oldScript) {
    oldScript.remove();
  }

  // Create and append the new JSONP script
  const script = document.createElement("script");
  script.src = url;
  script.id = "jsonpScript";
  document.body.appendChild(script);
}

// This function needs to exist to handle the JSONP callback
function handleResults(data) {
  if (data && data.data && data.data.length > 0) {
    const track = data.data[0]; // pick the first track

    const musicPlayer = document.getElementById('music-player');
    const title = document.getElementById('nowplaying-title');
    const artist = document.getElementById('nowplaying-artist');
    const cover = document.getElementById('nowplaying-cover');

    title.textContent = track.title;
    artist.textContent = track.artist.name;
    cover.src = track.album.cover_medium; // use album cover
    musicPlayer.src = track.preview; // use Deezer's preview audio
    musicPlayer.play();

    console.log(`▶️ Now Playing: ${track.title} by ${track.artist.name}`);
  } else {
    alert('No results found.');
  }
}


function getArtistTopTracks(artistId) {
  const url = `https://api.deezer.com/artist/${artistId}/top?limit=10&output=jsonp&callback=handleArtistResults`;
  
  // Remove any existing JSONP script for artist results
  const oldScript = document.getElementById("artistScript");
  if (oldScript) oldScript.remove();
  
  // Create and append a new JSONP script for artist tracks
  const script = document.createElement("script");
  script.src = url;
  script.id = "artistScript";
  document.body.appendChild(script);
}

function handleArtistResults(response) {
  if (!response.data || response.data.length === 0) {
    console.log("No top tracks found for this artist.");
    return;
  }
  
  // Filter out the initial track if it's present in the results
  const initialTrackId = musicPlaylist[0].id;
  const filteredTracks = response.data.filter(track => track.id !== initialTrackId);
  
  // Append the artist's top tracks to the playlist, keeping the initial track at index 0
  musicPlaylist = [musicPlaylist[0], ...filteredTracks];
  
  // Optionally, re-display the currently playing track (still at index 0)
  displayTrack(currentTrackIndex);
}

function displayTrack(index) {
  const track = musicPlaylist[index];
  
  // Determine cover image URL based on the API's structure.
  let coverUrl = (track.album && track.album.cover_medium) || track.cover_art || "https://via.placeholder.com/120";
  
  document.getElementById("nowplaying-cover").src = coverUrl;
  document.getElementById("nowplaying-title").innerText = track.title;
  document.getElementById("nowplaying-artist").innerText = track.artist && track.artist.name ? track.artist.name : track.artist;
  
  // Play the preview
  const audio = document.getElementById("music-player");
  audio.src = track.preview;
  audio.play();
}

function nextTrack() {
  if (musicPlaylist.length === 0) return;
  currentTrackIndex = (currentTrackIndex + 1) % musicPlaylist.length;
  displayTrack(currentTrackIndex);
}

function prevTrack() {
  if (musicPlaylist.length === 0) return;
  currentTrackIndex = (currentTrackIndex - 1 + musicPlaylist.length) % musicPlaylist.length;
  displayTrack(currentTrackIndex);
}

// Expose the searchDeezer function globally
window.searchDeezer = searchDeezer;

// Expose the scroll functions globally
window.nextTrack = nextTrack;
window.prevTrack = prevTrack;

// === Integrating Speech Recognition ===

// Initialize SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.lang = 'en-US';
recognition.interimResults = true;

recognition.onresult = function(event) {
  let transcript = '';
  for (let i = event.resultIndex; i < event.results.length; ++i) {
    transcript += event.results[i][0].transcript;
  }

  // Show the voice input (for debugging purposes)
  console.log("Captured voice:", transcript);

  // Send the voice input to the backend assistant for processing
  fetch('/api/assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userInput: transcript }),
  })
  .then(response => response.json())
  .then(data => {
    // Process the assistant's response
    if (data.assistantResponse) {
      // If the assistant returns a query for music, perform the search
      if (data.assistantResponse.toLowerCase().includes("music")) {
        const searchQuery = data.assistantResponse.replace("search for", "").trim();
        searchDeezer(searchQuery);  // Trigger music search
      } else {
        // Handle other commands
        console.log("Assistant says:", data.assistantResponse);
      }
    }
  })
  .catch(error => console.error('Error with assistant request:', error));
};

recognition.onerror = function(event) {
  console.error('Speech recognition error:', event.error);
};

// Add event listeners to buttons for starting and stopping speech recognition
const micButton = document.getElementById('micButton');
const micPopup = document.getElementById("micPopup");
const screenOverlay = document.getElementById("screenOverlay");

let micHoldTimer = null;

// Handle mic button press start
function handlePressStart() {
  micHoldTimer = setTimeout(() => {
    micPopup.classList.add("show");
    screenOverlay.classList.add("show"); // Darken background
    recognition.start();  // Start listening for speech input
  }, 750); // Delay before starting recognition
}

// Handle mic button press end
function handlePressEnd() {
  clearTimeout(micHoldTimer);
  micHoldTimer = null;
  
  if (micPopup.classList.contains("show")) {
    micPopup.classList.remove("show");
    screenOverlay.classList.remove("show"); // Remove dark overlay
  }

  recognition.stop();  // Stop recognition
}

micButton.addEventListener("mousedown", handlePressStart);
micButton.addEventListener("mouseup", handlePressEnd);
micButton.addEventListener("mouseleave", handlePressEnd);
micButton.addEventListener("touchstart", handlePressStart);
micButton.addEventListener("touchend", handlePressEnd);
micButton.addEventListener("touchcancel", handlePressEnd);
