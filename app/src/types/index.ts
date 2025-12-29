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
  icon: string;
  collectible: Collectible;
}

export interface LocationsData {
  gameTitle: string;
  gameDescription: string;
  locations: Record<string, Location>;
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
