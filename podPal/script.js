// Example of fetching data from an API
async function fetchData(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Example usage
const apiUrl = 'https://api.example.com/data';
fetchData(apiUrl);

const menuButton = document.querySelector(".button.menu");
const navMenu = document.getElementById("navMenu");
const screenOverlay = document.getElementById("screenOverlay");
const scrollUpBtn = document.getElementById("scrollUp");
const scrollDownBtn = document.getElementById("scrollDown");
const centerButton = document.querySelector(".center-button");

const navButtons = Array.from(
  document.querySelectorAll("#navMenu .nav-button")
);

const themeToggle = document.getElementById("themeToggle");
const ipodElement = document.querySelector(".ipod");
const colorCircles = document.querySelectorAll(".color-circle");

let currentIndex = 0;
let navIndex = 0;
let inNavMode = false;
let colorIndex = 0; // for navigating color circles

const scrollAmount = 60;

// === Helpers ===
function getCurrentAlbums() {
  const activeScreen = document.querySelector(".app-screen.show");
  return Array.from(activeScreen.querySelectorAll(".album"));
}

function getCurrentSettings() {
  const activeScreen = document.querySelector(".app-screen.show");
  return Array.from(activeScreen.querySelectorAll(".setting-item"));
}

function getCurrentScrollContainer() {
  const activeScreen = document.querySelector(".app-screen.show");
  return (
    activeScreen.querySelector(".playlist-section") ||
    activeScreen.querySelector(".library-section") ||
    activeScreen.querySelector(".settings-container")
  );
}

// === Navigation Toggle ===
menuButton.addEventListener("click", () => {
  const isOpen = navMenu.classList.contains("show");

  if (isOpen) {
    navMenu.classList.remove("show");
    screenOverlay.classList.remove("show");
    document.querySelector(".screen").classList.remove("no-scroll");
    inNavMode = false;
  } else {
    navMenu.classList.add("show");
    screenOverlay.classList.add("show");
    document.querySelector(".screen").classList.add("no-scroll");
    inNavMode = true;

    const currentScreen = document.querySelector(".app-screen.show");
    let currentId = "home";
    if (currentScreen) {
      const match = currentScreen.id.match(/^(.+)-screen$/);
      if (match) currentId = match[1];
    }

    navIndex = navButtons.findIndex((btn) =>
      btn.getAttribute("onclick")?.includes(currentId)
    );
    if (navIndex === -1) navIndex = 0;
    highlightNav(navIndex);
  }
});

// === Overlay click closes menu ===
screenOverlay.addEventListener("click", () => {
  navMenu.classList.remove("show");
  screenOverlay.classList.remove("show");
  document.querySelector(".screen").classList.remove("no-scroll");
  inNavMode = false;
});

// === Show screen ===
function showScreen(screenId) {
  document.querySelectorAll(".app-screen").forEach((screen) => {
    screen.classList.remove("show");
  });

  const selected = document.getElementById(`${screenId}-screen`);
  if (selected) selected.classList.add("show");

  document.querySelector(".screen").classList.remove("no-scroll");
  navMenu.classList.remove("show");
  screenOverlay.classList.remove("show");
  inNavMode = false;

  currentIndex = 0;
  highlightCurrentItem();
}

// === Highlighting ===
function highlightAlbum(index) {
  const albums = getCurrentAlbums();
  albums.forEach((album, i) => {
    album.classList.toggle("selected", i === index);
  });
  if (albums[index]) {
    albums[index].scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function highlightSettings(index) {
  const settings = getCurrentSettings();
  settings.forEach((setting, i) => {
    setting.classList.toggle("selected", i === index);
  });
  if (settings[index]) {
    settings[index].scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function highlightCurrentItem() {
  const isSettings = document
    .querySelector("#settings-screen")
    .classList.contains("show");
  if (isSettings) {
    highlightSettings(currentIndex);
  } else {
    highlightAlbum(currentIndex);
  }
}

function highlightNav(index) {
  navButtons.forEach((btn, i) => {
    btn.classList.toggle("selected", i === index);
  });
  navButtons[index].scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// === Scroll Down ===
scrollDownBtn.addEventListener("click", () => {
  if (inNavMode) {
    if (navIndex < navButtons.length - 1) {
      navIndex++;
      highlightNav(navIndex);
    }
  } else {
    const isSettings = document
      .querySelector("#settings-screen")
      .classList.contains("show");
    const items = isSettings ? getCurrentSettings() : getCurrentAlbums();
    const container = getCurrentScrollContainer();

    if (isSettings) {
      const currentSetting = items[currentIndex]?.dataset.setting;

      if (
        currentSetting === "color" &&
        items[currentIndex].classList.contains("selected")
      ) {
        if (colorIndex < colorCircles.length - 1) {
          colorCircles[colorIndex].classList.remove("selected");
          colorIndex++;
          colorCircles[colorIndex].classList.add("selected");
        }
      } else {
        if (currentIndex < items.length - 1) {
          currentIndex++;
          highlightCurrentItem();
          colorIndex = 0; // reset when moving between settings
        } else if (container) {
          container.scrollBy({ top: scrollAmount, behavior: "smooth" });
        }
      }
    } else {
      if (currentIndex < items.length - 1) {
        currentIndex++;
        highlightCurrentItem();
      } else if (container) {
        container.scrollBy({ top: scrollAmount, behavior: "smooth" });
      }
    }
  }
});

// === Scroll Up ===
scrollUpBtn.addEventListener("click", () => {
  if (inNavMode) {
    if (navIndex > 0) {
      navIndex--;
      highlightNav(navIndex);
    }
  } else {
    const isSettings = document
      .querySelector("#settings-screen")
      .classList.contains("show");
    const items = isSettings ? getCurrentSettings() : getCurrentAlbums();
    const container = getCurrentScrollContainer();

    if (isSettings) {
      const currentSetting = items[currentIndex]?.dataset.setting;

      if (
        currentSetting === "color" &&
        items[currentIndex].classList.contains("selected")
      ) {
        if (colorIndex > 0) {
          colorCircles[colorIndex].classList.remove("selected");
          colorIndex--;
          colorCircles[colorIndex].classList.add("selected");
        } else {
          // Move up to previous setting when at first color circle
          if (currentIndex > 0) {
            items[currentIndex].classList.remove("selected");
            currentIndex--;
            highlightCurrentItem();
            colorIndex = 0;
          }
        }
      } else {
        if (currentIndex > 0) {
          currentIndex--;
          highlightCurrentItem();
          colorIndex = 0;
        } else if (container) {
          container.scrollBy({ top: -scrollAmount, behavior: "smooth" });
        }
      }
    } else {
      if (currentIndex > 0) {
        currentIndex--;
        highlightCurrentItem();
      } else if (container) {
        container.scrollBy({ top: -scrollAmount, behavior: "smooth" });
      }
    }
  }
});

// === Center Button Select ===
centerButton.addEventListener("click", () => {
  if (inNavMode) {
    const selectedBtn = navButtons[navIndex];
    flashHighlight(selectedBtn);
    selectedBtn.click();
  } else {
    const isSettings = document
      .querySelector("#settings-screen")
      .classList.contains("show");
    const items = isSettings ? getCurrentSettings() : getCurrentAlbums();
    const selectedItem = items[currentIndex];
    flashHighlight(selectedItem);

    if (isSettings) {
      const settingType = selectedItem.dataset.setting;
      if (settingType === "theme") {
        themeToggle.checked = !themeToggle.checked;
        themeToggle.dispatchEvent(new Event("change"));
      } else if (settingType === "color") {
        const selectedColor = colorCircles[colorIndex].dataset.color;
        ipodElement.style.backgroundColor = selectedColor;
      }
    } else {
      // Optional: album action
    }
  }
});

// === Flash Highlight ===
function flashHighlight(element) {
  if (!element) return;
  element.classList.add("clicked");
  setTimeout(() => {
    element.classList.remove("clicked");
  }, 300);
}

// === Init on Load ===
window.addEventListener("DOMContentLoaded", () => {
  showScreen("home");
  document.documentElement.setAttribute("data-theme", "dark");
  colorCircles[0]?.classList.add("selected");
});

// === Theme Toggle ===
themeToggle.addEventListener("change", () => {
  if (themeToggle.checked) {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
  }
});

colorCircles.forEach((circle) => {
  const color = circle.dataset.color;
  circle.style.backgroundColor = color;
});

const micPopup = document.getElementById("micPopup");
let micHoldTimer = null;

const micHoldThreshold = 750; // .75 second

// === Handle press start ===
function handlePressStart() {
  micHoldTimer = setTimeout(() => {
    micPopup.classList.add("show");
    screenOverlay.classList.add("show"); // darken background
  }, micHoldThreshold);
}

// === Handle press end ===
function handlePressEnd() {
  clearTimeout(micHoldTimer);
  micHoldTimer = null;

  if (micPopup.classList.contains("show")) {
    micPopup.classList.remove("show");
    screenOverlay.classList.remove("show"); // remove dark overlay
  }
}

// === Bind for both mouse and touch ===
centerButton.addEventListener("mousedown", handlePressStart);
centerButton.addEventListener("mouseup", handlePressEnd);
centerButton.addEventListener("mouseleave", handlePressEnd);

centerButton.addEventListener("touchstart", handlePressStart);
centerButton.addEventListener("touchend", handlePressEnd);
centerButton.addEventListener("touchcancel", handlePressEnd);

// Example call
//updateNowPlaying({
// title: "Blinding Lights",
// artist: "The Weeknd",
// coverUrl: "https://via.placeholder.com/120?text=Blinding+Lights"
//});
