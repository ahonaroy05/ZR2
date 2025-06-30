import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Clock, 
  MapPin, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Car,
  Train,
  Bike,
  User
} from 'lucide-react-native';

interface RouteCardProps {
  route: {
    id: string;
    name: string;
    summary: string;
    distance: { text: string; value: number };
    duration: { text: string; value: number };
    durationInTraffic?: { text: string; value: number };
    stressLevel: 'low' | 'medium' | 'high';
    stressFactors: string[];
    therapyType: string;
    color: string;
    traffic: string;
    warnings: string[];
    mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
  };
  isSelected?: boolean;
  onPress?: () => void;
  onStartJourney?: () => void;
}

export function RouteCard({ route, isSelected = false, onPress, onStartJourney }: RouteCardProps) {
  const { colors, theme } = useTheme();

  const getStressIcon = () => {
    switch (route.stressLevel) {
      case 'low':
        return <TrendingDown size={16} color={colors.success} />;
      case 'medium':
        return <TrendingUp size={16} color={colors.warning} />;
      case 'high':
        return <AlertTriangle size={16} color={colors.error} />;
      default:
        return <TrendingDown size={16} color={colors.success} />;
    }
  };

  const getModeIcon = () => {
    const iconProps = { size: 16, color: colors.primary };
    
    switch (route.mode) {
      case 'driving':
        return <Car {...iconProps} />;
      case 'transit':
        return <Train {...iconProps} />;
      case 'bicycling':
        return <Bike {...iconProps} />;
      case 'walking':
        return <User {...iconProps} />;
      default:
        return <Car {...iconProps} />;
    }
  };

  const getStressLevelColor = () => {
    switch (route.stressLevel) {
      case 'low':
        return colors.success;
      case 'medium':
        return colors.warning;
      case 'high':
        return colors.error;
      default:
        return colors.success;
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

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.card, shadowColor: colors.shadow },
        isSelected && { borderColor: colors.primary, borderWidth: 2 }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Route Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.routeName, { color: colors.text }]}>{route.name}</Text>
          <Text style={[styles.routeSummary, { color: colors.textSecondary }]}>{route.summary}</Text>
        </View>
        
        <View style={styles.headerRight}>
          <View style={[styles.stressIndicator, { backgroundColor: getStressLevelColor() }]}>
            <Text style={[styles.stressText, { color: colors.textInverse }]}>
              {route.stressLevel.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.routeColorIndicator, { backgroundColor: route.color }]} />
        </View>
      </View>

      {/* Route Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            {getModeIcon()}
            <Text style={[styles.detailText, { color: colors.text }]}>
              {route.mode?.charAt(0).toUpperCase() + route.mode?.slice(1) || 'Driving'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Clock size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.text }]}>
              {route.durationInTraffic ? formatDuration(route.durationInTraffic.value) : formatDuration(route.duration.value)}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <MapPin size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.text }]}>
              {route.distance.text}
            </Text>
          </View>
        </View>

        {/* Traffic and Stress Info */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            {getStressIcon()}
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {route.traffic} traffic
            </Text>
          </View>
          
          {route.durationInTraffic && route.durationInTraffic.value > route.duration.value && (
            <View style={styles.delayIndicator}>
              <Text style={[styles.delayText, { color: colors.warning }]}>
                +{Math.round((route.durationInTraffic.value - route.duration.value) / 60)} min delay
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Therapy Recommendation */}
      <View style={styles.therapySection}>
        <View style={[styles.therapyTag, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.therapyText, { color: colors.primary }]}>
            {route.therapyType}
          </Text>
        </View>
        <Text style={[styles.therapyDescription, { color: colors.textSecondary }]}>
          Recommended for {route.stressLevel} stress journeys
        </Text>
      </View>

      {/* Stress Factors */}
      {route.stressFactors.length > 0 && (
        <View style={styles.factorsSection}>
          <Text style={[styles.factorsTitle, { color: colors.text }]}>Route factors:</Text>
          <View style={styles.factorsList}>
            {route.stressFactors.slice(0, 3).map((factor, index) => (
              <Text key={index} style={[styles.factorItem, { color: colors.textSecondary }]}>
                • {factor}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Warnings */}
      {route.warnings.length > 0 && (
        <View style={styles.warningsSection}>
          <View style={styles.warningItem}>
            <AlertTriangle size={14} color={colors.warning} />
            <Text style={[styles.warningText, { color: colors.warning }]}>
              {route.warnings[0]}
            </Text>
          </View>
        </View>
      )}

      {/* Action Button */}
      {isSelected && onStartJourney && (
        <TouchableOpacity
          style={[styles.actionButton, { shadowColor: colors.shadow }]}
          onPress={onStartJourney}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={theme.gradient.primary}
            style={styles.actionGradient}
          >
            <Text style={[styles.actionText, { color: colors.textInverse }]}>
              Start Journey
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  routeName: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    marginBottom: 4,
  },
  routeSummary: {
    fontSize: 14,
    fontFamily: 'Quicksand-Regular',
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  stressIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stressText: {
    fontSize: 10,
    fontFamily: 'Quicksand-Bold',
    letterSpacing: 0.5,
  },
  routeColorIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  details: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Quicksand-Medium',
    marginLeft: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Quicksand-Medium',
    marginLeft: 4,
  },
  delayIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  delayText: {
    fontSize: 12,
    fontFamily: 'Quicksand-SemiBold',
  },
  therapySection: {
    marginBottom: 12,
  },
  therapyTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  therapyText: {
    fontSize: 12,
    fontFamily: 'Quicksand-SemiBold',
  },
  therapyDescription: {
    fontSize: 12,
    fontFamily: 'Quicksand-Regular',
    lineHeight: 16,
  },
  factorsSection: {
    marginBottom: 12,
  },
  factorsTitle: {
    fontSize: 12,
    fontFamily: 'Quicksand-SemiBold',
    marginBottom: 4,
  },
  factorsList: {
    gap: 2,
  },
  factorItem: {
    fontSize: 11,
    fontFamily: 'Quicksand-Regular',
    lineHeight: 14,
  },
  warningsSection: {
    marginBottom: 12,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 8,
  },
  warningText: {
    fontSize: 12,
    fontFamily: 'Quicksand-Medium',
    marginLeft: 6,
    flex: 1,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  actionGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Quicksand-SemiBold',
  },
});