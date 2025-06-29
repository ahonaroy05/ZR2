import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface StressMeterProps {
  stressLevel: number; // 0-100
  size?: number;
}

export function StressMeter({ stressLevel, size = 120 }: StressMeterProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(stressLevel / 100, { duration: 1000 });
  }, [stressLevel]);

  const animatedStyle = useAnimatedStyle(() => {
    const strokeDashoffset = 251.2 * (1 - progress.value);
    
    return {
      strokeDashoffset,
      stroke: interpolateColor(
        progress.value,
        [0, 0.5, 1],
        ['#A8E6CF', '#DDA0DD', '#FFB6C1']
      ),
    };
  });

  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={styles.meterContainer}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.circle]}>
          <Animated.View
            style={[
              styles.progressRing,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
              },
            ]}
          />
        </Animated.View>
        
        <View style={styles.textContainer}>
          <Text style={styles.levelText}>{Math.round(stressLevel)}</Text>
          <Text style={styles.labelText}>Stress Level</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  meterContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    borderWidth: 8,
    borderColor: '#F0F0F0',
    position: 'absolute',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 24,
    color: '#333',
  },
  labelText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});