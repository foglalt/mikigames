// Admin page logic with password protection

import { getCollections, getStatistics, getCollectionsByUser, clearAllCollections } from './firebase.js';

// Admin password - replaced by GitHub Actions during deployment
const ADMIN_PASSWORD = '__ADMIN_PASSWORD_PLACEHOLDER__';
const SESSION_KEY = 'qr_admin_session';

// Get DOM elements
const loginSection = document.getElementById('login-section');
const adminSection = document.getElementById('admin-section');
const loginForm = document.getElementById('login-form');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const totalUsersEl = document.getElementById('total-users');
const totalCollectionsEl = document.getElementById('total-collections');
const loadingEl = document.getElementById('loading');
const noDataEl = document.getElementById('no-data');
const tableContainer = document.getElementById('table-container');
const collectionsBody = document.getElementById('collections-body');
const userSummaryContainer = document.getElementById('user-summary-container');
const refreshBtn = document.getElementById('refresh-btn');
const clearBtn = document.getElementById('clear-btn');

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  const session = sessionStorage.getItem(SESSION_KEY);
  return session === 'authenticated';
}

/**
 * Handle login
 */
function handleLogin(e) {
  e.preventDefault();
  const enteredPassword = passwordInput.value;
  
  if (enteredPassword === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, 'authenticated');
    showAdminSection();
    loginError.classList.add('hidden');
  } else {
    loginError.classList.remove('hidden');
    passwordInput.value = '';
    passwordInput.focus();
  }
}

/**
 * Handle logout
 */
function handleLogout() {
  sessionStorage.removeItem(SESSION_KEY);
  showLoginSection();
}

/**
 * Show the login section
 */
function showLoginSection() {
  loginSection.classList.remove('hidden');
  adminSection.classList.add('hidden');
}

/**
 * Show the admin section
 */
function showAdminSection() {
  loginSection.classList.add('hidden');
  adminSection.classList.remove('hidden');
  loadData();
}

/**
 * Format timestamp to readable date
 */
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Load and display all data
 */
function loadData() {
  loadingEl.classList.add('hidden');
  
  // Load statistics
  const stats = getStatistics();
  totalUsersEl.textContent = stats.totalUsers;
  totalCollectionsEl.textContent = stats.totalCollections;
  
  // Load collections
  const collections = getCollections();
  
  if (collections.length === 0) {
    noDataEl.classList.remove('hidden');
    tableContainer.classList.add('hidden');
    userSummaryContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No users yet.</p>';
    return;
  }
  
  noDataEl.classList.add('hidden');
  tableContainer.classList.remove('hidden');
  
  // Render collections table (most recent first)
  collectionsBody.innerHTML = '';
  [...collections].reverse().forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(item.username)}</td>
      <td>${escapeHtml(item.locationName || item.locationId)}</td>
      <td>${escapeHtml(item.collectibleTitle)}</td>
      <td>${formatTime(item.timestamp)}</td>
    `;
    collectionsBody.appendChild(row);
  });
  
  // Render user summaries
  const userSummaries = getCollectionsByUser();
  userSummaryContainer.innerHTML = '';
  
  userSummaries.forEach(user => {
    const userCard = document.createElement('div');
    userCard.style.cssText = 'padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 12px;';
    
    const locations = user.items.map(i => i.locationName || i.locationId).join(', ');
    
    userCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <strong>${escapeHtml(user.username)}</strong>
        <span style="color: var(--primary-color); font-weight: 500;">
          ${user.totalCount} collected
        </span>
      </div>
      <div style="font-size: 0.875rem; color: var(--text-secondary);">
        Locations: ${escapeHtml(locations)}
      </div>
    `;
    userSummaryContainer.appendChild(userCard);
  });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  loginForm.addEventListener('submit', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);
  refreshBtn.addEventListener('click', loadData);
  
  clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all collection data? This cannot be undone.')) {
      clearAllCollections();
      loadData();
    }
  });
}

/**
 * Initialize the admin page
 */
function init() {
  setupEventListeners();
  
  // Check if already authenticated
  if (isAuthenticated()) {
    showAdminSection();
  } else {
    showLoginSection();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
