import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface BreathingBubbleProps {
  isActive?: boolean;
  size?: number;
}

export function BreathingBubble({ isActive = false, size = 150 }: BreathingBubbleProps) {
  const { colors, theme } = useTheme();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    if (isActive) {
      scale.value = withRepeat(
        withTiming(1.2, {
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
      opacity.value = withRepeat(
        withTiming(1, {
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    } else {
      scale.value = withTiming(0.8, { duration: 800 });
      opacity.value = withTiming(0.7, { duration: 800 });
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[styles.bubble, animatedStyle, { width: size, height: size }]}>
        <LinearGradient
          colors={theme.gradient.primary}
          style={[styles.gradient, { borderRadius: size / 2 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.textContainer}>
            <Text style={[styles.breathText, { color: theme.colors.surface }]}>
              {isActive ? 'Breathe' : 'Tap to Start'}
            </Text>
            {isActive && (
              <Text style={[styles.instructionText, { color: theme.colors.surface }]}>
                In • Hold • Out • Hold
              </Text>
            )}
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  breathText: {
    fontFamily: 'Nunito-Bold',
    textAlign: 'center',
  },
  instructionText: {
    fontFamily: 'Quicksand-Medium',
    marginTop: 4,
    opacity: 0.9,
  },
});