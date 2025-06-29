import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useGoogleMapsRoutes } from '@/hooks/useGoogleMapsRoutes';
import { GoogleMapView } from '@/components/GoogleMapView';
import { MapPin, Clock, TrendingDown, Route, Navigation, TriangleAlert as AlertTriangle, Loader } from 'lucide-react-native';

interface StressZone {
  name: string;
  level: 'High' | 'Medium' | 'Low';
  color: string;
  coordinates: { lat: number; lng: number };
}

export default function MapScreen() {
  const { colors, theme } = useTheme();
  const { routes, loading, error, getStressOptimizedRoutes, clearError } = useGoogleMapsRoutes();
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState({ lat: 37.7749, lng: -122.4194 }); // San Francisco default
  const [destination, setDestination] = useState({ lat: 37.7849, lng: -122.4094 }); // Sample destination

  // Sample stress zones based on common urban areas
  const stressZones: StressZone[] = [
    { 
      name: 'Downtown Construction', 
      level: 'High', 
      color: colors.error,
      coordinates: { lat: 37.7849, lng: -122.4094 }
    },
    { 
      name: 'Highway Junction', 
      level: 'Medium', 
      color: colors.warning,
      coordinates: { lat: 37.7749, lng: -122.4194 }
    },
    { 
      name: 'Park Avenue', 
      level: 'Low', 
      color: colors.success,
      coordinates: { lat: 37.7649, lng: -122.4294 }
    },
  ];

  // Load routes on component mount
  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      clearError();
      await getStressOptimizedRoutes(currentLocation, destination);
    } catch (err) {
      console.error('Failed to load routes:', err);
      Alert.alert(
        'Route Loading Failed',
        'Unable to load routes. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRouteSelect = (routeId: string) => {
    setSelectedRoute(routeId);
  };

  const handleStartJourney = () => {
    const selected = routes.find(route => route.id === selectedRoute);
    if (selected) {
      Alert.alert(
        'Start Journey',
        `Starting your zen journey via ${selected.name}.\n\nRecommended therapy: ${selected.therapyType}`,
        [{ text: 'Begin', style: 'default' }]
      );
    } else {
      Alert.alert(
        'Select Route',
        'Please select a route before starting your journey.',
        [{ text: 'OK' }]
      );
    }
  };

  const getStressIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return <TrendingDown size={16} color={colors.success} />;
      case 'medium': return <AlertTriangle size={16} color={colors.warning} />;
      case 'high': return <AlertTriangle size={16} color={colors.error} />;
      default: return <TrendingDown size={16} color={colors.success} />;
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Route Therapy</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Choose your path to wellness</Text>
        </View>

        {/* Interactive Map Placeholder with Loading State */}
        <View style={styles.mapContainer}>
          {loading || error || routes.length === 0 ? (
            <LinearGradient
              colors={[colors.primaryLight, colors.surface]}
              style={[styles.mapPlaceholder, { shadowColor: colors.shadow }]}
            >
              <View style={styles.mapContent}>
                {loading ? (
                  <>
                    <Loader size={32} color={colors.primary} />
                    <Text style={[styles.mapText, { color: colors.text }]}>Loading Routes...</Text>
                    <Text style={[styles.mapSubtext, { color: colors.textSecondary }]}>Analyzing traffic and stress factors</Text>
                  </>
                ) : error ? (
                  <>
                    <AlertTriangle size={32} color={colors.error} />
                    <Text style={[styles.mapText, { color: colors.text }]}>Route Loading Failed</Text>
                    <Text style={[styles.mapSubtext, { color: colors.textSecondary }]}>Tap to retry</Text>
                    <TouchableOpacity 
                      style={[styles.retryButton, { backgroundColor: colors.primary }]}
                      onPress={loadRoutes}
                    >
                      <Text style={[styles.retryButtonText, { color: colors.textInverse }]}>Retry</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <MapPin size={32} color={colors.success} />
                    <Text style={[styles.mapText, { color: colors.text }]}>Interactive Route Map</Text>
                    <Text style={[styles.mapSubtext, { color: colors.textSecondary }]}>
                      Tap routes to preview therapy options
                    </Text>
                  </>
                )}
              </View>
            </LinearGradient>
          ) : (
            <View style={[styles.mapWrapper, { shadowColor: colors.shadow }]}>
              <GoogleMapView
                routes={routes.map(route => ({
                  id: route.id,
                  overviewPolyline: route.overviewPolyline,
                  color: route.color,
                }))}
                origin={currentLocation}
                destination={destination}
                selectedRoute={selectedRoute}
                onRouteSelect={handleRouteSelect}
                style={styles.map}
              />
            </View>
          )}
        </View>

        {/* Routes Section */}
        <View style={styles.routesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {loading ? 'Loading Routes...' : `Recommended Routes (${routes.length})`}
          </Text>
          
          {routes.length > 0 ? (
            routes.map((route) => (
              <TouchableOpacity
                key={route.id}
                style={[
                  styles.routeCard,
                  { backgroundColor: colors.card, shadowColor: colors.shadow },
                  selectedRoute === route.id && { borderColor: colors.primary, borderWidth: 2 }
                ]}
                onPress={() => handleRouteSelect(route.id)}
              >
                <View style={styles.routeHeader}>
                  <View style={styles.routeInfo}>
                    <Text style={[styles.routeName, { color: colors.text }]}>{route.name}</Text>
                    <View style={styles.routeMeta}>
                      <Clock size={14} color={colors.textSecondary} />
                      <Text style={[styles.routeDuration, { color: colors.textSecondary }]}>
                        {route.durationInTraffic ? formatDuration(route.durationInTraffic.value) : formatDuration(route.duration.value)}
                      </Text>
                      {getStressIcon(route.stressLevel)}
                      <Text style={[styles.routeTraffic, { color: colors.textSecondary }]}>{route.traffic} traffic</Text>
                    </View>
                    <Text style={[styles.routeDistance, { color: colors.textSecondary }]}>
                      {formatDistance(route.distance.value)}
                    </Text>
                  </View>
                  <View style={[styles.routeIndicator, { backgroundColor: route.color }]} />
                </View>
                
                <View style={styles.therapyInfo}>
                  <View style={[styles.therapyTag, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.therapyTagText, { color: colors.primary }]}>{route.therapyType}</Text>
                  </View>
                  <Text style={[styles.therapyDescription, { color: colors.textSecondary }]}>
                    Tailored wellness content for {route.stressLevel} stress conditions
                  </Text>
                  
                  {/* Stress Factors */}
                  {route.stressFactors.length > 0 && (
                    <View style={styles.stressFactors}>
                      {route.stressFactors.slice(0, 2).map((factor, index) => (
                        <Text key={index} style={[styles.stressFactor, { color: colors.textSecondary }]}>
                          • {factor}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>

                {/* Route Warnings */}
                {route.warnings.length > 0 && (
                  <View style={styles.warningsContainer}>
                    <AlertTriangle size={12} color={colors.warning} />
                    <Text style={[styles.warningText, { color: colors.warning }]}>
                      {route.warnings[0]}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : !loading && (
            <View style={[styles.noRoutesContainer, { backgroundColor: colors.card }]}>
              <MapPin size={24} color={colors.textSecondary} />
              <Text style={[styles.noRoutesText, { color: colors.textSecondary }]}>
                No routes available. Please try again.
              </Text>
            </View>
          )}
        </View>

        {/* Stress Zones Section */}
        <View style={styles.stressZones}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Stress Zones</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Areas with elevated stress levels and recommended therapy
          </Text>
          {stressZones.map((zone, index) => (
            <View key={index} style={[styles.zoneCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
              <View style={styles.zoneHeader}>
                <View style={[styles.zoneIndicator, { backgroundColor: zone.color }]} />
                <Text style={[styles.zoneName, { color: colors.text }]}>{zone.name}</Text>
              </View>
              <Text style={[styles.zoneLevel, { color: colors.textSecondary }]}>Stress Level: {zone.level}</Text>
            </View>
          ))}
        </View>

        {/* Action Section */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={[
              styles.startButton, 
              { shadowColor: colors.shadow },
              !selectedRoute && { opacity: 0.6 }
            ]}
            onPress={handleStartJourney}
            disabled={!selectedRoute}
          >
            <LinearGradient
              colors={theme.gradient.primary}
              style={styles.startGradient}
            >
              <Navigation size={20} color={colors.textInverse} />
              <Text style={[styles.startButtonText, { color: colors.textInverse }]}>
                {selectedRoute ? 'Start Zen Journey' : 'Select a Route'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 28,
  },
  subtitle: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 16,
    marginTop: 8,
  },
  mapContainer: {
    marginBottom: 32,
  },
  mapPlaceholder: {
    height: 200,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  mapWrapper: {
    height: 200,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  map: {
    height: 200,
  },
  mapContent: {
    alignItems: 'center',
  },
  mapText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 18,
    marginTop: 8,
  },
  mapSubtext: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  retryButtonText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
  },
  routesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 20,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  routeCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 18,
    marginBottom: 4,
  },
  routeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  routeDuration: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
  },
  routeTraffic: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
  },
  routeDistance: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 12,
  },
  routeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginLeft: 16,
  },
  therapyInfo: {
    marginTop: 8,
  },
  therapyTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  therapyTagText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 12,
  },
  therapyDescription: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  stressFactors: {
    marginTop: 4,
  },
  stressFactor: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  warningsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 193, 7, 0.2)',
  },
  warningText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
  noRoutesContainer: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  noRoutesText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  stressZones: {
    marginBottom: 32,
  },
  zoneCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  zoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  zoneIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  zoneName: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
  },
  zoneLevel: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    marginLeft: 24,
  },
  actionSection: {
    paddingBottom: 32,
  },
  startButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  startButtonText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 16,
  },
});