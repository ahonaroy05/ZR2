import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  interpolateColor,
} from 'react-native-reanimated';
import { Sun, Moon } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  size?: number;
}

export function ThemeToggle({ size = 40 }: ThemeToggleProps) {
  const { theme, isDark, toggleTheme } = useTheme();
  const animatedValue = useSharedValue(isDark ? 1 : 0);

  useEffect(() => {
    animatedValue.value = withSpring(isDark ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isDark]);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animatedValue.value,
      [0, 1],
      [theme.colors.primary, theme.colors.surface]
    );

    const borderColor = interpolateColor(
      animatedValue.value,
      [0, 1],
      [theme.colors.border, theme.colors.primary]
    );

    return {
      backgroundColor,
      borderColor,
      transform: [
        {
          rotate: `${animatedValue.value * 180}deg`,
        },
      ],
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    const opacity = animatedValue.value;
    return {
      opacity: isDark ? opacity : 1 - opacity,
    };
  });

  return (
    <TouchableOpacity onPress={toggleTheme} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          animatedStyle,
        ]}
      >
        <Animated.View style={[styles.iconContainer, iconStyle]}>
          {isDark ? (
            <Moon size={size * 0.5} color={theme.colors.primary} strokeWidth={2} />
          ) : (
            <Sun size={size * 0.5} color={theme.colors.surface} strokeWidth={2} />
          )}
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});