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
  Image,
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
import { 
  MapPin, 
  Navigation, 
  Search, 
  Clock, 
  Car, 
  Brain as Train, 
  Bike, 
  User, 
  Star, 
  Chrome as Home, 
  Briefcase, 
  Coffee, 
  Heart, 
  X, 
  RotateCcw, 
  Zap, 
  TriangleAlert as AlertTriangle, 
  TrendingUp,
  ZoomIn,
  ZoomOut,
  RotateCw,
  HelpCircle,
  Route
} from 'lucide-react-native';

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
  const [currentLocation, setCurrentLocation] = useState<Location | null>({ lat: 20.2960, lng: 85.8246 });
  const [destination, setDestination] = useState<Location | null>({ lat: 20.2700, lng: 85.8400 });
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
      address: '123 Main St, Bhubaneswar, Odisha',
      location: { lat: 20.2960, lng: 85.8246 },
      icon: 'home',
      color: colors.primary,
    },
    {
      id: 'work',
      name: 'Downtown Office',
      address: '456 Business District, Bhubaneswar, Odisha',
      location: { lat: 20.2700, lng: 85.8400 },
      icon: 'briefcase',
      color: colors.accent,
    },
    {
      id: 'gym',
      name: 'Fitness Center',
      address: '789 Health Ave, Bhubaneswar, Odisha',
      location: { lat: 20.2800, lng: 85.8300 },
      icon: 'zap',
      color: colors.success,
    },
    {
      id: 'cafe',
      name: 'Favorite Café',
      address: '321 Coffee St, Bhubaneswar, Odisha',
      location: { lat: 20.2900, lng: 85.8500 },
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
          // Keep default location
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
      setCurrentLocation({ lat: 20.2960, lng: 85.8246 });
    }
  };

  // Search for locations
  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Mock search results
    const mockResults = [
      {
        id: '1',
        name: 'Kalinga Stadium',
        address: 'Kalinga Stadium, Bhubaneswar, Odisha',
        location: { lat: 20.2850, lng: 85.8200 },
      },
      {
        id: '2',
        name: 'Ekamra Kanan',
        address: 'Ekamra Kanan Botanical Gardens, Bhubaneswar, Odisha',
        location: { lat: 20.2750, lng: 85.8350 },
      },
      {
        id: '3',
        name: 'Shri Ram Temple',
        address: 'Shri Ram Temple, Bhubaneswar, Odisha',
        location: { lat: 20.2650, lng: 85.8450 },
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Map Card */}
      <View style={[styles.mapCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        {/* Find My Location Button */}
        <TouchableOpacity 
          style={[styles.findLocationButton, { backgroundColor: colors.overlay }]}
          onPress={handleFabPress}
          disabled={isLocating}
        >
          <MapPin size={16} color={colors.text} />
          <Text style={[styles.findLocationText, { color: colors.text }]}>Find My Location</Text>
        </TouchableOpacity>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
            <ZoomIn size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
            <ZoomOut size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
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
          origin={currentLocation || { lat: 20.2960, lng: 85.8246 }}
          destination={destination || { lat: 20.2700, lng: 85.8400 }}
          selectedRoute={selectedRoute}
          onRouteSelect={setSelectedRoute}
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
          <Text style={[styles.journeyTitle, { color: colors.textInverse }]}>Current Journey</Text>
        </View>
        
        <Text style={[styles.journeyRoute, { color: colors.textInverse }]}>
          Home → Downtown Office
        </Text>
        
        <Text style={[styles.journeyCoordinates, { color: colors.textSecondary }]}>
          Current: 20.2960, 85.8246
        </Text>

        <TouchableOpacity style={[styles.helpButton, { backgroundColor: colors.primary }]}>
          <HelpCircle size={16} color={colors.textInverse} />
          <Text style={[styles.helpButtonText, { color: colors.textInverse }]}>
            Need help with your route planning?
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
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
        <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
          <RotateCcw size={32} color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Finding optimal routes...
          </Text>
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
  findLocationButton: {
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
  findLocationText: {
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
    backgroundColor: '#4A3B4A', // Dark purple background like in the image
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
    color: '#FFFFFF',
  },
  journeyRoute: {
    fontSize: 24,
    fontFamily: 'Nunito-Bold',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  journeyCoordinates: {
    fontSize: 14,
    fontFamily: 'Quicksand-Regular',
    marginBottom: 16,
    color: '#B8A8B8',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-end',
  },
  helpButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Quicksand-Medium',
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
  },
  bottomPadding: {
    height: 100,
  },
});