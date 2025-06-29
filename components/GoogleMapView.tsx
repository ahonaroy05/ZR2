import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
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

export function GoogleMapView({
  routes,
  origin,
  destination,
  selectedRoute,
  onRouteSelect,
  style
}: GoogleMapViewProps) {
  const { colors, isDarkMode } = useTheme();
  const mapRef = useRef<any>(null);

  // For web platform, we'll create a simple HTML map using Google Maps JavaScript API
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      loadGoogleMapsScript();
    }
  }, []);

  const loadGoogleMapsScript = () => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!window.google || !mapRef.current) return;

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

    // Add route polylines
    routes.forEach((route) => {
      const polyline = new window.google.maps.Polyline({
        path: window.google.maps.geometry.encoding.decodePath(route.overviewPolyline.points),
        geodesic: true,
        strokeColor: route.color,
        strokeOpacity: selectedRoute === route.id ? 1.0 : 0.6,
        strokeWeight: selectedRoute === route.id ? 6 : 4,
        map: map,
      });

      // Add click listener for route selection
      polyline.addListener('click', () => {
        onRouteSelect?.(route.id);
      });
    });

    // Fit map to show all points
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(origin);
    bounds.extend(destination);
    map.fitBounds(bounds);
  };

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

  if (Platform.OS === 'web') {
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
      </View>
    );
  }

  // For mobile platforms, show a placeholder
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
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
});