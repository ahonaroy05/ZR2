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
import { supabase } from '@/lib/supabase';
import { ZenRouteLogo } from '@/components/ZenRouteLogo';
import { router } from 'expo-router';
import { Mail, Lock, User, Play, Info, CircleAlert as AlertCircle } from 'lucide-react-native';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const { colors, theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { signIn, signUp, isDemoMode } = useAuth();

  // Animation values
  const pulseAnim = new Animated.Value(1);
  const tooltipOpacity = new Animated.Value(0);
  const errorOpacity = new Animated.Value(0);

  // Check if Supabase is properly configured
  const isSupabaseConfigured = () => {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    return url && key && 
           url !== 'https://placeholder.supabase.co' && 
           key !== 'placeholder-anon-key';
  };

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

  // Show error message with animation
  const showError = (message: string) => {
    setErrorMessage(message);
    Animated.timing(errorOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto-hide error after 5 seconds
    setTimeout(() => {
      hideError();
    }, 5000);
  };

  // Hide error message with animation
  const hideError = () => {
    Animated.timing(errorOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setErrorMessage('');
    });
  };

  const handleAuth = async () => {
    // Clear any existing errors
    hideError();

    if (!email || !password || (isSignUp && !username)) {
      showError('Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Please enter a valid email address');
      return;
    }

    // Password validation for sign up
    if (isSignUp && password.length < 6) {
      showError('Password must be at least 6 characters long');
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
        // Provide clearer error messages for authentication failures
        let userFriendlyMessage = result.error.message;
        
        // Handle specific error cases with user-friendly messages
        if (result.error.message.includes('Invalid login credentials') || 
            result.error.message.includes('invalid_credentials') ||
            result.error.message.includes('Invalid email or password') ||
            result.error.message.includes('wrong password') ||
            result.error.message.includes('incorrect password')) {
          if (!isSupabaseConfigured()) {
            userFriendlyMessage = 'Supabase is not configured. Click "Try Demo" to explore the app with sample data.';
          } else {
            userFriendlyMessage = 'Invalid password';
          }
        } else if (result.error.message.includes('Email not confirmed')) {
          userFriendlyMessage = 'Please check your email and confirm your account before signing in.';
        } else if (result.error.message.includes('User not found') ||
                   result.error.message.includes('user_not_found')) {
          userFriendlyMessage = 'No account found with this email address. Please check your email or sign up.';
        } else if (result.error.message.includes('Too many requests') ||
                   result.error.message.includes('rate_limit')) {
          userFriendlyMessage = 'Too many login attempts. Please wait a moment and try again.';
        } else if (result.error.message.includes('Email already registered') ||
                   result.error.message.includes('already_registered')) {
          userFriendlyMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (result.error.message.includes('Weak password') ||
                   result.error.message.includes('weak_password')) {
          userFriendlyMessage = 'Password is too weak. Please choose a stronger password.';
        } else if (result.error.message.includes('signup_disabled')) {
          userFriendlyMessage = 'New account registration is currently disabled. Please contact support.';
        } else if (result.error.message.includes('Supabase is not configured')) {
          userFriendlyMessage = result.error.message;
        }
        
        showError(userFriendlyMessage);
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      if (!isSupabaseConfigured()) {
        showError('Supabase is not configured. Click "Try Demo" to explore the app with sample data.');
      } else {
        showError('Unable to connect to the server. Please check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    // Clear any existing errors
    hideError();
    setLoading(true);
    
    try {
      const result = await signIn('demo@example.com', 'demo123');
      if (result.error) {
        showError('Unable to start demo mode. Please try again.');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      showError('An unexpected error occurred while starting demo mode.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!isSupabaseConfigured()) {
      showError('Password reset is not available in demo mode. Supabase configuration is required.');
      return;
    }

    if (!email.trim()) {
      showError('Please enter your email address first, then tap "Forgot Password?" to reset your password.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Please enter a valid email address');
      return;
    }

    setForgotPasswordLoading(true);
    hideError();
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://your-app-domain.com/reset-password', // You can customize this URL
      });

      if (error) {
        let errorMessage = error.message;
        
        if (error.message.includes('User not found') || error.message.includes('invalid_credentials')) {
          errorMessage = 'No account found with this email address. Please check the email and try again.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many password reset requests. Please wait a moment before trying again.';
        }
        
        showError(errorMessage);
      } else {
        Alert.alert(
          'Password Reset Email Sent',
          `We've sent a password reset link to ${email}. Please check your email and follow the instructions to reset your password.`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      showError('Unable to send password reset email. Please check your internet connection and try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
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
                <ZenRouteLogo size={80} animated={true} />
                <View style={styles.rippleContainer}>
                  <Animated.View style={[styles.ripple, styles.ripple1]} />
                  <Animated.View style={[styles.ripple, styles.ripple2]} />
                  <Animated.View style={[styles.ripple, styles.ripple3]} />
                </View>
              </View>
              <Text style={[styles.title, { color: colors.text }]}>ZenRoute</Text>
              <Text style={[styles.tagline, { color: colors.textSecondary }]}>Transform your commute into calm</Text>
            </View>

            {/* Configuration Notice */}
            {!isSupabaseConfigured() && (
              <View style={[styles.configNotice, { backgroundColor: colors.warning, borderColor: colors.border }]}>
                <Info size={16} color={colors.text} />
                <Text style={[styles.configNoticeText, { color: colors.text }]}>
                  Demo mode available - Supabase not configured
                </Text>
              </View>
            )}

            {/* Error Message */}
            {errorMessage !== '' && (
              <Animated.View 
                style={[
                  styles.errorContainer,
                  { backgroundColor: colors.error, shadowColor: colors.shadow },
                  { opacity: errorOpacity }
                ]}
              >
                <AlertCircle size={16} color={colors.textInverse} />
                <Text style={[styles.errorText, { color: colors.textInverse }]}>
                  {errorMessage}
                </Text>
                <TouchableOpacity onPress={hideError} style={styles.errorCloseButton}>
                  <Text style={[styles.errorCloseText, { color: colors.textInverse }]}>×</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            <View style={styles.form}>
              <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
                <Mail size={20} color={colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Email"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errorMessage) hideError(); // Clear error when user starts typing
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
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
                    onChangeText={(text) => {
                      setUsername(text);
                      if (errorMessage) hideError();
                    }}
                    autoCapitalize="none"
                    autoComplete="username"
                    autoCorrect={false}
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
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) hideError();
                  }}
                  secureTextEntry
                  autoComplete="password"
                  autoCorrect={false}
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

              {/* Forgot Password Link - Only show during sign in and when Supabase is configured */}
              {!isSignUp && isSupabaseConfigured() && (
                <TouchableOpacity
                  style={styles.forgotPasswordButton}
                  onPress={handleForgotPassword}
                  disabled={forgotPasswordLoading}
                >
                  <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                    {forgotPasswordLoading ? 'Sending...' : 'Forgot Password?'}
                  </Text>
                </TouchableOpacity>
              )}

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
                onPress={() => {
                  setIsSignUp(!isSignUp);
                  hideError(); // Clear any errors when switching modes
                }}
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
    marginBottom: 32,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
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
  configNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  configNoticeText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    marginLeft: 8,
    lineHeight: 18,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    marginBottom: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  errorText: {
    flex: 1,
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    marginLeft: 8,
    lineHeight: 18,
  },
  errorCloseButton: {
    padding: 4,
    marginLeft: 8,
  },
  errorCloseText: {
    fontSize: 18,
    fontWeight: 'bold',
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
  forgotPasswordButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    textDecorationLine: 'underline',
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