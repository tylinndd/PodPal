let musicPlaylist = []; // stores all tracks from search
let currentTrackIndex = 0;

function searchDeezer(queryString = null) {
  const query = queryString || document.getElementById("searchQuery").value.trim();
  if (!query) {
    alert("Please enter a search query.");
    return;
  }
  
  const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&output=jsonp&callback=handleResults`;

  // Remove any existing JSONP script
  const oldScript = document.getElementById("jsonpScript");
  if (oldScript) oldScript.remove();

  // Create and append the new JSONP script
  const script = document.createElement("script");
  script.src = url;
  script.id = "jsonpScript";
  document.body.appendChild(script);
}

function handleResults(response) {
  const resultsDiv = document.getElementById("results");
  if (resultsDiv) {
    resultsDiv.innerHTML = "";
  }
  
  if (!response.data || response.data.length === 0) {
    if (resultsDiv) resultsDiv.innerHTML = "<p>No results found.</p>";
    return;
  }
  
  // Use the first track from the search results as the initial displayed track
  const initialDisplayedTrack = response.data[0];
  
  // Immediately display the first track
  musicPlaylist = [initialDisplayedTrack];
  currentTrackIndex = 0;
  displayTrack(currentTrackIndex);
  
  // New console print for debugging
  console.log("Search complete. Displaying track:", initialDisplayedTrack.title);
  
  // If an artist id is available, fetch the artist's top tracks
  if (initialDisplayedTrack.artist && initialDisplayedTrack.artist.id) {
    getArtistTopTracks(initialDisplayedTrack.artist.id);
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
  // If the track.album object exists and has cover_medium, use it.
  // Otherwise, fallback to track.cover_art.
  let coverUrl = (track.album && track.album.cover_medium) || track.cover_art || "https://via.placeholder.com/120";
  
  document.getElementById("nowplaying-cover").src = coverUrl;
  document.getElementById("nowplaying-title").innerText = track.title;
  // If artist is an object, use its name; otherwise, display the artist string.
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