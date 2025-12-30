// Storage service for managing collections and user data

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import type {
  CollectionItem,
  User,
  Statistics,
  UserSummary,
  CollectionProgress,
} from "../types";
import { db } from "./firebase";

const USER_KEY = "qr_quiz_user";
const SESSION_KEY = "qr_admin_session";
const COLLECTIONS_COLLECTION = "collections";

function makeCollectionId(username: string, locationId: string): string {
  return `${encodeURIComponent(username)}__${locationId}`;
}

function normalizeCollectionItem(
  id: string,
  data: Omit<CollectionItem, "id"> & { timestamp?: unknown }
): CollectionItem {
  const rawTimestamp = data.timestamp;
  const timestamp =
    typeof rawTimestamp === "string"
      ? rawTimestamp
      : typeof (rawTimestamp as { toDate?: () => Date })?.toDate === "function"
      ? (rawTimestamp as { toDate: () => Date }).toDate().toISOString()
      : new Date(0).toISOString();

  return {
    id,
    username: data.username,
    locationId: data.locationId,
    locationName: data.locationName,
    collectibleId: data.collectibleId,
    collectibleTitle: data.collectibleTitle,
    collectibleContent: data.collectibleContent,
    collectibleAuthor: data.collectibleAuthor,
    timestamp,
  };
}

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
export async function getCollections(): Promise<CollectionItem[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS_COLLECTION));
    return snapshot.docs.map((docSnap) =>
      normalizeCollectionItem(docSnap.id, docSnap.data() as CollectionItem)
    );
  } catch (error) {
    console.error("Failed to load collections:", error);
    return [];
  }
}

export async function getUserCollection(
  username: string
): Promise<CollectionItem[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS_COLLECTION),
      where("username", "==", username)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) =>
      normalizeCollectionItem(docSnap.id, docSnap.data() as CollectionItem)
    );
  } catch (error) {
    console.error("Failed to load user collection:", error);
    return [];
  }
}

export async function hasUserCollectedLocation(
  username: string,
  locationId: string
): Promise<CollectionItem | undefined> {
  try {
    const q = query(
      collection(db, COLLECTIONS_COLLECTION),
      where("username", "==", username),
      where("locationId", "==", locationId),
      limit(1)
    );
    const snapshot = await getDocs(q);
    const docSnap = snapshot.docs[0];
    if (!docSnap) return undefined;
    return normalizeCollectionItem(
      docSnap.id,
      docSnap.data() as CollectionItem
    );
  } catch (error) {
    console.error("Failed to check collection status:", error);
    return undefined;
  }
}

export async function recordCollection(
  item: Omit<CollectionItem, "id" | "timestamp">
): Promise<boolean> {
  try {
    const docId = makeCollectionId(item.username, item.locationId);
    const docRef = doc(db, COLLECTIONS_COLLECTION, docId);
    const existing = await getDoc(docRef);
    if (existing.exists()) {
      return false;
    }

    await setDoc(docRef, {
      ...item,
      id: docId,
      timestamp: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error("Failed to record collection:", error);
    return false;
  }
}

export async function getCollectionProgress(
  username: string,
  totalLocations: number
): Promise<CollectionProgress> {
  const userCollection = await getUserCollection(username);
  return {
    collected: userCollection.length,
    total: totalLocations,
    remaining: totalLocations - userCollection.length,
    percentage:
      totalLocations > 0
        ? Math.round((userCollection.length / totalLocations) * 100)
        : 0,
  };
}

export async function clearAllCollections(): Promise<void> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS_COLLECTION));
    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  } catch (error) {
    console.error("Failed to clear collections:", error);
  }
}

// Statistics functions
export async function getStatistics(): Promise<Statistics> {
  const collections = await getCollections();
  const uniqueUsers = new Set(collections.map((c) => c.username));

  return {
    totalUsers: uniqueUsers.size,
    totalCollections: collections.length,
  };
}

export async function getCollectionsByUser(): Promise<UserSummary[]> {
  const collections = await getCollections();
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
// Firestore document ids handle uniqueness.
