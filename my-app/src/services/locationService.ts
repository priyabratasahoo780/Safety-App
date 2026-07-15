import * as Location from 'expo-location';

type LocationCallback = (location: Location.LocationObject) => void;

class LocationService {
  private subscription: Location.LocationSubscription | null = null;
  private subscribers: Set<LocationCallback> = new Set();
  private lastLocation: Location.LocationObject | null = null;
  private isTracking: boolean = false;

  // Add a subscriber and start tracking if it's the first one
  public async subscribe(callback: LocationCallback): Promise<void> {
    this.subscribers.add(callback);

    // If we already have a location cached, send it immediately for fast UI rendering
    if (this.lastLocation) {
      callback(this.lastLocation);
    }

    if (!this.isTracking) {
      await this.startTracking();
    }
  }

  // Remove a subscriber, stop tracking if none are left
  public unsubscribe(callback: LocationCallback): void {
    this.subscribers.delete(callback);
    if (this.subscribers.size === 0) {
      this.stopTracking();
    }
  }

  private async startTracking() {
    if (this.isTracking) return;

    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
      if (newStatus !== 'granted') return;
    }

    try {
      this.isTracking = true;
      
      // Get initial position quickly
      let initialPos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }).catch(() => null);

      // If native location fails (e.g. on Web without HTTPS or permission denied), fallback to IP-based location
      if (!initialPos) {
        try {
          const res = await fetch('http://ip-api.com/json/');
          const data = await res.json();
          if (data && data.status === 'success') {
            initialPos = {
              coords: {
                latitude: data.lat,
                longitude: data.lon,
                altitude: null,
                accuracy: 1000,
                altitudeAccuracy: null,
                heading: null,
                speed: null
              },
              timestamp: Date.now()
            };
          }
        } catch (e) {
          console.warn('IP Geolocation fallback failed', e);
        }
      }

      if (initialPos) {
        this.lastLocation = initialPos;
        this.notifySubscribers(initialPos);
      }

      this.subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (loc) => {
          this.lastLocation = loc;
          this.notifySubscribers(loc);
        }
      );
    } catch (error) {
      console.warn('Location tracking failed to start:', error);
      this.isTracking = false;
    }
  }

  private stopTracking() {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.isTracking = false;
  }

  private notifySubscribers(location: Location.LocationObject) {
    this.subscribers.forEach((callback) => callback(location));
  }

  public getLastLocation(): Location.LocationObject | null {
    return this.lastLocation;
  }
}

export const locationService = new LocationService();
