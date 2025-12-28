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
 * Handle collecting the item
 */
async function handleCollect() {
  if (!currentCollectible || !currentUser) return;
  
  // Disable button to prevent double-clicks
  collectBtn.disabled = true;
  collectBtn.textContent = 'Collecting...';
  
  // Reveal the collectible with animation
  collectibleReveal.classList.remove('hidden');
  collectibleReveal.classList.add('reveal-animation');
  
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
    collectBtn.classList.add('hidden');
    successMessage.classList.remove('hidden');
  }, 1000);
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
