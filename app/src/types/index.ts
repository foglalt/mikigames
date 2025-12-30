// Type definitions for the Quote Collector app

export interface Collectible {
  id: string;
  type: string;
  title: string;
  content: string;
  author: string;
}

export interface Location {
  name: string;
  collectible: Collectible;
}

export interface LocationsData {
  gameTitle: string;
  gameDescription: string;
  locations: Record<string, Location>;
}

export type Language = "en" | "hu";

export type LocalizedText = Record<Language, string>;

export interface LocalizedCollectible {
  id: string;
  type: string;
  title: LocalizedText;
  content: LocalizedText;
  author: LocalizedText;
}

export interface LocalizedLocation {
  name: LocalizedText;
  collectible: LocalizedCollectible;
}

export interface LocalizedLocationsData {
  gameTitle: LocalizedText;
  gameDescription: LocalizedText;
  locations: Record<string, LocalizedLocation>;
}

export interface CollectionItem {
  id: string;
  username: string;
  locationId: string;
  locationName: string;
  collectibleId: string;
  collectibleTitle: string;
  collectibleContent: string;
  collectibleAuthor: string;
  timestamp: string;
}

export interface User {
  username: string;
  registeredAt: string;
}

export interface CollectionProgress {
  collected: number;
  total: number;
  remaining: number;
  percentage: number;
}

export interface Statistics {
  totalUsers: number;
  totalCollections: number;
}

export interface UserSummary {
  username: string;
  items: CollectionItem[];
  totalCount: number;
}
