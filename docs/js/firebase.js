// Data storage for tracking collections across users
// Using localStorage (could be upgraded to Firebase for cross-device sync)

// Storage keys
const COLLECTION_KEY = 'qr_collection_items';

/**
 * Initialize the database connection
 */
export function initDatabase() {
  console.log('Database initialized (localStorage mode)');
}

/**
 * Record a collected item for a user
 */
export async function recordCollection(collectionData) {
  const collections = getCollections();
  
  // Check if already collected
  const existing = collections.find(
    c => c.username === collectionData.username && c.locationId === collectionData.locationId
  );
  
  if (existing) {
    return false; // Already collected
  }
  
  collections.push({
    ...collectionData,
    id: generateId(),
    timestamp: new Date().toISOString()
  });
  
  localStorage.setItem(COLLECTION_KEY, JSON.stringify(collections));
  return true;
}

/**
 * Get all collections from storage
 */
export function getCollections() {
  try {
    const data = localStorage.getItem(COLLECTION_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Get all collected items for a specific user
 */
export function getUserCollection(username) {
  const collections = getCollections();
  return collections.filter(c => c.username === username);
}

/**
 * Check if a user has already collected from a location
 */
export function hasUserCollectedLocation(username, locationId) {
  const collections = getCollections();
  return collections.find(c => c.username === username && c.locationId === locationId);
}

/**
 * Get collection progress for a user
 */
export function getCollectionProgress(username, totalLocations) {
  const userCollection = getUserCollection(username);
  return {
    collected: userCollection.length,
    total: totalLocations,
    remaining: totalLocations - userCollection.length,
    percentage: Math.round((userCollection.length / totalLocations) * 100)
  };
}

/**
 * Clear all collection data
 */
export function clearAllCollections() {
  localStorage.removeItem(COLLECTION_KEY);
}

/**
 * Get statistics summary for admin
 */
export function getStatistics() {
  const collections = getCollections();
  const uniqueUsers = new Set(collections.map(c => c.username));
  
  return {
    totalUsers: uniqueUsers.size,
    totalCollections: collections.length
  };
}

/**
 * Get collections grouped by user
 */
export function getCollectionsByUser() {
  const collections = getCollections();
  const userMap = {};
  
  collections.forEach(item => {
    if (!userMap[item.username]) {
      userMap[item.username] = {
        username: item.username,
        items: [],
        totalCount: 0
      };
    }
    userMap[item.username].items.push(item);
    userMap[item.username].totalCount++;
  });
  
  return Object.values(userMap);
}

/**
 * Generate a unique ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
