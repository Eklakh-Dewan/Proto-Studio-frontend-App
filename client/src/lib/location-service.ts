export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  timezone: string;
}

export class LocationService {
  private static instance: LocationService;
  private currentLocation: LocationData | null = null;
  private watchId: number | null = null;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async getCurrentLocation(): Promise<LocationData | null> {
    if (this.currentLocation) {
      return this.currentLocation;
    }

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // In a real app, you'd call a reverse geocoding service here
            // For now, we'll simulate with mock data based on coordinates
            const locationData = await this.reverseGeocode(latitude, longitude);
            this.currentLocation = locationData;
            resolve(locationData);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<LocationData> {
    // Mock reverse geocoding - in production, use Google Maps Geocoding API
    const mockCities = [
      { lat: 35.6762, lng: 139.6503, city: "Tokyo", country: "Japan", timezone: "Asia/Tokyo" },
      { lat: 40.7128, lng: -74.0060, city: "New York", country: "USA", timezone: "America/New_York" },
      { lat: 51.5074, lng: -0.1278, city: "London", country: "UK", timezone: "Europe/London" },
      { lat: 48.8566, lng: 2.3522, city: "Paris", country: "France", timezone: "Europe/Paris" },
      { lat: -33.8688, lng: 151.2093, city: "Sydney", country: "Australia", timezone: "Australia/Sydney" }
    ];

    // Find closest city
    let closestCity = mockCities[0];
    let minDistance = this.calculateDistance(latitude, longitude, closestCity.lat, closestCity.lng);

    for (const city of mockCities) {
      const distance = this.calculateDistance(latitude, longitude, city.lat, city.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    }

    return {
      latitude,
      longitude,
      city: closestCity.city,
      country: closestCity.country,
      timezone: closestCity.timezone
    };
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  startLocationTracking(callback: (location: LocationData) => void) {
    if (navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const locationData = await this.reverseGeocode(latitude, longitude);
          this.currentLocation = locationData;
          callback(locationData);
        },
        (error) => {
          console.error("Location tracking error:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000 // 1 minute
        }
      );
    }
  }

  stopLocationTracking() {
    if (this.watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    return this.calculateDistance(lat1, lng1, lat2, lng2);
  }

  isWithinRadius(centerLat: number, centerLng: number, targetLat: number, targetLng: number, radius: number): boolean {
    const distance = this.calculateDistance(centerLat, centerLng, targetLat, targetLng);
    return distance <= radius;
  }
}