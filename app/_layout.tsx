import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, StyleSheet } from 'react-native';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import {
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
} from '@expo-google-fonts/quicksand';
import { ZenRouteLogo } from '@/components/ZenRouteLogo';
import * as SplashScreen from 'expo-splash-screen';

// Prevent splash screen from auto-hiding
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

function RootLayoutContent() {
  const { isDarkMode } = useTheme();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={isDarkMode ? "light" : "dark"} backgroundColor={isDarkMode ? "#0F1419" : "#F8FBFF"} />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Nunito-Regular': Nunito_400Regular,
    'Nunito-SemiBold': Nunito_600SemiBold,
    'Nunito-Bold': Nunito_700Bold,
    'Quicksand-Regular': Quicksand_400Regular,
    'Quicksand-Medium': Quicksand_500Medium,
    'Quicksand-SemiBold': Quicksand_600SemiBold,
  });

  useEffect(() => {
    if ((fontsLoaded || fontError) && Platform.OS !== 'web') {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Show a custom loading screen while fonts are loading
  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ZenRouteLogo size={120} animated={false} />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        {!fontsLoaded && !fontError && Platform.OS !== 'web' ? null : <RootLayoutContent />}
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FDF7FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
