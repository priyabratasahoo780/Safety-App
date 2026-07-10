import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { LiveLocationData, DestinationLocation, RouteOption } from '../types/location.types';

export interface MapHandle {
  recenter: () => void;
}

interface Props {
  currentLocation: LiveLocationData | null;
  destination: DestinationLocation | null;
  routes: RouteOption[];
  selectedRoute: RouteOption | null;
  onLongPressMap: (e: any) => void;
}

export const SafeRouteMap: ForwardRefExoticComponent<Props & RefAttributes<MapHandle>>;
export default SafeRouteMap;
