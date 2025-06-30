import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Check } from 'lucide-react-native';

export default function OnboardingStep3() {
  const { colors, theme } = useTheme();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.gradient.background}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.imageContainer}>
            <Image
              source={require('@/assets/images/image copy copy copy.png')}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Begin your journey to mindful commuting</Text>
          </View>
          
          <View style={styles.footer}>
            <View style={styles.progressIndicator}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={[styles.dot, styles.activeDot, { backgroundColor: colors.primary }]} />
            </View>
            
            <TouchableOpacity
              style={[styles.getStartedButton, { shadowColor: colors.shadow }]}
              onPress={() => router.replace('/auth')}
            >
              <LinearGradient
                colors={theme.gradient.primary}
                style={styles.getStartedGradient}
              >
                <Text style={[styles.getStartedText, { color: colors.textInverse }]}>Get Started</Text>
                <Check size={20} color={colors.textInverse} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 28,
    textAlign: 'center',
    lineHeight: 36,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  footer: {
    alignItems: 'center',
  },
  progressIndicator: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Keep this as is for inactive dots
  },
  activeDot: {
    width: 24,
  },
  getStartedButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  getStartedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 8,
  },
  getStartedText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 16,
  },
});