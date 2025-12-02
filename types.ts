export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface OpeningHours {
  [key: string]: string; // e.g., "Mo-Fr 08:00-22:00", "Sa 09:00-23:00", etc.
}

export interface Place {
  id: string;
  name: string;
  uri?: string;
  address?: string;
  rating?: string;
  openingHours?: OpeningHours;
  isOpen?: boolean; // Computed property
}

export enum AppState {
  IDLE = 'IDLE',
  LOCATING = 'LOCATING',
  SEARCHING = 'SEARCHING',
  READY = 'READY',
  PICKING = 'PICKING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}