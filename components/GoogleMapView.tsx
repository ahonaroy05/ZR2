import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface GoogleMapViewProps {
  routes: Array<{
    id: string;
    overviewPolyline: { points: string };
    color: string;
  }>;
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  selectedRoute?: string;
  onRouteSelect?: (routeId: string) => void;
  style?: any;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export function GoogleMapView({
  routes,
  origin,
  destination,
  selectedRoute,
  onRouteSelect,
  style
}: GoogleMapViewProps) {
  const { colors, isDarkMode } = useTheme();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const polylinesRef = useRef<any[]>([]);

  // Check if we're on web platform
  if (Platform.OS !== 'web') {
    return (
      <View style={[styles.container, styles.placeholder, { backgroundColor: colors.primaryLight }, style]}>
        <View style={styles.placeholderContent}>
          <Text style={[styles.placeholderText, { color: colors.text }]}>
            Interactive Map
          </Text>
          <Text style={[styles.placeholderSubtext, { color: colors.textSecondary }]}>
            Available on web platform
          </Text>
        </View>
      </View>
    );
  }

  const loadGoogleMapsScript = () => {
    return new Promise<void>((resolve, reject) => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      // Check if script is already being loaded
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Wait for it to load
        const checkLoaded = () => {
          if (window.google && window.google.maps) {
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      // Create and load the script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (window.google && window.google.maps) {
          resolve();
        } else {
          reject(new Error('Google Maps failed to load properly'));
        }
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Maps script'));
      };
      
      document.head.appendChild(script);
    });
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: origin,
        zoom: 12,
        styles: isDarkMode ? getDarkMapStyles() : getLightMapStyles(),
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      mapInstanceRef.current = map;

      // Add origin marker
      new window.google.maps.Marker({
        position: origin,
        map: map,
        title: 'Origin',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: colors.primary,
          fillOpacity: 1,
          strokeColor: colors.surface,
          strokeWeight: 2,
        },
      });

      // Add destination marker
      new window.google.maps.Marker({
        position: destination,
        map: map,
        title: 'Destination',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: colors.accent,
          fillOpacity: 1,
          strokeColor: colors.surface,
          strokeWeight: 2,
        },
      });

      // Fit map to show all points
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(origin);
      bounds.extend(destination);
      map.fitBounds(bounds);

      // Add some padding to the bounds
      setTimeout(() => {
        const currentZoom = map.getZoom();
        if (currentZoom && currentZoom > 15) {
          map.setZoom(15);
        }
      }, 100);

      setIsLoaded(true);
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
    }
  };

  const updateRoutes = () => {
    if (!mapInstanceRef.current || !window.google || !isLoaded) return;

    // Clear existing polylines
    polylinesRef.current.forEach(polyline => {
      polyline.setMap(null);
    });
    polylinesRef.current = [];

    // Add route polylines
    routes.forEach((route) => {
      if (!route.overviewPolyline.points || route.overviewPolyline.points.startsWith('demo_')) {
        // Skip demo routes or invalid polylines
        return;
      }

      try {
        const decodedPath = window.google.maps.geometry.encoding.decodePath(route.overviewPolyline.points);
        
        const polyline = new window.google.maps.Polyline({
          path: decodedPath,
          geodesic: true,
          strokeColor: route.color,
          strokeOpacity: selectedRoute === route.id ? 1.0 : 0.6,
          strokeWeight: selectedRoute === route.id ? 6 : 4,
          map: mapInstanceRef.current,
        });

        // Add click listener for route selection
        polyline.addListener('click', () => {
          onRouteSelect?.(route.id);
        });

        polylinesRef.current.push(polyline);
      } catch (err) {
        console.warn('Failed to decode polyline for route:', route.id, err);
      }
    });
  };

  useEffect(() => {
    const initMap = async () => {
      try {
        setError(null);
        await loadGoogleMapsScript();
        initializeMap();
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map');
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    updateRoutes();
  }, [routes, selectedRoute, isLoaded]);

  const getDarkMapStyles = () => [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#263c3f' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6b9a76' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#38414e' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#212a37' }],
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca5b3' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#746855' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1f2835' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#f3d19c' }],
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#2f3948' }],
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#515c6d' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#17263c' }],
    },
  ];

  const getLightMapStyles = () => [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ];

  if (error) {
    return (
      <View style={[styles.container, styles.placeholder, { backgroundColor: colors.primaryLight }, style]}>
        <View style={styles.placeholderContent}>
          <Text style={[styles.placeholderText, { color: colors.text }]}>
            Map Error
          </Text>
          <Text style={[styles.placeholderSubtext, { color: colors.textSecondary }]}>
            {error}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 20,
          overflow: 'hidden',
        }}
      />
      {!isLoaded && (
        <View style={[styles.loadingOverlay, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading Map...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  placeholderContent: {
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 18,
  },
  placeholderSubtext: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    marginTop: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  loadingText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 16,
  },
});