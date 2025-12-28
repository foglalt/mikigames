// Firebase configuration for tracking visits across devices
// Using Firebase Realtime Database (free tier)

const FIREBASE_CONFIG = {
  // For a production app, you would use your own Firebase project
  // This is a placeholder - we'll use localStorage as fallback
  databaseURL: null
};

// Storage key for localStorage fallback
const STORAGE_KEY = 'qr_quiz_visits';

/**
 * Initialize the database connection
 * Falls back to localStorage if Firebase is not configured
 */
export function initDatabase() {
  // For now, we use localStorage as the data store
  // In production, you would initialize Firebase here
  console.log('Database initialized (localStorage mode)');
}

/**
 * Record a user visit to a location
 */
export async function recordVisit(visitData) {
  const visits = getVisits();
  visits.push({
    ...visitData,
    id: generateId(),
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
  return true;
}

/**
 * Get all visits from storage
 */
export function getVisits() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Check if a user has already visited a location
 */
export function hasUserVisitedLocation(username, locationId) {
  const visits = getVisits();
  return visits.find(v => v.username === username && v.locationId === locationId);
}

/**
 * Clear all visit data
 */
export function clearAllVisits() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get statistics summary
 */
export function getStatistics() {
  const visits = getVisits();
  const uniqueUsers = new Set(visits.map(v => v.username));
  const correctAnswers = visits.filter(v => v.isCorrect).length;
  
  return {
    totalUsers: uniqueUsers.size,
    totalVisits: visits.length,
    correctAnswers: correctAnswers
  };
}

/**
 * Get visits grouped by user
 */
export function getVisitsByUser() {
  const visits = getVisits();
  const userMap = {};
  
  visits.forEach(visit => {
    if (!userMap[visit.username]) {
      userMap[visit.username] = {
        username: visit.username,
        visits: [],
        correctCount: 0,
        totalCount: 0
      };
    }
    userMap[visit.username].visits.push(visit);
    userMap[visit.username].totalCount++;
    if (visit.isCorrect) {
      userMap[visit.username].correctCount++;
    }
  });
  
  return Object.values(userMap);
}

/**
 * Generate a unique ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
