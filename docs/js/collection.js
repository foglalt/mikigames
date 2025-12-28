// Collection page logic - shows user's collected items and progress

import { getUserCollection, getCollectionProgress } from './firebase.js';

const USER_KEY = 'qr_quiz_user';

// DOM elements
const noUserSection = document.getElementById('no-user-section');
const collectionSection = document.getElementById('collection-section');
const usernameDisplay = document.getElementById('username-display');
const progressFill = document.getElementById('progress-fill');
const collectedCount = document.getElementById('collected-count');
const totalCount = document.getElementById('total-count');
const remainingCount = document.getElementById('remaining-count');
const collectedItemsContainer = document.getElementById('collected-items');
const remainingLocationsContainer = document.getElementById('remaining-locations');

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
 * Render a collected item card
 */
function renderCollectedItem(item) {
  const div = document.createElement('div');
  div.className = 'collectible-card collected';
  div.innerHTML = `
    <h3 class="collectible-title">${item.collectibleTitle}</h3>
    <blockquote class="collectible-content">"${item.collectibleContent}"</blockquote>
    <p class="collectible-author">— ${item.collectibleAuthor}</p>
    <p class="collectible-meta">📍 ${item.locationName}</p>
  `;
  return div;
}

/**
 * Render a remaining location card
 */
function renderRemainingLocation(locationId, locationData) {
  const div = document.createElement('div');
  div.className = 'location-card remaining';
  div.innerHTML = `
    <span class="location-icon">${locationData.icon || '📍'}</span>
    <span class="location-name">${locationData.name}</span>
    <span class="location-status">🔒 Not found</span>
  `;
  return div;
}

/**
 * Update the progress display
 */
function updateProgress(progress) {
  progressFill.style.width = `${progress.percentage}%`;
  collectedCount.textContent = progress.collected;
  totalCount.textContent = progress.total;
  remainingCount.textContent = progress.remaining;
  
  // Add completion class if all collected
  if (progress.remaining === 0) {
    progressFill.classList.add('complete');
  }
}

/**
 * Render all collected items
 */
function renderCollectedItems(userCollection) {
  collectedItemsContainer.innerHTML = '';
  
  if (userCollection.length === 0) {
    collectedItemsContainer.innerHTML = '<p class="empty-state">No items collected yet. Scan a QR code to start!</p>';
    return;
  }
  
  // Sort by timestamp (most recent first)
  const sorted = [...userCollection].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );
  
  sorted.forEach(item => {
    collectedItemsContainer.appendChild(renderCollectedItem(item));
  });
}

/**
 * Render remaining locations
 */
function renderRemainingLocations(allLocations, userCollection) {
  remainingLocationsContainer.innerHTML = '';
  
  const collectedIds = new Set(userCollection.map(c => c.locationId));
  const remaining = Object.entries(allLocations).filter(([id]) => !collectedIds.has(id));
  
  if (remaining.length === 0) {
    remainingLocationsContainer.innerHTML = `
      <div class="completion-message">
        <p>🎉 Congratulations!</p>
        <p>You've collected all items!</p>
      </div>
    `;
    return;
  }
  
  remaining.forEach(([locationId, locationData]) => {
    remainingLocationsContainer.appendChild(
      renderRemainingLocation(locationId, locationData)
    );
  });
}

/**
 * Initialize the page
 */
async function init() {
  // Check if user is registered
  const user = getCurrentUser();
  if (!user) {
    noUserSection.classList.remove('hidden');
    return;
  }
  
  // Show collection section
  collectionSection.classList.remove('hidden');
  usernameDisplay.textContent = user.username;
  
  // Load all locations data
  const data = await loadCollectiblesData();
  if (!data) {
    remainingLocationsContainer.innerHTML = '<p class="empty-state">Error loading data</p>';
    return;
  }
  
  const allLocations = data.locations;
  const totalLocations = Object.keys(allLocations).length;
  
  // Get user's collection
  const userCollection = getUserCollection(user.username);
  
  // Update progress
  const progress = getCollectionProgress(user.username, totalLocations);
  updateProgress(progress);
  
  // Render items
  renderCollectedItems(userCollection);
  renderRemainingLocations(allLocations, userCollection);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
