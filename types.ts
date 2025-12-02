export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Place {
  id: string;
  name: string;
  uri?: string;
  address?: string;
  rating?: string;
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