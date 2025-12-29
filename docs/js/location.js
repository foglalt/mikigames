// Location page logic - handles collecting items from QR code locations

import { recordCollection, hasUserCollectedLocation } from './firebase.js';

const USER_KEY = 'qr_quiz_user';

// Get DOM elements
const loadingSection = document.getElementById('loading-section');
const noUserSection = document.getElementById('no-user-section');
const invalidLocationSection = document.getElementById('invalid-location-section');
const collectSection = document.getElementById('collect-section');
const alreadyCollectedSection = document.getElementById('already-collected-section');

const locationIcon = document.getElementById('location-icon');
const locationNameBadge = document.getElementById('location-name');
const randomizerContainer = document.getElementById('randomizer-container');
const randomizerCard = document.getElementById('randomizer-card');
const randomTitle = document.getElementById('random-title');
const randomContent = document.getElementById('random-content');
const randomAuthor = document.getElementById('random-author');
const collectibleReveal = document.getElementById('collectible-reveal');
const collectibleTitle = document.getElementById('collectible-title');
const collectibleContent = document.getElementById('collectible-content');
const collectibleAuthor = document.getElementById('collectible-author');
const collectBtn = document.getElementById('collect-btn');
const successMessage = document.getElementById('success-message');

// Already collected elements
const existingTitle = document.getElementById('existing-title');
const existingContent = document.getElementById('existing-content');
const existingAuthor = document.getElementById('existing-author');

// Current state
let currentCollectible = null;
let currentLocation = null;
let currentLocationData = null;
let currentUser = null;
let allCollectibles = [];

// Random placeholder quotes for the animation
const placeholderQuotes = [
  { title: "Mystery Quote", content: "The universe is full of magical things...", author: "Unknown" },
  { title: "Hidden Wisdom", content: "Every moment is a fresh beginning...", author: "Ancient Proverb" },
  { title: "Secret Words", content: "In the middle of difficulty lies opportunity...", author: "Wise One" },
  { title: "Lost Knowledge", content: "The only true wisdom is knowing you know nothing...", author: "Philosopher" },
  { title: "Ancient Truth", content: "What we think, we become...", author: "Master" },
  { title: "Timeless Insight", content: "The journey is the reward...", author: "Traveler" },
  { title: "Forgotten Lore", content: "Stars can't shine without darkness...", author: "Dreamer" },
  { title: "Sacred Text", content: "Be the change you wish to see...", author: "Sage" }
];

/**
 * Get the current user from localStorage
 */
function getCurrentUser() {
  try {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
}

/**
 * Get location ID from URL parameters
 */
function getLocationIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

/**
 * Load collectibles data from JSON file
 */
async function loadCollectiblesData() {
  try {
    const response = await fetch('data/questions.json');
    if (!response.ok) throw new Error('Failed to load data');
    return await response.json();
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
}

/**
 * Show a specific section and hide others
 */
function showSection(sectionToShow) {
  [loadingSection, noUserSection, invalidLocationSection, collectSection, alreadyCollectedSection]
    .forEach(section => section.classList.add('hidden'));
  sectionToShow.classList.remove('hidden');
}

/**
 * Render the collectible item
 */
function renderCollectible(collectible, locationData) {
  locationIcon.textContent = locationData.icon || '📍';
  locationNameBadge.textContent = locationData.name;
  collectibleTitle.textContent = collectible.title;
  collectibleContent.textContent = `"${collectible.content}"`;
  collectibleAuthor.textContent = `— ${collectible.author}`;
}

/**
 * Get a random quote for the animation
 */
function getRandomQuote() {
  // Mix placeholder quotes with actual collectibles from other locations
  const allQuotes = [...placeholderQuotes, ...allCollectibles];
  return allQuotes[Math.floor(Math.random() * allQuotes.length)];
}

/**
 * Run the randomization animation
 */
function runRandomizerAnimation() {
  return new Promise((resolve) => {
    randomizerContainer.classList.remove('hidden');
    
    let iterations = 0;
    const maxIterations = 15;
    let delay = 80;
    
    function animate() {
      const quote = getRandomQuote();
      
      // Add shuffle animation class
      randomizerCard.classList.add('shuffling');
      
      // Update content
      randomTitle.textContent = quote.title;
      randomContent.textContent = `"${quote.content}"`;
      randomAuthor.textContent = `— ${quote.author}`;
      
      // Remove shuffle class after animation
      setTimeout(() => {
        randomizerCard.classList.remove('shuffling');
      }, delay * 0.8);
      
      iterations++;
      
      if (iterations < maxIterations) {
        // Slow down towards the end
        delay = 80 + (iterations * 15);
        setTimeout(animate, delay);
      } else {
        // Final reveal
        setTimeout(() => {
          randomizerCard.classList.add('final-shuffle');
          setTimeout(resolve, 300);
        }, 200);
      }
    }
    
    animate();
  });
}

/**
 * Handle collecting the item
 */
async function handleCollect() {
  if (!currentCollectible || !currentUser) return;
  
  // Disable button to prevent double-clicks
  collectBtn.disabled = true;
  collectBtn.textContent = '🎲 Discovering...';
  
  // Run the randomization animation
  await runRandomizerAnimation();
  
  // Hide randomizer, show actual collectible
  randomizerContainer.classList.add('hidden');
  collectibleReveal.classList.remove('hidden');
  collectibleReveal.classList.add('reveal-animation');
  
  // Hide button
  collectBtn.classList.add('hidden');
  
  // Record the collection
  await recordCollection({
    username: currentUser.username,
    locationId: currentLocation,
    locationName: currentLocationData.name,
    collectibleId: currentCollectible.id,
    collectibleTitle: currentCollectible.title,
    collectibleContent: currentCollectible.content,
    collectibleAuthor: currentCollectible.author
  });
  
  // Show success after a delay
  setTimeout(() => {
    successMessage.classList.remove('hidden');
  }, 1500);
}

/**
 * Show the already collected state
 */
function showAlreadyCollected(previousCollection) {
  showSection(alreadyCollectedSection);
  existingTitle.textContent = previousCollection.collectibleTitle;
  existingContent.textContent = `"${previousCollection.collectibleContent}"`;
  existingAuthor.textContent = `— ${previousCollection.collectibleAuthor}`;
}

/**
 * Initialize the page
 */
async function init() {
  // Check if user is registered
  currentUser = getCurrentUser();
  if (!currentUser) {
    showSection(noUserSection);
    return;
  }
  
  // Get location ID from URL
  currentLocation = getLocationIdFromUrl();
  if (!currentLocation) {
    showSection(invalidLocationSection);
    return;
  }
  
  // Check if user already collected this location
  const previousCollection = hasUserCollectedLocation(currentUser.username, currentLocation);
  if (previousCollection) {
    showAlreadyCollected(previousCollection);
    return;
  }
  
  // Load collectibles data
  const data = await loadCollectiblesData();
  if (!data || !data.locations[currentLocation]) {
    showSection(invalidLocationSection);
    return;
  }
  
  // Store all collectibles for randomization animation
  allCollectibles = Object.values(data.locations).map(loc => ({
    title: loc.collectible.title,
    content: loc.collectible.content,
    author: loc.collectible.author
  }));
  
  // Get location data and collectible
  currentLocationData = data.locations[currentLocation];
  currentCollectible = currentLocationData.collectible;
  
  // Render the collectible (hidden until button is pressed)
  renderCollectible(currentCollectible, currentLocationData);
  
  // Setup collect button
  collectBtn.addEventListener('click', handleCollect);
  
  showSection(collectSection);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
