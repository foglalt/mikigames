// Storage service for user identity and API calls

import type { CollectionItem, User, Statistics, UserSummary } from "../types";

const USER_KEY = "qr_quiz_user";

async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message =
      typeof payload?.error === "string" ? payload.error : "Request failed";
    throw new Error(message);
  }

  return response.json() as Promise<T>;
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

export async function registerUser(username: string): Promise<User> {
  return apiRequest<User>("/api/users/register", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

// Collection functions
export async function getUserCollection(
  username: string
): Promise<CollectionItem[]> {
  try {
    return await apiRequest<CollectionItem[]>(
      `/api/collection?username=${encodeURIComponent(username)}`
    );
  } catch (error) {
    console.error("Failed to load user collection:", error);
    return [];
  }
}

export async function hasUserCollectedLocation(
  username: string,
  locationId: string
): Promise<boolean> {
  try {
    const data = await apiRequest<{ exists: boolean }>(
      `/api/collection/exists?username=${encodeURIComponent(
        username
      )}&locationId=${encodeURIComponent(locationId)}`
    );
    return data.exists;
  } catch (error) {
    console.error("Failed to check collection status:", error);
    return false;
  }
}

export async function recordCollection(
  item: Omit<CollectionItem, "id" | "timestamp">
): Promise<boolean> {
  try {
    const data = await apiRequest<{ created: boolean }>("/api/collection", {
      method: "POST",
      body: JSON.stringify(item),
    });
    return data.created;
  } catch (error) {
    console.error("Failed to record collection:", error);
    return false;
  }
}

// Statistics functions
export async function getStatistics(): Promise<Statistics> {
  try {
    return await apiRequest<Statistics>("/api/admin/stats");
  } catch (error) {
    console.error("Failed to load statistics:", error);
    return { totalUsers: 0, totalCollections: 0 };
  }
}

export async function getCollectionsByUser(): Promise<UserSummary[]> {
  try {
    return await apiRequest<UserSummary[]>("/api/admin/collections");
  } catch (error) {
    console.error("Failed to load collections by user:", error);
    return [];
  }
}

export async function clearAllCollections(): Promise<void> {
  try {
    await apiRequest("/api/admin/collections", { method: "DELETE" });
  } catch (error) {
    console.error("Failed to clear collections:", error);
  }
}

// Admin session functions
export async function adminLogin(password: string): Promise<boolean> {
  try {
    const data = await apiRequest<{ authenticated: boolean }>(
      "/api/admin/login",
      {
        method: "POST",
        body: JSON.stringify({ password }),
      }
    );
    return data.authenticated;
  } catch (error) {
    console.error("Failed to login:", error);
    return false;
  }
}

export async function adminLogout(): Promise<void> {
  try {
    await apiRequest("/api/admin/logout", { method: "POST" });
  } catch (error) {
    console.error("Failed to logout:", error);
  }
}

export async function getAdminSession(): Promise<{ authenticated: boolean }> {
  try {
    return await apiRequest<{ authenticated: boolean }>("/api/admin/session");
  } catch (error) {
    console.error("Failed to fetch admin session:", error);
    return { authenticated: false };
  }
}
