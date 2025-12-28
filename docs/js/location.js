// Location page logic - shows questions for each QR code location

import { recordVisit, hasUserVisitedLocation } from './firebase.js';

const USER_KEY = 'qr_quiz_user';

// Get DOM elements
const loadingSection = document.getElementById('loading-section');
const noUserSection = document.getElementById('no-user-section');
const invalidLocationSection = document.getElementById('invalid-location-section');
const questionSection = document.getElementById('question-section');
const alreadyAnsweredSection = document.getElementById('already-answered-section');
const locationNameBadge = document.getElementById('location-name');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const resultContainer = document.getElementById('result-container');
const resultMessage = document.getElementById('result-message');
const previousResult = document.getElementById('previous-result');

// Current state
let currentQuestion = null;
let currentLocation = null;
let currentUser = null;
let hasAnswered = false;

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
 * Load questions data from JSON file
 */
async function loadQuestionsData() {
  try {
    const response = await fetch('data/questions.json');
    if (!response.ok) throw new Error('Failed to load questions');
    return await response.json();
  } catch (error) {
    console.error('Error loading questions:', error);
    return null;
  }
}

/**
 * Get a random question from a location
 */
function getRandomQuestion(locationData) {
  const questions = locationData.questions;
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}

/**
 * Show a specific section and hide others
 */
function showSection(sectionToShow) {
  [loadingSection, noUserSection, invalidLocationSection, questionSection, alreadyAnsweredSection]
    .forEach(section => section.classList.add('hidden'));
  sectionToShow.classList.remove('hidden');
}

/**
 * Render the question and options
 */
function renderQuestion(question, locationData) {
  locationNameBadge.textContent = locationData.name;
  questionText.textContent = question.question;
  
  optionsContainer.innerHTML = '';
  
  question.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'btn btn-option';
    button.textContent = option;
    button.dataset.index = index;
    button.addEventListener('click', () => handleAnswer(index, question.correctAnswer));
    optionsContainer.appendChild(button);
  });
}

/**
 * Handle user's answer
 */
async function handleAnswer(selectedIndex, correctIndex) {
  if (hasAnswered) return;
  hasAnswered = true;
  
  const isCorrect = selectedIndex === correctIndex;
  const buttons = optionsContainer.querySelectorAll('.btn-option');
  
  // Disable all buttons and show correct/incorrect
  buttons.forEach((btn, index) => {
    btn.disabled = true;
    if (index === correctIndex) {
      btn.classList.add('correct');
    } else if (index === selectedIndex && !isCorrect) {
      btn.classList.add('incorrect');
    }
  });
  
  // Show result message
  resultContainer.classList.remove('hidden');
  if (isCorrect) {
    resultMessage.textContent = '🎉 Correct! Well done!';
    resultMessage.className = 'result-message success';
  } else {
    resultMessage.textContent = '❌ Not quite right. Try another location!';
    resultMessage.className = 'result-message error';
  }
  
  // Record the visit
  await recordVisit({
    username: currentUser.username,
    locationId: currentLocation,
    locationName: currentQuestion.locationName,
    questionId: currentQuestion.id,
    isCorrect: isCorrect,
    selectedAnswer: selectedIndex,
    correctAnswer: correctIndex
  });
}

/**
 * Show the already answered state
 */
function showAlreadyAnswered(previousVisit) {
  showSection(alreadyAnsweredSection);
  
  if (previousVisit.isCorrect) {
    previousResult.textContent = '🎉 You answered correctly!';
    previousResult.className = 'result-message success';
  } else {
    previousResult.textContent = '❌ You answered incorrectly.';
    previousResult.className = 'result-message error';
  }
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
  
  // Check if user already answered this location
  const previousVisit = hasUserVisitedLocation(currentUser.username, currentLocation);
  if (previousVisit) {
    showAlreadyAnswered(previousVisit);
    return;
  }
  
  // Load questions data
  const questionsData = await loadQuestionsData();
  if (!questionsData || !questionsData.locations[currentLocation]) {
    showSection(invalidLocationSection);
    return;
  }
  
  // Get location data and random question
  const locationData = questionsData.locations[currentLocation];
  currentQuestion = getRandomQuestion(locationData);
  currentQuestion.locationName = locationData.name;
  
  // Render the question
  renderQuestion(currentQuestion, locationData);
  showSection(questionSection);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
