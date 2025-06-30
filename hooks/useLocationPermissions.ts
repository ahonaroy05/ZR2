import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'undetermined' | 'restricted';
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

export function useLocationPermissions() {
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>({
    granted: false,
    canAskAgain: true,
    status: 'undetermined',
  });
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if geolocation is supported
  const isGeolocationSupported = () => {
    if (Platform.OS === 'web') {
      return 'geolocation' in navigator;
    }
    return true; // Assume mobile platforms support geolocation
  };

  // Request location permissions
  const requestPermissions = async (): Promise<LocationPermissionStatus> => {
    if (!isGeolocationSupported()) {
      const status: LocationPermissionStatus = {
        granted: false,
        canAskAgain: false,
        status: 'denied',
      };
      setPermissionStatus(status);
      setError('Geolocation is not supported by this device/browser');
      return status;
    }

    if (Platform.OS === 'web') {
      try {
        // For web, we can't really check permissions beforehand,
        // so we'll try to get the location and handle the result
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          });
        });

        const status: LocationPermissionStatus = {
          granted: true,
          canAskAgain: true,
          status: 'granted',
        };
        setPermissionStatus(status);
        setError(null);
        return status;
      } catch (error: any) {
        let status: LocationPermissionStatus;
        
        if (error.code === 1) { // PERMISSION_DENIED
          status = {
            granted: false,
            canAskAgain: false,
            status: 'denied',
          };
          setError('Location access denied by user');
        } else if (error.code === 2) { // POSITION_UNAVAILABLE
          status = {
            granted: false,
            canAskAgain: true,
            status: 'undetermined',
          };
          setError('Location information is unavailable');
        } else if (error.code === 3) { // TIMEOUT
          status = {
            granted: false,
            canAskAgain: true,
            status: 'undetermined',
          };
          setError('Location request timed out');
        } else {
          status = {
            granted: false,
            canAskAgain: true,
            status: 'denied',
          };
          setError('An unknown error occurred while requesting location');
        }
        
        setPermissionStatus(status);
        return status;
      }
    } else {
      // For mobile platforms, you would use expo-location here
      // For now, we'll simulate permission granted
      const status: LocationPermissionStatus = {
        granted: true,
        canAskAgain: true,
        status: 'granted',
      };
      setPermissionStatus(status);
      return status;
    }
  };

  // Get current location
  const getCurrentLocation = async (options?: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  }): Promise<LocationCoordinates | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check permissions first
      if (!permissionStatus.granted) {
        const newStatus = await requestPermissions();
        if (!newStatus.granted) {
          setIsLoading(false);
          return null;
        }
      }

      if (Platform.OS === 'web') {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: options?.enableHighAccuracy ?? true,
              timeout: options?.timeout ?? 15000,
              maximumAge: options?.maximumAge ?? 60000,
            }
          );
        });

        const coordinates: LocationCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
        };

        setCurrentLocation(coordinates);
        setIsLoading(false);
        return coordinates;
      } else {
        // For mobile platforms, you would use expo-location here
        // For now, return a default location (San Francisco)
        const coordinates: LocationCoordinates = {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 10,
        };

        setCurrentLocation(coordinates);
        setIsLoading(false);
        return coordinates;
      }
    } catch (error: any) {
      console.error('Error getting current location:', error);
      
      let errorMessage = 'Failed to get current location';
      if (error.code === 1) {
        errorMessage = 'Location access denied';
      } else if (error.code === 2) {
        errorMessage = 'Location information unavailable';
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out';
      }
      
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  // Watch location changes
  const watchLocation = (
    callback: (location: LocationCoordinates) => void,
    options?: {
      enableHighAccuracy?: boolean;
      timeout?: number;
      maximumAge?: number;
      distanceInterval?: number;
    }
  ): (() => void) | null => {
    if (!permissionStatus.granted) {
      console.warn('Location permissions not granted');
      return null;
    }

    if (Platform.OS === 'web') {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const coordinates: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
          };
          
          setCurrentLocation(coordinates);
          callback(coordinates);
        },
        (error) => {
          console.error('Location watch error:', error);
          setError('Failed to watch location changes');
        },
        {
          enableHighAccuracy: options?.enableHighAccuracy ?? true,
          timeout: options?.timeout ?? 15000,
          maximumAge: options?.maximumAge ?? 60000,
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      // For mobile platforms, you would use expo-location here
      console.warn('Location watching not implemented for mobile platforms');
      return null;
    }
  };

  // Check permissions on mount
  useEffect(() => {
    if (Platform.OS === 'web' && isGeolocationSupported()) {
      // For web, we can't check permissions without triggering a request
      // So we'll just mark as undetermined
      setPermissionStatus({
        granted: false,
        canAskAgain: true,
        status: 'undetermined',
      });
    }
  }, []);

  return {
    permissionStatus,
    currentLocation,
    isLoading,
    error,
    requestPermissions,
    getCurrentLocation,
    watchLocation,
    isGeolocationSupported: isGeolocationSupported(),
  };
}