// Data loading service

import type { LocationsData } from "../types";

let cachedData: LocationsData | null = null;

export async function loadLocationsData(): Promise<LocationsData | null> {
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch("/data/questions.json");
    if (!response.ok) throw new Error("Failed to load data");
    cachedData = await response.json();
    return cachedData;
  } catch (error) {
    console.error("Error loading data:", error);
    return null;
  }
}

export function getLocationCount(data: LocationsData): number {
  return Object.keys(data.locations).length;
}
