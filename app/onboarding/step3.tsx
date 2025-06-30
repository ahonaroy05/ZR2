import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Check, ArrowLeft, Sparkles } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  useAnimatedStyle,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function OnboardingStep3() {
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
  const sparkleRotation = useSharedValue(0);
  const celebrationScale = useSharedValue(0);

  useEffect(() => {
    // Orchestrated animation sequence
    fadeAnim.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    
    backButtonOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    
    imageOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
    imageScale.value = withDelay(400, withSpring(1, { damping: 15, stiffness: 100 }));
    
    textOpacity.value = withDelay(800, withTiming(1, { duration: 800 }));
    textTranslateY.value = withDelay(800, withSpring(0, { damping: 15, stiffness: 100 }));
    
    progressScale.value = withDelay(1200, withSpring(1, { damping: 12, stiffness: 150 }));
    
    buttonOpacity.value = withDelay(1400, withTiming(1, { duration: 600 }));
    buttonScale.value = withDelay(1400, withSpring(1, { damping: 15, stiffness: 100 }));
    
    // Celebration animations
    celebrationScale.value = withDelay(1600, withSpring(1, { damping: 10, stiffness: 100 }));
    
    // Continuous sparkle rotation
    sparkleRotation.value = withDelay(1800, 
      withRepeat(
        withTiming(360, { duration: 4000, easing: Easing.linear }),
        -1,
        false
      )
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

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotation.value}deg` }],
  }));

  const celebrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
    opacity: celebrationScale.value,
  }));

  const handleGetStarted = () => {
    router.replace('/auth');
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

          {/* Celebration Elements */}
          <Animated.View style={[styles.sparkleContainer, styles.sparkle1, sparkleStyle]}>
            <Sparkles size={16} color={colors.accent} />
          </Animated.View>
          <Animated.View style={[styles.sparkleContainer, styles.sparkle2, sparkleStyle]}>
            <Sparkles size={12} color={colors.primary} />
          </Animated.View>
          <Animated.View style={[styles.sparkleContainer, styles.sparkle3, sparkleStyle]}>
            <Sparkles size={20} color={colors.success} />
          </Animated.View>

          {/* Success Badge */}
          <Animated.View style={[styles.successBadge, celebrationStyle]}>
            <LinearGradient
              colors={[colors.success, colors.primary]}
              style={styles.successGradient}
            >
              <Check size={24} color={colors.textInverse} strokeWidth={3} />
            </LinearGradient>
          </Animated.View>

          {/* Image Container */}
          <Animated.View style={[styles.imageContainer, imageStyle]}>
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: 'https://images.pexels.com/photos/3771837/pexels-photo-3771837.jpeg' }}
                style={styles.image}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)']}
                style={styles.imageOverlay}
              />
              
            </View>
            
            {/* Enhanced Glow Effects */}
            <View style={[styles.imageGlow, styles.imageGlow1, { backgroundColor: colors.success }]} />
            <View style={[styles.imageGlow, styles.imageGlow2, { backgroundColor: colors.primary }]} />
            <View style={[styles.imageGlow, styles.imageGlow3, { backgroundColor: colors.accent }]} />
          </Animated.View>
          
          {/* Text Container */}
          <Animated.View style={[styles.textContainer, textStyle]}>
            <Text style={[styles.title, { color: colors.text }]}>Begin your journey to mindful commuting</Text>
            <Text style={[styles.description, { color: colors.text }]}>
              You're all set! Start transforming your daily commute into moments of peace and mindfulness
            </Text>
          </Animated.View>
          
          {/* Footer */}
          <View style={styles.footer}>
            {/* Progress Indicator */}
            <Animated.View style={[styles.progressIndicator, progressStyle]}>
              <View style={[styles.dot, { backgroundColor: colors.border }]} />
              <View style={[styles.dot, { backgroundColor: colors.border }]} />
              <LinearGradient
                colors={[colors.success, colors.primary]}
                style={[styles.dot, styles.activeDot]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
            
            {/* Get Started Button */}
            <Animated.View style={buttonStyle}>
              <TouchableOpacity
                style={[styles.getStartedButton, { shadowColor: colors.shadow }]}
                onPress={() => handleButtonPress(handleGetStarted)}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[colors.success, colors.primary]}
                  style={styles.getStartedGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={[styles.getStartedText, { color: colors.textInverse }]}>Start Your Journey</Text>
                  <Check size={20} color={colors.textInverse} strokeWidth={2.5} />
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
  sparkleContainer: {
    position: 'absolute',
    zIndex: 5,
  },
  sparkle1: {
    top: 120,
    right: 40,
  },
  sparkle2: {
    top: 180,
    left: 30,
  },
  sparkle3: {
    top: 240,
    right: 60,
  },
  successBadge: {
    position: 'absolute',
    top: 140,
    alignSelf: 'center',
    zIndex: 10,
  },
  successGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
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
    borderRadius: 32,
    zIndex: -1,
  },
  imageGlow1: {
    width: width * 0.9,
    height: height * 0.42,
    opacity: 0.15,
  },
  imageGlow2: {
    width: width * 0.95,
    height: height * 0.44,
    opacity: 0.1,
  },
  imageGlow3: {
    width: width * 1.0,
    height: height * 0.46,
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
    marginBottom: 16,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
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
  getStartedButton: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  getStartedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 18,
    gap: 8,
  },
  getStartedText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
});