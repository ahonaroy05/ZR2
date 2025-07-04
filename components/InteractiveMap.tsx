import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { GoogleMapView } from '@/components/GoogleMapView';
import { useGoogleMapsRoutes } from '@/hooks/useGoogleMapsRoutes';
import { useLocationPermissions } from '@/hooks/useLocationPermissions';
import { MapPin, Navigation, Search, Clock, Car, Brain as Train, Bike, User, Star, Chrome as Home, Briefcase, Coffee, Heart, X, RotateCcw, Zap, TriangleAlert as AlertTriangle, TrendingUp, ZoomIn, ZoomOut, RotateCw, CircleHelp as HelpCircle, Route, Crosshair, Loader, MapPinned, Locate } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface Location {
  lat: number;
  lng: number;
  address?: string;
  name?: string;
}

interface SavedLocation {
  id: string;
  name: string;
  address: string;
  location: Location;
  icon: string;
  color: string;
}

interface TransportMode {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  mode: 'driving' | 'walking' | 'bicycling' | 'transit';
}

export function InteractiveMap() {
  const { colors, theme } = useTheme();
  const { routes, loading, error, getStressOptimizedRoutes, clearError } = useGoogleMapsRoutes();
  const { 
    permissionStatus, 
    currentLocation: deviceLocation, 
    isLoading: locationLoading, 
    error: locationError,
    getCurrentLocation: getDeviceLocation,
    requestPermissions,
    watchLocation
  } = useLocationPermissions();
  
  // Location states
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedTransportMode, setSelectedTransportMode] = useState<string>('driving');
  const [showSavedLocations, setShowSavedLocations] = useState(false);
  
  // Animation values
  const searchBarScale = useSharedValue(1);
  const fabScale = useSharedValue(1);
  const locationPulse = useSharedValue(1);
  
  // Location tracking ref
  const unsubscribeLocationWatchRef = useRef<(() => void) | null>(null);

  // Empty saved locations - users will add their own
  const savedLocations: SavedLocation[] = [];

  const transportModes: TransportMode[] = [
    {
      id: 'driving',
      name: 'Drive',
      icon: <Car size={20} color={colors.textInverse} />,
      color: colors.primary,
      mode: 'driving',
    },
    {
      id: 'transit',
      name: 'Transit',
      icon: <Train size={20} color={colors.textInverse} />,
      color: colors.accent,
      mode: 'transit',
    },
    {
      id: 'bicycling',
      name: 'Bike',
      icon: <Bike size={20} color={colors.textInverse} />,
      color: colors.success,
      mode: 'bicycling',
    },
    {
      id: 'walking',
      name: 'Walk',
      icon: <User size={20} color={colors.textInverse} />,
      color: colors.warning,
      mode: 'walking',
    },
  ];

  // Get current location with better error handling
  const getCurrentLocation = async () => {
    try {
      setIsTrackingLocation(true);
      
      // Request permissions first
      const permStatus = await requestPermissions();
      if (!permStatus.granted) {
        Alert.alert(
          'Location Permission Required',
          'ZenRoute needs location access to show your current position and provide personalized route recommendations.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Enable Location', 
              onPress: () => {
                if (Platform.OS === 'web') {
                  Alert.alert(
                    'Enable Location in Browser',
                    'Please click the location icon in your browser\'s address bar and allow location access, then try again.'
                  );
                } else {
                  Alert.alert(
                    'Open Settings',
                    'Please go to your device settings and enable location permissions for ZenRoute.'
                  );
                }
              }
            }
          ]
        );
        setIsTrackingLocation(false);
        return;
      }

      const location = await getDeviceLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      });
      
      if (location) {
        const newLocation = {
          lat: location.latitude,
          lng: location.longitude,
          name: 'My Location',
          address: 'Current Location'
        };
        setCurrentLocation(newLocation);
        setLocationAccuracy(location.accuracy || null);
        
        Alert.alert(
          '📍 Location Found!',
          `Your current location has been set on the map.\n\nAccuracy: ${location.accuracy ? Math.round(location.accuracy) + ' meters' : 'Unknown'}`,
          [{ text: 'Great!', style: 'default' }]
        );
      } else {
        throw new Error('Unable to get location');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      
      // Show helpful error message
      Alert.alert(
        'Location Error', 
        locationError || 'Unable to get your current location. This could be due to:\n\n• Location services being disabled\n• Poor GPS signal\n• Browser blocking location access\n\nPlease try again or set your location manually.',
        [
          { text: 'Try Again', onPress: getCurrentLocation },
          { text: 'OK', style: 'cancel' }
        ]
      );
    } finally {
      setIsTrackingLocation(false);
    }
  };

  // Search for locations - placeholder implementation
  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // This would integrate with a real geocoding service
    // For now, show empty results
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Handle route planning
  const planRoute = async () => {
    if (!currentLocation || !destination) {
      Alert.alert('Missing Information', 'Please set both your current location and destination to plan a route.');
      return;
    }

    try {
      clearError();
      await getStressOptimizedRoutes(currentLocation, destination);
    } catch (error) {
      console.error('Route planning failed:', error);
      Alert.alert(
        'Route Planning Failed',
        'Unable to find routes. This might be due to:\n\n• No internet connection\n• Google Maps API not configured\n• Invalid locations\n\nPlease try again or check your connection.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle destination selection
  const selectDestination = (location: Location, name?: string) => {
    setDestination({ ...location, name: name || location.name });
    setSearchQuery(name || location.address || 'Selected Location');
    setShowSearchResults(false);
    setShowSavedLocations(false);
  };

  // Handle saved location selection
  const selectSavedLocation = (savedLocation: SavedLocation) => {
    selectDestination(savedLocation.location, savedLocation.name);
  };

  // Get icon for saved location
  const getSavedLocationIcon = (iconName: string, color: string) => {
    const iconProps = { size: 20, color };
    
    switch (iconName) {
      case 'home': return <Home {...iconProps} />;
      case 'briefcase': return <Briefcase {...iconProps} />;
      case 'coffee': return <Coffee {...iconProps} />;
      case 'zap': return <Zap {...iconProps} />;
      case 'heart': return <Heart {...iconProps} />;
      default: return <MapPin {...iconProps} />;
    }
  };

  // Animation handlers
  const handleSearchFocus = () => {
    searchBarScale.value = withSpring(1.02);
  };

  const handleSearchBlur = () => {
    searchBarScale.value = withSpring(1);
  };

  const handleFabPress = () => {
    fabScale.value = withSpring(0.95, {}, () => {
      fabScale.value = withSpring(1);
    });
    
    getCurrentLocation();
  };

  // Start location tracking with continuous updates
  const startLocationTracking = async () => {
    try {
      const permStatus = await requestPermissions();
      if (!permStatus.granted) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location services to track your location in real-time.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Enable', onPress: () => getCurrentLocation() }
          ]
        );
        return;
      }

      setIsTrackingLocation(true);
      
      // Get initial location
      const initialLocation = await getDeviceLocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      });
      
      if (initialLocation) {
        setCurrentLocation({
          lat: initialLocation.latitude,
          lng: initialLocation.longitude,
          name: 'My Location',
          address: 'Current Location'
        });
        setLocationAccuracy(initialLocation.accuracy || null);
      }

      // Start watching location changes
      const unsubscribe = watchLocation((location) => {
        setCurrentLocation({ 
          lat: location.latitude, 
          lng: location.longitude,
          name: 'My Location',
          address: 'Current Location'
        });
        setLocationAccuracy(location.accuracy || null);
        
        // Pulse animation for location updates
        locationPulse.value = withSpring(1.2, {}, () => {
          locationPulse.value = withSpring(1);
        });
      }, {
        enableHighAccuracy: true,
        distanceInterval: 5, // Update every 5 meters
        timeout: 5000,
      });
      
      if (unsubscribe) {
        unsubscribeLocationWatchRef.current = unsubscribe;
        Alert.alert('🎯 Live Tracking Started', 'Your location will be updated in real-time as you move.');
      } else {
        setIsTrackingLocation(false);
        Alert.alert('Error', 'Failed to start location tracking.');
      }
    } catch (error) {
      console.error('Error starting location tracking:', error);
      setIsTrackingLocation(false);
      Alert.alert('Error', 'Failed to start location tracking. Please check your location settings.');
    }
  };

  // Stop location tracking
  const stopLocationTracking = () => {
    if (unsubscribeLocationWatchRef.current) {
      unsubscribeLocationWatchRef.current();
      unsubscribeLocationWatchRef.current = null;
    }
    setIsTrackingLocation(false);
    Alert.alert('📍 Tracking Stopped', 'Location tracking has been disabled.');
  };

  // Handle route selection
  const handleRouteSelect = (routeId: string) => {
    setSelectedRoute(routeId);
    const route = routes.find(r => r.id === routeId);
    if (route) {
      Alert.alert(
        'Route Selected',
        `${route.name}\n\nDistance: ${route.distance.text}\nDuration: ${route.durationInTraffic?.text || route.duration.text}\nStress Level: ${route.stressLevel.toUpperCase()}\n\nTherapy: ${route.therapyType}`,
        [
          { text: 'Start Journey', onPress: () => {
            Alert.alert('Journey Started', 'Navigation and mindfulness features will be available in a future update.');
          }},
          { text: 'OK', style: 'cancel' }
        ]
      );
    }
  };

  // Animated styles
  const searchBarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: searchBarScale.value }],
  }));

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const locationPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: locationPulse.value }],
  }));

  // Initialize with default location
  useEffect(() => {
    // Set default location (can be changed by user)
    setCurrentLocation({ 
      lat: 37.7749, 
      lng: -122.4194, 
      name: 'Default Location', 
      address: 'San Francisco, CA' 
    });
    
    // Try to get user's actual location
    if (permissionStatus.granted) {
      getCurrentLocation();
    }
    
    // Cleanup function
    return () => {
      if (unsubscribeLocationWatchRef.current) {
        unsubscribeLocationWatchRef.current();
        unsubscribeLocationWatchRef.current = null;
      }
    };
  }, []);

  // Plan route when both locations are set
  useEffect(() => {
    if (currentLocation && destination) {
      planRoute();
    }
  }, [currentLocation, destination, selectedTransportMode]);

  // Update location from device location
  useEffect(() => {
    if (deviceLocation) {
      setCurrentLocation({
        lat: deviceLocation.latitude,
        lng: deviceLocation.longitude,
        name: 'My Location',
        address: 'Current Location'
      });
      setLocationAccuracy(deviceLocation.accuracy || null);
    }
  }, [deviceLocation]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Map Card */}
      <View style={[styles.mapCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        {/* Location Status */}
        <View style={[styles.locationStatus, { backgroundColor: colors.overlay }]}>
          <Animated.View style={locationPulseStyle}>
            {isTrackingLocation ? (
              <Loader size={16} color={colors.primary} />
            ) : (
              <Crosshair size={16} color={currentLocation ? colors.success : colors.textSecondary} />
            )}
          </Animated.View>
          <Text style={[styles.locationStatusText, { color: colors.text }]}>
            {isTrackingLocation ? 'Live Tracking' : 
             currentLocation ? `${currentLocation.name || 'Located'} ${locationAccuracy ? `(±${Math.round(locationAccuracy)}m)` : ''}` : 'No location'}
          </Text>
        </View>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity 
            style={[styles.controlButton, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
            onPress={() => Alert.alert('Zoom In', 'Map zoom controls will be available in a future update.')}
          >
            <ZoomIn size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.controlButton, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
            onPress={() => Alert.alert('Zoom Out', 'Map zoom controls will be available in a future update.')}
          >
            <ZoomOut size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.controlButton, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
            onPress={() => Alert.alert('Rotate Map', 'Map rotation controls will be available in a future update.')}
          >
            <RotateCw size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Map View */}
        <GoogleMapView
          routes={routes.map(route => ({
            id: route.id,
            overviewPolyline: route.overviewPolyline,
            color: route.color,
          }))}
          origin={currentLocation || { lat: 37.7749, lng: -122.4194 }}
          destination={destination || { lat: 37.7849, lng: -122.4094 }}
          selectedRoute={selectedRoute}
          onRouteSelect={handleRouteSelect}
          style={styles.map}
        />

        {/* Google Attribution */}
        <View style={styles.googleAttribution}>
          <Text style={[styles.googleText, { color: colors.textSecondary }]}>Google</Text>
        </View>
      </View>

      {/* Current Journey Card */}
      <View style={[styles.journeyCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
        <View style={styles.journeyHeader}>
          <Route size={24} color={colors.primary} />
          <Text style={[styles.journeyTitle, { color: colors.text }]}>Current Journey</Text>
        </View>
        
        <Text style={[styles.journeyRoute, { color: colors.text }]}>
          {currentLocation && destination ? 
            `${currentLocation.name || 'Current Location'} → ${destination.name || 'Destination'}` :
            'Set your origin and destination to plan your mindful journey'
          }
        </Text>
        
        {currentLocation && (
          <Text style={[styles.journeyCoordinates, { color: colors.textSecondary }]}>
            From: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
            {locationAccuracy && ` (±${Math.round(locationAccuracy)}m)`}
          </Text>
        )}

        <View style={styles.locationButtons}>
          <Animated.View style={[fabAnimatedStyle, { flex: 1 }]}>
            <TouchableOpacity 
              style={[styles.locationButton, { backgroundColor: colors.primary }]}
              onPress={handleFabPress}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <Loader size={16} color={colors.textInverse} />
              ) : (
                <Locate size={16} color={colors.textInverse} />
              )}
              <Text style={[styles.locationButtonText, { color: colors.textInverse }]}>
                {locationLoading ? 'Finding...' : 'Find My Location'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity 
            style={[
              styles.trackingButton, 
              { backgroundColor: isTrackingLocation ? colors.error : colors.success, flex: 1 }
            ]}
            onPress={isTrackingLocation ? stopLocationTracking : startLocationTracking}
          >
            <Navigation size={16} color={colors.textInverse} />
            <Text style={[styles.trackingButtonText, { color: colors.textInverse }]}>
              {isTrackingLocation ? 'Stop Live' : 'Track Live'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <Animated.View style={[styles.searchContainer, searchBarAnimatedStyle]}>
          <View style={[styles.searchBar, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Where do you want to go?"
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                searchLocations(text);
              }}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setDestination(null);
                  setShowSearchResults(false);
                }}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.savedLocationsButton, { backgroundColor: colors.primaryLight }]}
              onPress={() => {
                if (savedLocations.length === 0) {
                  Alert.alert('No Saved Locations', 'You haven\'t saved any locations yet. Saved location features will be available in a future update.');
                } else {
                  setShowSavedLocations(!showSavedLocations);
                }
              }}
            >
              <Star size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Search Results */}
          {showSearchResults && searchResults.length > 0 && (
            <View style={[styles.searchResults, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
              {searchResults.map((result) => (
                <TouchableOpacity
                  key={result.id}
                  style={styles.searchResultItem}
                  onPress={() => selectDestination(result.location, result.name)}
                >
                  <MapPin size={16} color={colors.primary} />
                  <View style={styles.searchResultText}>
                    <Text style={[styles.searchResultName, { color: colors.text }]}>
                      {result.name}
                    </Text>
                    <Text style={[styles.searchResultAddress, { color: colors.textSecondary }]}>
                      {result.address}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Saved Locations */}
          {showSavedLocations && (
            <View style={[styles.savedLocations, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
              <Text style={[styles.savedLocationsTitle, { color: colors.text }]}>Saved Places</Text>
              {savedLocations.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No saved locations yet. Add your favorite places to see them here.
                </Text>
              ) : (
                savedLocations.map((location) => (
                  <TouchableOpacity
                    key={location.id}
                    style={styles.savedLocationItem}
                    onPress={() => selectSavedLocation(location)}
                  >
                    <View style={[styles.savedLocationIcon, { backgroundColor: `${location.color}20` }]}>
                      {getSavedLocationIcon(location.icon, location.color)}
                    </View>
                    <View style={styles.savedLocationText}>
                      <Text style={[styles.savedLocationName, { color: colors.text }]}>
                        {location.name}
                      </Text>
                      <Text style={[styles.savedLocationAddress, { color: colors.textSecondary }]}>
                        {location.address}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </Animated.View>
      </View>

      {/* Transport Mode Selector */}
      <View style={styles.transportModeSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Transport Mode</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.transportModeScroll}>
          {transportModes.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.transportModeButton,
                { backgroundColor: colors.surface, shadowColor: colors.shadow },
                selectedTransportMode === mode.id && { backgroundColor: mode.color }
              ]}
              onPress={() => setSelectedTransportMode(mode.id)}
            >
              {mode.icon}
              <Text style={[
                styles.transportModeText,
                { color: selectedTransportMode === mode.id ? colors.textInverse : colors.text }
              ]}>
                {mode.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Available Routes Section */}
      {routes.length > 0 && (
        <View style={styles.routesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Routes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {routes.map((route) => (
              <TouchableOpacity
                key={route.id}
                style={[
                  styles.routeCard,
                  { backgroundColor: colors.card },
                  selectedRoute === route.id && { borderColor: colors.primary, borderWidth: 2 }
                ]}
                onPress={() => handleRouteSelect(route.id)}
              >
                <View style={styles.routeHeader}>
                  <Text style={[styles.routeName, { color: colors.text }]}>{route.name}</Text>
                  <View style={[styles.stressIndicator, { backgroundColor: route.color }]}>
                    <Text style={[styles.stressText, { color: colors.textInverse }]}>
                      {route.stressLevel.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.routeDetails}>
                  <View style={styles.routeDetailItem}>
                    <Clock size={14} color={colors.textSecondary} />
                    <Text style={[styles.routeDetailText, { color: colors.text }]}>
                      {route.durationInTraffic?.text || route.duration.text}
                    </Text>
                  </View>
                  <View style={styles.routeDetailItem}>
                    <MapPin size={14} color={colors.textSecondary} />
                    <Text style={[styles.routeDetailText, { color: colors.text }]}>
                      {route.distance.text}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.therapyType, { color: colors.primary }]}>
                  {route.therapyType}
                </Text>

                {route.warnings.length > 0 && (
                  <View style={styles.warningContainer}>
                    <AlertTriangle size={12} color={colors.warning} />
                    <Text style={[styles.warningText, { color: colors.warning }]}>
                      {route.warnings[0]}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Loading Indicator */}
      {loading && (
        <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
          <RotateCcw size={32} color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Finding optimal routes for your mindful journey...
          </Text>
        </View>
      )}

      {/* Error Message */}
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: colors.error }]}>
          <AlertTriangle size={20} color={colors.textInverse} />
          <Text style={[styles.errorText, { color: colors.textInverse }]}>
            {error}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.textInverse }]}
            onPress={() => {
              clearError();
              if (currentLocation && destination) {
                planRoute();
              }
            }}
          >
            <Text style={[styles.retryButtonText, { color: colors.error }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapCard: {
    margin: 20,
    borderRadius: 20,
    height: 300,
    position: 'relative',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  locationStatus: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  locationStatusText: {
    marginLeft: 6,
    fontSize: 12,
    fontFamily: 'Quicksand-Medium',
  },
  mapControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    gap: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  map: {
    flex: 1,
  },
  googleAttribution: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 4,
  },
  googleText: {
    fontSize: 10,
    fontFamily: 'Quicksand-Medium',
  },
  journeyCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  journeyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  journeyTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    marginLeft: 8,
  },
  journeyRoute: {
    fontSize: 16,
    fontFamily: 'Quicksand-SemiBold',
    marginBottom: 8,
    lineHeight: 22,
  },
  journeyCoordinates: {
    fontSize: 12,
    fontFamily: 'Quicksand-Regular',
    marginBottom: 16,
  },
  locationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
  },
  locationButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Quicksand-SemiBold',
  },
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
  },
  trackingButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Quicksand-SemiBold',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: {
    position: 'relative',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Quicksand-Medium',
  },
  savedLocationsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  searchResults: {
    marginTop: 8,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  searchResultText: {
    marginLeft: 12,
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontFamily: 'Quicksand-SemiBold',
  },
  searchResultAddress: {
    fontSize: 14,
    fontFamily: 'Quicksand-Regular',
    marginTop: 2,
  },
  savedLocations: {
    marginTop: 8,
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  savedLocationsTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Quicksand-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  savedLocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  savedLocationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedLocationText: {
    marginLeft: 12,
    flex: 1,
  },
  savedLocationName: {
    fontSize: 16,
    fontFamily: 'Quicksand-SemiBold',
  },
  savedLocationAddress: {
    fontSize: 14,
    fontFamily: 'Quicksand-Regular',
    marginTop: 2,
  },
  transportModeSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    marginBottom: 12,
  },
  transportModeScroll: {
    paddingVertical: 4,
  },
  transportModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  transportModeText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Quicksand-SemiBold',
  },
  routesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  routeCard: {
    width: 280,
    marginRight: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeName: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    flex: 1,
  },
  stressIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stressText: {
    fontSize: 10,
    fontFamily: 'Quicksand-Bold',
  },
  routeDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  routeDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  routeDetailText: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: 'Quicksand-Medium',
  },
  therapyType: {
    fontSize: 12,
    fontFamily: 'Quicksand-SemiBold',
    marginBottom: 8,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    marginLeft: 4,
    fontSize: 12,
    fontFamily: 'Quicksand-Medium',
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 24,
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Quicksand-Medium',
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  errorText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontFamily: 'Quicksand-Medium',
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 12,
  },
  retryButtonText: {
    fontSize: 12,
    fontFamily: 'Quicksand-SemiBold',
  },
  bottomPadding: {
    height: 100,
  },
});