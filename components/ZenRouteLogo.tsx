import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  withDelay,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';

interface ZenRouteLogoProps {
  size?: number;
  animated?: boolean;
  withText?: boolean;
  color?: string;
}

export function ZenRouteLogo({ 
  size = 120, 
  animated = true,
  withText = false,
  color
}: ZenRouteLogoProps) {
  const { colors, theme } = useTheme();
  
  // Use provided color or theme primary
  const logoColor = color || colors.primary;
  const accentColor = color || colors.accent;
  
  // Animation values
  const pathProgress = useSharedValue(0);
  const circleScale = useSharedValue(0);
  const circleOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const rippleScale = useSharedValue(0.6);
  const rippleOpacity = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      // Path drawing animation
      pathProgress.value = withTiming(1, {
        duration: 1500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      
      // Circle animation
      circleScale.value = withDelay(
        800,
        withTiming(1, {
          duration: 800,
          easing: Easing.out(Easing.back(1.7)),
        })
      );
      
      circleOpacity.value = withDelay(
        800,
        withTiming(1, {
          duration: 800,
        })
      );
      
      // Text animation
      textOpacity.value = withDelay(
        1200,
        withTiming(1, {
          duration: 800,
          easing: Easing.out(Easing.ease),
        })
      );
      
      // Ripple animation
      rippleScale.value = withDelay(
        1500,
        withTiming(1.2, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        })
      );
      
      rippleOpacity.value = withDelay(
        1500,
        withTiming(0.5, {
          duration: 300,
        })
      );
    } else {
      // Set to completed state without animation
      pathProgress.value = 1;
      circleScale.value = 1;
      circleOpacity.value = 1;
      textOpacity.value = 1;
      rippleScale.value = 1;
      rippleOpacity.value = 0.3;
    }
  }, [animated]);

  // Animated styles
  const pathStyle = useAnimatedStyle(() => ({
    opacity: pathProgress.value,
    transform: [{ scale: 0.9 + (pathProgress.value * 0.1) }],
  }));

  const circleStyle = useAnimatedStyle(() => ({
    opacity: circleOpacity.value,
    transform: [{ scale: circleScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: (1 - textOpacity.value) * 10 }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: rippleOpacity.value,
    transform: [{ scale: rippleScale.value }],
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Ripple effect */}
      <Animated.View 
        style={[
          styles.ripple, 
          { width: size * 1.2, height: size * 1.2, borderRadius: size * 0.6 },
          rippleStyle
        ]} 
      />
      
      {/* SVG Logo */}
      <Animated.View style={[styles.svgContainer, pathStyle]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {/* Main path - stylized Z */}
          <Path
            d="M20,30 L80,30 L20,70 L80,70"
            stroke={logoColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* Horizontal line through the middle */}
          <Path
            d="M30,50 L70,50"
            stroke={logoColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="40"
            strokeDashoffset="0"
            fill="none"
          />
        </Svg>
      </Animated.View>
      
      {/* Zen circles */}
      <Animated.View style={[styles.circlesContainer, circleStyle]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Circle cx="20" cy="30" r="5" fill={accentColor} />
          <Circle cx="80" cy="70" r="5" fill={accentColor} />
        </Svg>
      </Animated.View>
      
      {/* Text (optional) */}
      {withText && (
        <Animated.Text 
          style={[
            styles.logoText, 
            { color: logoColor, fontSize: size * 0.2 },
            textStyle
          ]}
        >
          ZenRoute
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 196, 180, 0.15)',
  },
  svgContainer: {
    position: 'absolute',
  },
  circlesContainer: {
    position: 'absolute',
  },
  logoText: {
    position: 'absolute',
    bottom: -30,
    fontFamily: 'Nunito-Bold',
    letterSpacing: 1,
  },
});