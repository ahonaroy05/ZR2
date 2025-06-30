import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Bot, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ZenRouteLogo } from '@/components/ZenRouteLogo';

interface AiAssistantFabProps {
  onPress: () => void;
  isActive?: boolean;
}

export function AiAssistantFab({ onPress, isActive = false }: AiAssistantFabProps) {
  const { colors, theme } = useTheme();
  const scale = useSharedValue(1);
  const sparkleRotation = useSharedValue(0);
  const pulseOpacity = useSharedValue(0.7);

  useEffect(() => {
    // Gentle pulse animation
    scale.value = withRepeat(
      withTiming(1.05, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
    
    // Sparkle rotation
    sparkleRotation.value = withRepeat(
      withTiming(360, {
        duration: 4000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Pulse ring animation
    pulseOpacity.value = withRepeat(
      withTiming(1, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedSparkleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotation.value}deg` }],
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value * 0.3,
  }));

  return (
    <Animated.View style={[styles.container, animatedButtonStyle]}>
      {/* Pulse ring */}
      <Animated.View 
        style={[
          styles.pulseRing, 
          { backgroundColor: colors.accent },
          animatedPulseStyle
        ]} 
      />
      
      {/* Sparkle decoration */}
      <Animated.View style={[styles.sparkleContainer, animatedSparkleStyle]}>
        <Sparkles size={12} color={colors.accent} style={styles.sparkle1} />
        <Sparkles size={8} color={colors.primary} style={styles.sparkle2} />
        <Sparkles size={10} color={colors.accent} style={styles.sparkle3} />
      </Animated.View>
      
      {/* Main button */}
      <TouchableOpacity onPress={onPress} style={styles.button} activeOpacity={0.8}>
        <LinearGradient
          colors={isActive ? theme.gradient.accent : theme.gradient.primary}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {isActive ? (
            <Bot size={28} color={colors.textInverse} strokeWidth={2} />
          ) : (
            <ZenRouteLogo size={32} animated={false} color={colors.textInverse} />
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  sparkleContainer: {
    position: 'absolute',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle1: {
    position: 'absolute',
    top: 10,
    right: 15,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 15,
    left: 10,
  },
  sparkle3: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});