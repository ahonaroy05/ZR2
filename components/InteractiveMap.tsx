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
import { MapPin, Navigation, Search, Clock, Car, Brain as Train, Bike, User, Star, Chrome as Home, Briefcase, Coffee, Heart, X, RotateCcw, Zap, TriangleAlert as AlertTriangle, TrendingUp } from 'lucide-react-native';

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
  
  // Location states
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedTransportMode, setSelectedTransportMode] = useState<string>('driving');
  const [showSavedLocations, setShowSavedLocations] = useState(false);
  
  // Animation values
  const searchBarScale = useSharedValue(1);
  const fabScale = useSharedValue(1);

  // Mock saved locations
  const savedLocations: SavedLocation[] = [
    {
      id: 'home',
      name: 'Home',
      address: '123 Main St, San Francisco, CA',
      location: { lat: 37.7749, lng: -122.4194 },
      icon: 'home',
      color: colors.primary,
    },
    {
      id: 'work',
      name: 'Work',
      address: '456 Market St, San Francisco, CA',
      location: { lat: 37.7849, lng: -122.4094 },
      icon: 'briefcase',
      color: colors.accent,
    },
    {
      id: 'gym',
      name: 'Gym',
      address: '789 Fitness Ave, San Francisco, CA',
      location: { lat: 37.7649, lng: -122.4294 },
      icon: 'zap',
      color: colors.success,
    },
    {
      id: 'cafe',
      name: 'Favorite Café',
      address: '321 Coffee St, San Francisco, CA',
      location: { lat: 37.7549, lng: -122.4394 },
      icon: 'coffee',
      color: colors.warning,
    },
  ];

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

  // Get current location
  const getCurrentLocation = async () => {
    if (Platform.OS === 'web') {
      setIsLocating(true);
      
      if (!navigator.geolocation) {
        Alert.alert('Error', 'Geolocation is not supported by this browser');
        setIsLocating(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          setIsLocating(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          Alert.alert('Error', 'Unable to get your current location');
          setIsLocating(false);
          // Fallback to San Francisco
          setCurrentLocation({ lat: 37.7749, lng: -122.4194 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      // For mobile, you would use expo-location here
      // For now, use default location
      setCurrentLocation({ lat: 37.7749, lng: -122.4194 });
    }
  };

  // Search for locations
  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Mock search results - in a real app, you'd use Google Places API
    const mockResults = [
      {
        id: '1',
        name: 'Union Square',
        address: 'Union Square, San Francisco, CA',
        location: { lat: 37.7879, lng: -122.4075 },
      },
      {
        id: '2',
        name: 'Golden Gate Park',
        address: 'Golden Gate Park, San Francisco, CA',
        location: { lat: 37.7694, lng: -122.4862 },
      },
      {
        id: '3',
        name: 'Fisherman\'s Wharf',
        address: 'Fisherman\'s Wharf, San Francisco, CA',
        location: { lat: 37.8080, lng: -122.4177 },
      },
    ].filter(result => 
      result.name.toLowerCase().includes(query.toLowerCase()) ||
      result.address.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(mockResults);
    setShowSearchResults(true);
  };

  // Handle route planning
  const planRoute = async () => {
    if (!currentLocation || !destination) {
      Alert.alert('Error', 'Please select both origin and destination');
      return;
    }

    try {
      clearError();
      await getStressOptimizedRoutes(currentLocation, destination);
    } catch (error) {
      console.error('Route planning failed:', error);
    }
  };

  // Handle destination selection
  const selectDestination = (location: Location, name?: string) => {
    setDestination({ ...location, name });
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

  // Animated styles
  const searchBarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: searchBarScale.value }],
  }));

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  // Initialize location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Plan route when both locations are set
  useEffect(() => {
    if (currentLocation && destination) {
      planRoute();
    }
  }, [currentLocation, destination, selectedTransportMode]);

  return (
    <View style={styles.container}>
      {/* Map View */}
      <View style={styles.mapContainer}>
        <GoogleMapView
          routes={routes.map(route => ({
            id: route.id,
            overviewPolyline: route.overviewPolyline,
            color: route.color,
          }))}
          origin={currentLocation || { lat: 37.7749, lng: -122.4194 }}
          destination={destination || { lat: 37.7849, lng: -122.4094 }}
          selectedRoute={selectedRoute}
          onRouteSelect={setSelectedRoute}
          style={styles.map}
        />
        
        {/* Map Overlay Controls */}
        <View style={styles.mapOverlay}>
          {/* Search Bar */}
          <Animated.View style={[styles.searchContainer, searchBarAnimatedStyle]}>
            <View style={[styles.searchBar, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
              <Search size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Where to?"
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
                onPress={() => setShowSavedLocations(!showSavedLocations)}
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
                {savedLocations.map((location) => (
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
                ))}
              </View>
            )}
          </Animated.View>

          {/* Transport Mode Selector */}
          <View style={styles.transportModeContainer}>
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

          {/* Current Location FAB */}
          <Animated.View style={[styles.locationFab, fabAnimatedStyle]}>
            <TouchableOpacity
              style={[styles.fabButton, { shadowColor: colors.shadow }]}
              onPress={handleFabPress}
              disabled={isLocating}
            >
              <LinearGradient
                colors={theme.gradient.primary}
                style={styles.fabGradient}
              >
                {isLocating ? (
                  <RotateCcw size={24} color={colors.textInverse} />
                ) : (
                  <Navigation size={24} color={colors.textInverse} />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      {/* Route Information Panel */}
      {routes.length > 0 && (
        <View style={[styles.routePanel, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {routes.map((route) => (
              <TouchableOpacity
                key={route.id}
                style={[
                  styles.routeCard,
                  { backgroundColor: colors.card },
                  selectedRoute === route.id && { borderColor: colors.primary, borderWidth: 2 }
                ]}
                onPress={() => setSelectedRoute(route.id)}
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
        <View style={[styles.loadingOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
            <RotateCcw size={32} color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Finding optimal routes...
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  searchContainer: {
    margin: 20,
    marginTop: 60,
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
  transportModeContainer: {
    position: 'absolute',
    bottom: 200,
    left: 0,
    right: 0,
  },
  transportModeScroll: {
    paddingHorizontal: 20,
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
  locationFab: {
    position: 'absolute',
    bottom: 120,
    right: 20,
  },
  fabButton: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routePanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  routeCard: {
    width: 280,
    marginHorizontal: 12,
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Quicksand-Medium',
  },
});