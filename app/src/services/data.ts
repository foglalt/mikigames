// Data loading service

import { START_LOCATION_ID } from "../config";
import type {
  Language,
  LocalizedLocationsData,
  LocalizedText,
  LocationsData,
} from "../types";

let cachedData: LocalizedLocationsData | null = null;

export async function loadLocationsData(): Promise<LocalizedLocationsData | null> {
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

function getLocalizedValue(text: LocalizedText, language: Language): string {
  return text[language] || text.en || "";
}

export function getLocalizedLocationsData(
  data: LocalizedLocationsData,
  language: Language
): LocationsData {
  return {
    gameTitle: getLocalizedValue(data.gameTitle, language),
    gameDescription: getLocalizedValue(data.gameDescription, language),
    locations: Object.fromEntries(
      Object.entries(data.locations).map(([id, location]) => [
        id,
        {
          name: getLocalizedValue(location.name, language),
          collectible: {
            id: location.collectible.id,
            content: getLocalizedValue(location.collectible.content, language),
            author: getLocalizedValue(location.collectible.author, language),
          },
        },
      ])
    ),
  };
}

export async function loadLocalizedLocationsData(
  language: Language
): Promise<LocationsData | null> {
  const data = await loadLocationsData();
  return data ? getLocalizedLocationsData(data, language) : null;
}

export function getLocationCount(data: LocationsData): number {
  return Object.keys(data.locations).filter((id) => id !== START_LOCATION_ID)
    .length;
}
