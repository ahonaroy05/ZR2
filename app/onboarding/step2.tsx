import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { ChevronRight, ArrowLeft } from 'lucide-react-native';
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

export default function OnboardingStep2() {
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
  const backButtonOpacity = useSharedValue(0);
  const pulseAnimation = useSharedValue(0);

  useEffect(() => {
    // Orchestrated animation sequence
    fadeAnim.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    
    backButtonOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    
    imageOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
    imageScale.value = withDelay(300, withSpring(1, { damping: 15, stiffness: 100 }));
    
    textOpacity.value = withDelay(700, withTiming(1, { duration: 800 }));
    textTranslateY.value = withDelay(700, withSpring(0, { damping: 15, stiffness: 100 }));
    
    progressScale.value = withDelay(1100, withSpring(1, { damping: 12, stiffness: 150 }));
    
    buttonOpacity.value = withDelay(1300, withTiming(1, { duration: 600 }));
    buttonScale.value = withDelay(1300, withSpring(1, { damping: 15, stiffness: 100 }));
    
    // Continuous pulse animation for accent elements
    pulseAnimation.value = withDelay(1500, 
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

  const backButtonStyle = useAnimatedStyle(() => ({
    opacity: backButtonOpacity.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [
      { 
        scale: interpolate(
          pulseAnimation.value,
          [0, 1],
          [1, 1.1]
        )
      }
    ],
    opacity: interpolate(
      pulseAnimation.value,
      [0, 1],
      [0.7, 1]
    ),
  }));

  const handleNext = () => {
    router.push('/onboarding/step3');
  };

  const handleBack = () => {
    router.back();
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
          {/* Back Button */}
          <Animated.View style={[styles.backContainer, backButtonStyle]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => handleButtonPress(handleBack)}
              activeOpacity={0.8}
            >
              <ArrowLeft size={20} color={colors.textInverse} strokeWidth={2.5} />
            </TouchableOpacity>
          </Animated.View>

          {/* Animated Background Elements */}
          <Animated.View style={[styles.backgroundElement, styles.backgroundElement1, pulseStyle]}>
            <LinearGradient
              colors={[colors.accent, colors.primary]}
              style={styles.gradientCircle}
            />
          </Animated.View>
          <Animated.View style={[styles.backgroundElement, styles.backgroundElement2, pulseStyle]}>
            <View style={[styles.decorativeSquare, { backgroundColor: colors.primaryLight }]} />
          </Animated.View>

          {/* Image Container */}
          <Animated.View style={[styles.imageContainer, imageStyle]}>
            <View style={styles.imageWrapper}>
              <Image
                source={require('@/assets/images/image copy.png')}
                style={styles.image}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.4)']}
                style={styles.imageOverlay}
              />
              
              {/* Floating Stats Overlay */}
              <View style={styles.statsOverlay}>
                <View style={[styles.statCard, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}>
                  <Text style={[styles.statNumber, { color: colors.primary }]}>85%</Text>
                  <Text style={[styles.statLabel, { color: colors.text }]}>Stress Reduced</Text>
                </View>
              </View>
            </View>
            
            {/* Multiple Glow Effects */}
            <View style={[styles.imageGlow, styles.imageGlow1, { backgroundColor: colors.primary }]} />
            <View style={[styles.imageGlow, styles.imageGlow2, { backgroundColor: colors.accent }]} />
          </Animated.View>
          
          {/* Text Container */}
          <Animated.View style={[styles.textContainer, textStyle]}>
            <Text style={styles.title}>Track your wellness with mindful insights</Text>
            <Text style={[styles.description, { color: colors.textInverse }]}>
              Monitor your stress levels, meditation progress, and emotional well-being with beautiful analytics
            </Text>
          </Animated.View>
          
          {/* Footer */}
          <View style={styles.footer}>
            {/* Progress Indicator */}
            <Animated.View style={[styles.progressIndicator, progressStyle]}>
              <View style={[styles.dot, { backgroundColor: colors.border }]} />
              <LinearGradient
                colors={[colors.primary, colors.accent]}
                style={[styles.dot, styles.activeDot]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
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
                  <Text style={[styles.nextText, { color: colors.textInverse }]}>Continue</Text>
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
  backContainer: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  backgroundElement: {
    position: 'absolute',
    zIndex: 1,
  },
  backgroundElement1: {
    top: 140,
    right: 20,
  },
  backgroundElement2: {
    top: 250,
    left: 20,
  },
  gradientCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    opacity: 0.4,
  },
  decorativeSquare: {
    width: 16,
    height: 16,
    borderRadius: 4,
    opacity: 0.5,
    transform: [{ rotate: '45deg' }],
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
    height: '60%',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  statsOverlay: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  statCard: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
  },
  statLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
  },
  imageGlow: {
    position: 'absolute',
    borderRadius: 32,
    zIndex: -1,
  },
  imageGlow1: {
    width: width * 0.9,
    height: height * 0.42,
    opacity: 0.1,
  },
  imageGlow2: {
    width: width * 0.95,
    height: height * 0.44,
    opacity: 0.05,
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
    color: '#FFFFFF',
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