import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { Heart } from 'lucide-react-native';

export default function SplashScreen() {
  const rippleScale = useSharedValue(1);
  const logoScale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    // Ripple effect
    rippleScale.value = withRepeat(
      withTiming(1.3, {
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    // Logo entrance
    logoScale.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.back(1.2)),
    });

    // Text fade in
    setTimeout(() => {
      textOpacity.value = withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.ease),
      });
    }, 500);

    // Navigate to onboarding after 3 seconds
    const timer = setTimeout(() => {
      router.replace('/onboarding/step1');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: 1.2 - rippleScale.value * 0.4,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8FBFF', '#E6F3FF', '#B6D0E2']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Animated.View style={[styles.ripple, rippleStyle]} />
            <Animated.View style={[styles.logoWrapper, logoStyle]}>
              <LinearGradient
                colors={['#B6D0E2', '#87CEEB']}
                style={styles.logo}
              >
                <Heart size={48} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>
          </View>
          
          <Animated.View style={[styles.textContainer, textStyle]}>
            <Text style={styles.title}>ZenRoute</Text>
            <Text style={styles.tagline}>Transform your commute into calm</Text>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  ripple: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(182, 208, 226, 0.3)',
  },
  logoWrapper: {
    shadowColor: '#B6D0E2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 42,
    color: '#333',
    marginBottom: 12,
    textShadowColor: 'rgba(255, 255, 255, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    textShadowColor: 'rgba(255, 255, 255, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});