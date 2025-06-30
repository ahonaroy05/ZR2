import { useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import * as Location from 'expo-location';

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
  const isGeolocationSupported = useCallback(() => {
    if (Platform.OS === 'web') {
      return 'geolocation' in navigator;
    }
    return true; // Assume mobile platforms support geolocation
  }, []);

  // Request location permissions
  const requestPermissions = useCallback(async (): Promise<LocationPermissionStatus> => {
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
        // For web, we need to actually request location to check permissions
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve, 
            reject, 
            {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 300000, // 5 minutes
            }
          );
        });

        const status: LocationPermissionStatus = {
          granted: true,
          canAskAgain: true,
          status: 'granted',
        };
        setPermissionStatus(status);
        setError(null);
        
        // Also set the current location
        const coordinates: LocationCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
        };
        setCurrentLocation(coordinates);
        
        return status;
      } catch (error: any) {
        let status: LocationPermissionStatus;
        let errorMessage: string;
        
        if (error.code === 1) { // PERMISSION_DENIED
          status = {
            granted: false,
            canAskAgain: false,
            status: 'denied',
          };
          errorMessage = 'Location access denied by user. Please enable location access in your browser settings.';
        } else if (error.code === 2) { // POSITION_UNAVAILABLE
          status = {
            granted: false,
            canAskAgain: true,
            status: 'undetermined',
          };
          errorMessage = 'Location information is unavailable. Please check your GPS settings.';
        } else if (error.code === 3) { // TIMEOUT
          status = {
            granted: false,
            canAskAgain: true,
            status: 'undetermined',
          };
          errorMessage = 'Location request timed out. Please try again.';
        } else {
          status = {
            granted: false,
            canAskAgain: true,
            status: 'denied',
          };
          errorMessage = 'An unknown error occurred while requesting location';
        }
        
        setPermissionStatus(status);
        setError(errorMessage);
        return status;
      }
    } else {
      // For mobile platforms, use expo-location
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        const permissionStatus: LocationPermissionStatus = {
          granted: status === 'granted',
          canAskAgain: status !== 'denied',
          status: status as 'granted' | 'denied' | 'undetermined',
        };
        
        setPermissionStatus(permissionStatus);
        
        if (status !== 'granted') {
          setError('Location permission was denied. Please enable location access in your device settings.');
        } else {
          setError(null);
        }
        
        return permissionStatus;
      } catch (error) {
        const status: LocationPermissionStatus = {
          granted: false,
          canAskAgain: true,
          status: 'denied',
        };
        setPermissionStatus(status);
        setError('Failed to request location permissions');
        return status;
      }
    }
  }, [isGeolocationSupported]);

  // Get current location
  const getCurrentLocation = useCallback(async (options?: {
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
        // For mobile platforms, use expo-location
        const location = await Location.getCurrentPositionAsync({
          accuracy: options?.enableHighAccuracy ? Location.Accuracy.High : Location.Accuracy.Balanced,
          timeInterval: options?.timeout || 15000,
          distanceInterval: 0,
        });

        const coordinates: LocationCoordinates = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy || undefined,
          altitude: location.coords.altitude || undefined,
          heading: location.coords.heading || undefined,
          speed: location.coords.speed || undefined,
        };

        setCurrentLocation(coordinates);
        setIsLoading(false);
        return coordinates;
      }
    } catch (error: any) {
      console.error('Error getting current location:', error);
      
      let errorMessage = 'Failed to get current location';
      if (Platform.OS === 'web') {
        if (error.code === 1) {
          errorMessage = 'Location access denied. Please allow location access in your browser.';
        } else if (error.code === 2) {
          errorMessage = 'Location information unavailable. Please check your GPS settings.';
        } else if (error.code === 3) {
          errorMessage = 'Location request timed out. Please try again.';
        }
      } else {
        if (error.code === 'E_LOCATION_SERVICES_DISABLED') {
          errorMessage = 'Location services are disabled. Please enable them in your device settings.';
        } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
          errorMessage = 'Location information is currently unavailable';
        } else if (error.code === 'E_LOCATION_TIMEOUT') {
          errorMessage = 'Location request timed out. Please try again.';
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, [permissionStatus.granted, requestPermissions]);

  // Watch location changes
  const watchLocation = useCallback((
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
      // For mobile platforms, use expo-location
      let subscription: Location.LocationSubscription | null = null;
      
      const startWatching = async () => {
        try {
          subscription = await Location.watchPositionAsync(
            {
              accuracy: options?.enableHighAccuracy ? Location.Accuracy.High : Location.Accuracy.Balanced,
              timeInterval: options?.timeout || 5000,
              distanceInterval: options?.distanceInterval || 10,
            },
            (location) => {
              const coordinates: LocationCoordinates = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                accuracy: location.coords.accuracy || undefined,
                altitude: location.coords.altitude || undefined,
                heading: location.coords.heading || undefined,
                speed: location.coords.speed || undefined,
              };
              
              setCurrentLocation(coordinates);
              callback(coordinates);
            }
          );
        } catch (error) {
          console.error('Failed to start location watching:', error);
          setError('Failed to start location tracking');
        }
      };

      startWatching();

      return () => {
        if (subscription) {
          subscription.remove();
        }
      };
    }
  }, [permissionStatus.granted]);

  // Auto-request location on mount if supported
  useEffect(() => {
    const initializeLocation = async () => {
      if (Platform.OS === 'web') {
        // For web, we can't check permissions without triggering a request
        setPermissionStatus({
          granted: false,
          canAskAgain: true,
          status: 'undetermined',
        });
      } else {
        // For mobile, check current permission status
        try {
          const { status } = await Location.getForegroundPermissionsAsync();
          const permStatus: LocationPermissionStatus = {
            granted: status === 'granted',
            canAskAgain: status !== 'denied',
            status: status as 'granted' | 'denied' | 'undetermined',
          };
          setPermissionStatus(permStatus);
          
          // If we have permissions, get current location
          if (status === 'granted') {
            getCurrentLocation();
          }
        } catch (error) {
          console.warn('Failed to check location permissions:', error);
        }
      }
    };

    initializeLocation();
  }, [getCurrentLocation]);

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