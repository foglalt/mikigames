// Admin page logic

import { getVisits, getStatistics, getVisitsByUser, clearAllVisits } from './firebase.js';

// Get DOM elements
const totalUsersEl = document.getElementById('total-users');
const totalVisitsEl = document.getElementById('total-visits');
const correctAnswersEl = document.getElementById('correct-answers');
const loadingEl = document.getElementById('loading');
const noDataEl = document.getElementById('no-data');
const tableContainer = document.getElementById('table-container');
const visitsBody = document.getElementById('visits-body');
const userSummaryContainer = document.getElementById('user-summary-container');
const refreshBtn = document.getElementById('refresh-btn');
const clearBtn = document.getElementById('clear-btn');

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
  totalVisitsEl.textContent = stats.totalVisits;
  correctAnswersEl.textContent = stats.correctAnswers;
  
  // Load visits
  const visits = getVisits();
  
  if (visits.length === 0) {
    noDataEl.classList.remove('hidden');
    tableContainer.classList.add('hidden');
    userSummaryContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No users yet.</p>';
    return;
  }
  
  noDataEl.classList.add('hidden');
  tableContainer.classList.remove('hidden');
  
  // Render visits table (most recent first)
  visitsBody.innerHTML = '';
  [...visits].reverse().forEach(visit => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(visit.username)}</td>
      <td>${escapeHtml(visit.locationName || visit.locationId)}</td>
      <td>
        <span class="status-badge ${visit.isCorrect ? 'correct' : 'incorrect'}">
          ${visit.isCorrect ? '✓ Correct' : '✗ Wrong'}
        </span>
      </td>
      <td>${formatTime(visit.timestamp)}</td>
    `;
    visitsBody.appendChild(row);
  });
  
  // Render user summaries
  const userSummaries = getVisitsByUser();
  userSummaryContainer.innerHTML = '';
  
  userSummaries.forEach(user => {
    const userCard = document.createElement('div');
    userCard.style.cssText = 'padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 12px;';
    
    const locations = user.visits.map(v => v.locationName || v.locationId).join(', ');
    
    userCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <strong>${escapeHtml(user.username)}</strong>
        <span class="status-badge ${user.correctCount === user.totalCount ? 'correct' : 'incorrect'}">
          ${user.correctCount}/${user.totalCount} correct
        </span>
      </div>
      <div style="font-size: 0.875rem; color: var(--text-secondary);">
        Visited: ${escapeHtml(locations)}
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
  refreshBtn.addEventListener('click', loadData);
  
  clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all visit data? This cannot be undone.')) {
      clearAllVisits();
      loadData();
    }
  });
}

/**
 * Initialize the admin page
 */
function init() {
  loadData();
  setupEventListeners();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
