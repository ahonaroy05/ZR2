import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { ChevronRight, SkipForward } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withSpring,
  withDelay,
  useAnimatedStyle,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function OnboardingStep1() {
  const { colors, theme } = useTheme();
  
  // Animation values
  const fadeAnim = useSharedValue(0);
  const imageScale = useSharedValue(0.8);
  const imageOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(50);
  const textOpacity = useSharedValue(0);
  const progressScale = useSharedValue(0);
  const buttonScale = useSharedValue(0.9);
  const buttonOpacity = useSharedValue(0);
  const floatingElements = useSharedValue(0);

  useEffect(() => {
    // Orchestrated animation sequence
    fadeAnim.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    
    imageOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
    imageScale.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 100 }));
    
    textOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
    textTranslateY.value = withDelay(600, withSpring(0, { damping: 15, stiffness: 100 }));
    
    progressScale.value = withDelay(1000, withSpring(1, { damping: 12, stiffness: 150 }));
    
    buttonOpacity.value = withDelay(1200, withTiming(1, { duration: 600 }));
    buttonScale.value = withDelay(1200, withSpring(1, { damping: 15, stiffness: 100 }));
    
    // Floating animation for decorative elements
    floatingElements.value = withDelay(1500, 
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  const imageStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
    transform: [{ scale: imageScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: progressScale.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [
      { 
        translateY: interpolate(
          floatingElements.value,
          [0, 1],
          [0, -10]
        )
      },
      {
        rotate: `${interpolate(floatingElements.value, [0, 1], [0, 5])}deg`
      }
    ],
  }));

  const handleNext = () => {
    router.push('/onboarding/step2');
  };

  const handleSkip = () => {
    router.replace('/auth');
  };

  const handleButtonPress = (action: () => void) => {
    buttonScale.value = withSpring(0.95, { damping: 15, stiffness: 300 }, () => {
      buttonScale.value = withSpring(1, { damping: 15, stiffness: 300 });
      runOnJS(action)();
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.gradient.background}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View style={[styles.content, containerStyle]}>
          {/* Skip Button */}
          <Animated.View style={[styles.skipContainer, buttonStyle]}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => handleButtonPress(handleSkip)}
              activeOpacity={0.8}
            >
              <SkipForward size={16} color={colors.textSecondary} />
              <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Floating Decorative Elements */}
          <Animated.View style={[styles.floatingElement, styles.floatingElement1, floatingStyle]}>
            <View style={[styles.decorativeCircle, { backgroundColor: colors.primaryLight }]} />
          </Animated.View>
          <Animated.View style={[styles.floatingElement, styles.floatingElement2, floatingStyle]}>
            <View style={[styles.decorativeCircle, { backgroundColor: colors.accent }]} />
          </Animated.View>

          {/* Image Container */}
          <Animated.View style={[styles.imageContainer, imageStyle]}>
            <View style={styles.imageWrapper}>
              <Image
                source={require('@/assets/images/image copy copy.png')}
                style={styles.image}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)']}
                style={styles.imageOverlay}
              />
            </View>
            
            {/* Image Glow Effect */}
            <View style={[styles.imageGlow, { backgroundColor: colors.primary }]} />
          </Animated.View>
          
          {/* Text Container */}
          <Animated.View style={[styles.textContainer, textStyle]}>
            <Text style={styles.title}>Find peace in your daily journey</Text>
            <Text style={[styles.description, { color: colors.text }]}>
              Transform your commute into a mindful experience with personalized routes and calming guidance
            </Text>
          </Animated.View>
          
          {/* Footer */}
          <View style={styles.footer}>
            {/* Progress Indicator */}
            <Animated.View style={[styles.progressIndicator, progressStyle]}>
              <LinearGradient
                colors={[colors.primary, colors.accent]}
                style={[styles.dot, styles.activeDot]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
              <View style={[styles.dot, { backgroundColor: colors.border }]} />
              <View style={[styles.dot, { backgroundColor: colors.border }]} />
            </Animated.View>
            
            {/* Next Button */}
            <Animated.View style={buttonStyle}>
              <TouchableOpacity
                style={[styles.nextButton, { shadowColor: colors.shadow }]}
                onPress={() => handleButtonPress(handleNext)}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={theme.gradient.primary}
                  style={styles.nextGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={[styles.nextText, { color: colors.textInverse }]}>Get Started</Text>
                  <ChevronRight size={20} color={colors.textInverse} strokeWidth={2.5} />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
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
    paddingHorizontal: 24,
    paddingVertical: 60,
    position: 'relative',
  },
  skipContainer: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 6,
  },
  skipText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  floatingElement: {
    position: 'absolute',
    zIndex: 1,
  },
  floatingElement1: {
    top: 120,
    left: 30,
  },
  floatingElement2: {
    top: 200,
    right: 40,
  },
  decorativeCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.6,
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  image: {
    width: width * 0.85,
    height: height * 0.4,
    borderRadius: 28,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  imageGlow: {
    position: 'absolute',
    width: width * 0.9,
    height: height * 0.42,
    borderRadius: 32,
    opacity: 0.1,
    zIndex: -1,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    textAlign: 'center',
    lineHeight: 40,
    color: colors.text,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 16,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    alignItems: 'center',
    gap: 32,
  },
  progressIndicator: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  activeDot: {
    width: 32,
    height: 12,
    borderRadius: 6,
  },
  nextButton: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  nextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 8,
  },
  nextText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
});