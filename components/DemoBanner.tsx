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
import { useTheme } from '@/contexts/ThemeContext';
import { Shield } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export function DemoBanner() {
  const { theme } = useTheme();
  const shimmer = useSharedValue(0);
  const { colors } = useTheme();

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + (shimmer.value * 0.4),
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.gradient.primary}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.content}>
          <Shield size={16} color={theme.colors.surface} />
          <Text style={[styles.text, { color: theme.colors.surface }]}>Demo Mode Active</Text>
          <Animated.View style={[styles.shimmer, animatedStyle]} />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  gradient: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  text: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 12,
    marginLeft: 6,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});