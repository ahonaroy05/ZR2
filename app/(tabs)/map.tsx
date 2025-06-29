import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [selectedRoute, setSelectedRoute] = useState<string>('route1');

  const routes: RouteOption[] = [
    {
      id: 'route1',
      name: 'Zen Highway',
      duration: '32 min',
      stressLevel: 'low',
      traffic: 'Light',
      therapyType: 'Nature Sounds',
      color: '#A8E6CF',
    },
    {
      id: 'route2',
      name: 'City Express',
      duration: '28 min',
      stressLevel: 'high',
      traffic: 'Heavy',
      therapyType: 'Guided Meditation',
      color: '#FFB6C1',
    },
    {
      id: 'route3',
      name: 'Scenic Route',
      duration: '38 min',
      stressLevel: 'medium',
      traffic: 'Moderate',
      therapyType: 'Breathing Exercise',
      color: '#DDA0DD',
    },
  ];

  const stressZones = [
    { name: 'Downtown Construction', level: 'High', color: '#FFB6C1' },
    { name: 'Highway Junction', level: 'Medium', color: '#DDA0DD' },
    { name: 'Park Avenue', level: 'Low', color: '#A8E6CF' },
  ];

  const getStressIcon = (level: string) => {
    switch (level) {
      case 'low': return <TrendingDown size={16} color="#A8E6CF" />;
      case 'medium': return <AlertTriangle size={16} color="#DDA0DD" />;
      case 'high': return <AlertTriangle size={16} color="#FFB6C1" />;
      default: return <TrendingDown size={16} color="#A8E6CF" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Route Therapy</Text>
          <Text style={styles.subtitle}>Choose your path to wellness</Text>
        </View>

        <View style={styles.mapContainer}>
          <LinearGradient
            colors={['#F0FAF4', '#E8F5E8']}
            style={styles.mapPlaceholder}
          >
            <View style={styles.mapContent}>
              <MapPin size={32} color="#A8E6CF" />
              <Text style={styles.mapText}>Interactive Route Map</Text>
              <Text style={styles.mapSubtext}>Tap routes to preview therapy options</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.routesSection}>
          <Text style={styles.sectionTitle}>Recommended Routes</Text>
          {routes.map((route) => (
            <TouchableOpacity
              key={route.id}
              style={[
                styles.routeCard,
                selectedRoute === route.id && styles.routeCardSelected
              ]}
              onPress={() => setSelectedRoute(route.id)}
            >
              <View style={styles.routeHeader}>
                <View style={styles.routeInfo}>
                  <Text style={styles.routeName}>{route.name}</Text>
                  <View style={styles.routeMeta}>
                    <Clock size={14} color="#666" />
                    <Text style={styles.routeDuration}>{route.duration}</Text>
                    {getStressIcon(route.stressLevel)}
                    <Text style={styles.routeTraffic}>{route.traffic} traffic</Text>
                  </View>
                </View>
                <View 
                  style={[styles.routeIndicator, { backgroundColor: route.color }]} 
                />
              </View>
              
              <View style={styles.therapyInfo}>
                <View style={styles.therapyTag}>
                  <Text style={styles.therapyTagText}>{route.therapyType}</Text>
                </View>
                <Text style={styles.therapyDescription}>
                  Tailored wellness content for this route's conditions
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.stressZones}>
          <Text style={styles.sectionTitle}>Stress Zones</Text>
          <Text style={styles.sectionSubtitle}>
            Areas with elevated stress levels and recommended therapy
          </Text>
          {stressZones.map((zone, index) => (
            <View key={index} style={styles.zoneCard}>
              <View style={styles.zoneHeader}>
                <View style={[styles.zoneIndicator, { backgroundColor: zone.color }]} />
                <Text style={styles.zoneName}>{zone.name}</Text>
              </View>
              <Text style={styles.zoneLevel}>Stress Level: {zone.level}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.startButton}>
            <LinearGradient
              colors={['#A8E6CF', '#98E4D6']}
              style={styles.startGradient}
            >
              <Navigation size={20} color="#FAFAFA" />
              <Text style={styles.startButtonText}>Start Zen Journey</Text>
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
    backgroundColor: '#FAFAFA',
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
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContent: {
    alignItems: 'center',
  },
  mapText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 18,
    color: '#333',
    marginTop: 8,
  },
  mapSubtext: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    color: '#666',
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
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  routeCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  routeCardSelected: {
    borderColor: '#A8E6CF',
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
    color: '#333',
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
    color: '#666',
  },
  routeTraffic: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    color: '#666',
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
    backgroundColor: '#F0FAF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  therapyTagText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 12,
    color: '#A8E6CF',
  },
  therapyDescription: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  stressZones: {
    marginBottom: 32,
  },
  zoneCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
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
    color: '#333',
  },
  zoneLevel: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    color: '#666',
    marginLeft: 24,
  },
  actionSection: {
    paddingBottom: 32,
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
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
    color: '#FAFAFA',
  },
});