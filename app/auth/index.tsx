import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { Heart, Mail, Lock, User, Play, Info } from 'lucide-react-native';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const { colors, theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { signIn, signUp } = useAuth();

  // Animation values
  const pulseAnim = new Animated.Value(1);
  const tooltipOpacity = new Animated.Value(0);

  useEffect(() => {
    // Pulse animation for demo button
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  const handleAuth = async () => {
    if (!email || !password || (isSignUp && !username)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      let result;
      if (isSignUp) {
        result = await signUp(email, password, username);
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        Alert.alert('Error', result.error.message);
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@example.com');
    setPassword('demo123');
    setUsername('Demo User');
    setIsSignUp(false); // Ensure demo always uses sign-in flow
    
    // Auto-login after a brief delay
    setTimeout(() => {
      handleAuth();
    }, 500);
  };

  const toggleTooltip = () => {
    setShowTooltip(!showTooltip);
    Animated.timing(tooltipOpacity, {
      toValue: showTooltip ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={theme.gradient.background}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={theme.gradient.primary}
                  style={styles.logoGradient}
                >
                  <Heart size={32} color={colors.textInverse} />
                </LinearGradient>
                <View style={styles.rippleContainer}>
                  <Animated.View style={[styles.ripple, styles.ripple1]} />
                  <Animated.View style={[styles.ripple, styles.ripple2]} />
                  <Animated.View style={[styles.ripple, styles.ripple3]} />
                </View>
              </View>
              <Text style={[styles.title, { color: colors.text }]}>ZenRoute</Text>
              <Text style={[styles.tagline, { color: colors.textSecondary }]}>Transform your commute into calm</Text>
            </View>

            <View style={styles.form}>
              <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
                <Mail size={20} color={colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Email"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              {isSignUp && (
                <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
                  <User size={20} color={colors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Username"
                    placeholderTextColor={colors.textSecondary}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoComplete="username"
                  />
                </View>
              )}

              <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
                <Lock size={20} color={colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Password"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                />
              </View>

              <TouchableOpacity
                style={[styles.authButton, { shadowColor: colors.shadow }, loading && styles.authButtonDisabled]}
                onPress={handleAuth}
                disabled={loading}
              >
                <LinearGradient
                  colors={theme.gradient.primary}
                  style={styles.authGradient}
                >
                  <Text style={[styles.authButtonText, { color: colors.textInverse }]}>
                    {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Demo Button */}
              <Animated.View style={[styles.demoContainer, { transform: [{ scale: pulseAnim }] }]}>
                <TouchableOpacity
                  style={[styles.demoButton, { shadowColor: colors.shadow }]}
                  onPress={handleDemoLogin}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={theme.gradient.accent}
                    style={styles.demoGradient}
                  >
                    <Play size={16} color={colors.textInverse} />
                    <Text style={[styles.demoButtonText, { color: colors.textInverse }]}>Try Demo</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.infoButton, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
                  onPress={toggleTooltip}
                >
                  <Info size={16} color={colors.primary} />
                </TouchableOpacity>
              </Animated.View>

              {/* Tooltip */}
              <Animated.View 
                style={[
                  styles.tooltip,
                  { backgroundColor: colors.overlay },
                  { 
                    opacity: tooltipOpacity,
                    transform: [{ 
                      translateY: tooltipOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-10, 0]
                      })
                    }]
                  }
                ]}
                pointerEvents={showTooltip ? 'auto' : 'none'}
              >
                <Text style={[styles.tooltipText, { color: colors.textInverse }]}>
                  Click to instantly access a sample account with pre-populated data
                </Text>
                <View style={styles.tooltipArrow} />
              </Animated.View>

              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => setIsSignUp(!isSignUp)}
              >
                <Text style={[styles.switchText, { color: colors.textSecondary }]}>
                  {isSignUp 
                    ? 'Already have an account? Sign In' 
                    : "Don't have an account? Sign Up"
                  }
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.features, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
              <Text style={[styles.featuresTitle, { color: colors.text }]}>What awaits you:</Text>
              <View style={styles.featuresList}>
                <Text style={[styles.featureItem, { color: colors.textSecondary }]}>🧘 Guided meditation during commutes</Text>
                <Text style={[styles.featureItem, { color: colors.textSecondary }]}>🎵 Calming soundscapes and music</Text>
                <Text style={[styles.featureItem, { color: colors.textSecondary }]}>📊 Track your stress levels</Text>
                <Text style={[styles.featureItem, { color: colors.textSecondary }]}>📝 Mindful journaling</Text>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 2,
  },
  rippleContainer: {
    position: 'absolute',
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(182, 208, 226, 0.3)',
  },
  ripple1: {
    width: 100,
    height: 100,
  },
  ripple2: {
    width: 120,
    height: 120,
  },
  ripple3: {
    width: 140,
    height: 140,
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 32,
    marginBottom: 8,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tagline: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Quicksand-Medium',
    fontSize: 16,
    paddingVertical: 16,
  },
  authButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authButtonText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 16,
  },
  demoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  demoButton: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  demoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  demoButtonText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 16,
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  tooltip: {
    position: 'absolute',
    top: -60,
    left: 0,
    right: 0,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 8,
    zIndex: 1000,
  },
  tooltipText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -6,
    right: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(51, 51, 51, 0.95)',
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  features: {
    borderRadius: 20,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
  },
  featuresTitle: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 18,
    marginBottom: 12,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
});