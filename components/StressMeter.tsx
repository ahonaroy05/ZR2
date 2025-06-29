import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface StressMeterProps {
  stressLevel: number; // 0-100
  size?: number;
}

export function StressMeter({ stressLevel, size = 120 }: StressMeterProps) {
  const { theme } = useTheme();
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
        [theme.colors.success, theme.colors.warning, theme.colors.error]
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
          <Text style={[styles.levelText, { color: theme.colors.text }]}>{Math.round(stressLevel)}</Text>
          <Text style={[styles.labelText, { color: theme.colors.textSecondary }]}>Stress Level</Text>
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
  },
  labelText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 12,
    marginTop: 4,
  },
});