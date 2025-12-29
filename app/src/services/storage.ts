// Storage service for managing collections and user data

import type {
  CollectionItem,
  User,
  Statistics,
  UserSummary,
  CollectionProgress,
} from "../types";

const COLLECTION_KEY = "qr_collection_items";
const USER_KEY = "qr_quiz_user";
const SESSION_KEY = "qr_admin_session";

// User functions
export function getUser(): User | null {
  try {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY);
}

// Collection functions
export function getCollections(): CollectionItem[] {
  try {
    const data = localStorage.getItem(COLLECTION_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getUserCollection(username: string): CollectionItem[] {
  return getCollections().filter((c) => c.username === username);
}

export function hasUserCollectedLocation(
  username: string,
  locationId: string
): CollectionItem | undefined {
  return getCollections().find(
    (c) => c.username === username && c.locationId === locationId
  );
}

export function recordCollection(
  item: Omit<CollectionItem, "id" | "timestamp">
): boolean {
  const collections = getCollections();

  // Check if already collected
  const existing = collections.find(
    (c) => c.username === item.username && c.locationId === item.locationId
  );

  if (existing) {
    return false;
  }

  collections.push({
    ...item,
    id: generateId(),
    timestamp: new Date().toISOString(),
  });

  localStorage.setItem(COLLECTION_KEY, JSON.stringify(collections));
  return true;
}

export function getCollectionProgress(
  username: string,
  totalLocations: number
): CollectionProgress {
  const userCollection = getUserCollection(username);
  return {
    collected: userCollection.length,
    total: totalLocations,
    remaining: totalLocations - userCollection.length,
    percentage: Math.round((userCollection.length / totalLocations) * 100),
  };
}

export function clearAllCollections(): void {
  localStorage.removeItem(COLLECTION_KEY);
}

// Statistics functions
export function getStatistics(): Statistics {
  const collections = getCollections();
  const uniqueUsers = new Set(collections.map((c) => c.username));

  return {
    totalUsers: uniqueUsers.size,
    totalCollections: collections.length,
  };
}

export function getCollectionsByUser(): UserSummary[] {
  const collections = getCollections();
  const userMap: Record<string, UserSummary> = {};

  collections.forEach((item) => {
    if (!userMap[item.username]) {
      userMap[item.username] = {
        username: item.username,
        items: [],
        totalCount: 0,
      };
    }
    userMap[item.username].items.push(item);
    userMap[item.username].totalCount++;
  });

  return Object.values(userMap);
}

// Admin session functions
export function isAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "authenticated";
}

export function setAuthenticated(value: boolean): void {
  if (value) {
    sessionStorage.setItem(SESSION_KEY, "authenticated");
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

// Utility
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
