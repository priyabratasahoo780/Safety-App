export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LiveLocationData extends LocationCoordinates {
  altitude: number | null;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export type LocationPermissionState = 'granted' | 'denied' | 'undetermined';

export interface DestinationLocation extends LocationCoordinates {
  address: string;
}

export type RouteType = 'recommended' | 'moderate' | 'shorter';

export interface RouteOption {
  id: RouteType;
  title: string;
  theme: 'green' | 'orange' | 'red';
  description: string;
  duration: string;
  distance: string;
  tags: string[];
  coordinates: LocationCoordinates[]; // Demo polylines
}

export interface RouteSafetyData {
  score: number;
  wellLit: number;
  cctv: number;
  crowd: 'Low' | 'Moderate' | 'High';
}

export type NavigationStatus = 'idle' | 'active';
