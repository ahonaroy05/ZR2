import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';

interface CloudBackgroundProps {
  children: React.ReactNode;
}

export function CloudBackground({ children }: CloudBackgroundProps) {
  const cloud1X = useSharedValue(-100);
  const cloud2X = useSharedValue(-150);
  const cloud3X = useSharedValue(-200);

  useEffect(() => {
    // Animate clouds moving across the screen
    cloud1X.value = withRepeat(
      withTiming(400, {
        duration: 20000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    cloud2X.value = withRepeat(
      withTiming(400, {
        duration: 25000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    cloud3X.value = withRepeat(
      withTiming(400, {
        duration: 30000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const cloud1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: cloud1X.value }],
  }));

  const cloud2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: cloud2X.value }],
  }));

  const cloud3Style = useAnimatedStyle(() => ({
    transform: [{ translateX: cloud3X.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Cloud shapes */}
      <Animated.View style={[styles.cloud, styles.cloud1, cloud1Style]} />
      <Animated.View style={[styles.cloud, styles.cloud2, cloud2Style]} />
      <Animated.View style={[styles.cloud, styles.cloud3, cloud3Style]} />
      
      {/* Content */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  cloud: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 50,
  },
  cloud1: {
    width: 80,
    height: 40,
    top: 60,
    left: 0,
  },
  cloud2: {
    width: 120,
    height: 60,
    top: 120,
    left: 0,
  },
  cloud3: {
    width: 100,
    height: 50,
    top: 200,
    left: 0,
  },
});