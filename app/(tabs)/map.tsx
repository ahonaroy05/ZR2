import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { MapPin, Clock, TrendingDown, Route, Navigation, TriangleAlert as AlertTriangle } from 'lucide-react-native';

interface RouteOption {
  id: string;
  name: string;
  duration: string;
  stressLevel: 'low' | 'medium' | 'high';
  traffic: string;
  therapyType: string;
  color: string;
}

export default function MapScreen() {
  const { theme } = useTheme();
  const [selectedRoute, setSelectedRoute] = useState<string>('route1');

  const routes: RouteOption[] = [
    {
      id: 'route1',
      name: 'Zen Highway',
      duration: '32 min',
      stressLevel: 'low',
      traffic: 'Light',
      therapyType: 'Nature Sounds',
      color: theme.colors.success,
    },
    {
      id: 'route2',
      name: 'City Express',
      duration: '28 min',
      stressLevel: 'high',
      traffic: 'Heavy',
      therapyType: 'Guided Meditation',
      color: theme.colors.accent,
    },
    {
      id: 'route3',
      name: 'Scenic Route',
      duration: '38 min',
      stressLevel: 'medium',
      traffic: 'Moderate',
      therapyType: 'Breathing Exercise',
      color: theme.colors.primary,
    },
  ];

  const stressZones = [
    { name: 'Downtown Construction', level: 'High', color: theme.colors.accent },
    { name: 'Highway Junction', level: 'Medium', color: theme.colors.primary },
    { name: 'Park Avenue', level: 'Low', color: theme.colors.success },
  ];

  const getStressIcon = (level: string) => {
    switch (level) {
      case 'low': return <TrendingDown size={16} color={theme.colors.success} />;
      case 'medium': return <AlertTriangle size={16} color={theme.colors.primary} />;
      case 'high': return <AlertTriangle size={16} color={theme.colors.accent} />;
      default: return <TrendingDown size={16} color={theme.colors.success} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Route Therapy</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Choose your path to wellness</Text>
        </View>

        <View style={styles.mapContainer}>
          <LinearGradient
            colors={theme.isDark ? ['#1A1F2E', '#252B3A'] : ['#F0F7FF', '#E6F3FF']}
            style={[styles.mapPlaceholder, { shadowColor: theme.colors.shadow }]}
          >
            <View style={styles.mapContent}>
              <MapPin size={32} color={theme.colors.primary} />
              <Text style={[styles.mapText, { color: theme.colors.text }]}>Interactive Route Map</Text>
              <Text style={[styles.mapSubtext, { color: theme.colors.textSecondary }]}>Tap routes to preview therapy options</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.routesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recommended Routes</Text>
          {routes.map((route) => (
            <TouchableOpacity
              key={route.id}
              style={[
                styles.routeCard,
                { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow },
                selectedRoute === route.id && styles.routeCardSelected
              ]}
              onPress={() => setSelectedRoute(route.id)}
            >
              <View style={styles.routeHeader}>
                <View style={styles.routeInfo}>
                  <Text style={[styles.routeName, { color: theme.colors.text }]}>{route.name}</Text>
                  <View style={styles.routeMeta}>
                    <Clock size={14} color={theme.colors.textTertiary} />
                    <Text style={[styles.routeDuration, { color: theme.colors.textSecondary }]}>{route.duration}</Text>
                    {getStressIcon(route.stressLevel)}
                    <Text style={[styles.routeTraffic, { color: theme.colors.textSecondary }]}>{route.traffic} traffic</Text>
                  </View>
                </View>
                <View 
                  style={[styles.routeIndicator, { backgroundColor: route.color }]} 
                />
              </View>
              
              <View style={styles.therapyInfo}>
                <View style={[styles.therapyTag, { backgroundColor: theme.colors.primaryLight }]}>
                  <Text style={[styles.therapyTagText, { color: theme.colors.primary }]}>{route.therapyType}</Text>
                </View>
                <Text style={[styles.therapyDescription, { color: theme.colors.textSecondary }]}>
                  Tailored wellness content for this route's conditions
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.stressZones}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Stress Zones</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Areas with elevated stress levels and recommended therapy
          </Text>
          {stressZones.map((zone, index) => (
            <View key={index} style={[styles.zoneCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
              <View style={styles.zoneHeader}>
                <View style={[styles.zoneIndicator, { backgroundColor: zone.color }]} />
                <Text style={[styles.zoneName, { color: theme.colors.text }]}>{zone.name}</Text>
              </View>
              <Text style={[styles.zoneLevel, { color: theme.colors.textSecondary }]}>Stress Level: {zone.level}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity style={[styles.startButton, { shadowColor: theme.colors.shadow }]}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.accent]}
              style={styles.startGradient}
            >
              <Navigation size={20} color="#FAFAFA" />
              <Text style={[styles.startButtonText, { color: theme.colors.surface }]}>Start Zen Journey</Text>
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
    color: '#333',
  },
  subtitle: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 16,
    color: '#666',
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
  },
  routesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 20,
    color: '#333',
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
    borderWidth: 2,
    borderColor: 'transparent',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  routeCardSelected: {
    borderColor: '#B6D0E2',
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
  },
  routeDuration: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
  },
  routeTraffic: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
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