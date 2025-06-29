import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';

export default function OnboardingStep3() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8FBFF', '#E6F3FF', '#B6D0E2']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg' }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>Begin your journey to mindful commuting</Text>
          </View>
          
          <View style={styles.footer}>
            <View style={styles.progressIndicator}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={[styles.dot, styles.activeDot]} />
            </View>
            
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={() => router.replace('/auth')}
            >
              <LinearGradient
                colors={['#B6D0E2', '#87CEEB']}
                style={styles.getStartedGradient}
              >
                <Text style={styles.getStartedText}>Get Started</Text>
                <Check size={20} color="#FFFFFF" />
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
    color: '#333',
    textAlign: 'center',
    lineHeight: 36,
    textShadowColor: 'rgba(255, 255, 255, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  activeDot: {
    backgroundColor: '#B6D0E2',
    width: 24,
  },
  getStartedButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#B6D0E2',
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
    color: '#FFFFFF',
  },
});