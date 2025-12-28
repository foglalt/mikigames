// Main application logic for user registration

const USER_KEY = 'qr_quiz_user';

// Get DOM elements
const welcomeBack = document.getElementById('welcome-back');
const currentUsernameSpan = document.getElementById('current-username');
const registrationSection = document.getElementById('registration-section');
const instructionsSection = document.getElementById('instructions-section');
const registrationForm = document.getElementById('registration-form');
const changeUserBtn = document.getElementById('change-user-btn');

/**
 * Get the current user from localStorage
 */
export function getCurrentUser() {
  try {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
}

/**
 * Save user to localStorage
 */
export function saveUser(username) {
  const userData = {
    username: username.trim(),
    createdAt: new Date().toISOString()
  };
  localStorage.setItem(USER_KEY, JSON.stringify(userData));
  return userData;
}

/**
 * Clear user from localStorage
 */
export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

/**
 * Initialize the app
 */
function init() {
  const user = getCurrentUser();
  
  if (user) {
    // User exists - show welcome back and instructions
    showRegisteredUser(user);
  } else {
    // No user - show registration form
    showRegistrationForm();
  }
  
  // Set up event listeners
  setupEventListeners();
}

/**
 * Show the UI for a registered user
 */
function showRegisteredUser(user) {
  welcomeBack.classList.remove('hidden');
  currentUsernameSpan.textContent = user.username;
  registrationSection.classList.add('hidden');
  instructionsSection.classList.remove('hidden');
}

/**
 * Show the registration form
 */
function showRegistrationForm() {
  welcomeBack.classList.add('hidden');
  registrationSection.classList.remove('hidden');
  instructionsSection.classList.add('hidden');
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Registration form submission
  registrationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('username');
    const username = usernameInput.value.trim();
    
    if (username.length >= 2) {
      const user = saveUser(username);
      showRegisteredUser(user);
    }
  });
  
  // Change user button
  changeUserBtn.addEventListener('click', () => {
    clearUser();
    showRegistrationForm();
    document.getElementById('username').value = '';
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
