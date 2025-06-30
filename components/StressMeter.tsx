import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolateColor,
  useAnimatedProps,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface StressMeterProps {
  stressLevel: number; // 0-100
  size?: number;
}

export function StressMeter({ stressLevel, size = 120 }: StressMeterProps) {
  const { colors } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(stressLevel / 100, { duration: 1000 });
  }, [stressLevel]);

  const radius = (size - 16) / 2; // Account for stroke width
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 8;

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progress.value);
    
    return {
      strokeDashoffset,
      stroke: interpolateColor(
        progress.value,
        [0, 0.4, 0.7, 1],
        [colors.success, colors.primary, colors.warning, colors.error]
      ),
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={styles.meterContainer}>
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.border}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Progress circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            animatedProps={animatedProps}
          />
        </Svg>
        
        <View style={styles.textContainer}>
          <Text style={[styles.levelText, { color: colors.text }]}>{Math.round(stressLevel)}</Text>
          <Text style={[styles.labelText, { color: colors.textSecondary }]}>Stress Level</Text>
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
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
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