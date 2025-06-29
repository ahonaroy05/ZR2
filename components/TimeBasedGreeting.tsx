import React, { useState, useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import { getTimeBasedGreeting } from '@/utils/timeGreeting';

interface TimeBasedGreetingProps {
  username?: string;
  style?: any;
  updateInterval?: number; // in milliseconds, default 60000 (1 minute)
}

export function TimeBasedGreeting({ 
  username = 'Friend', 
  style, 
  updateInterval = 60000 
}: TimeBasedGreetingProps) {
  const [greeting, setGreeting] = useState(getTimeBasedGreeting());

  useEffect(() => {
    // Update greeting immediately
    setGreeting(getTimeBasedGreeting());
    
    // Set up interval to update greeting
    const interval = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
    }, updateInterval);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [updateInterval]);

  return (
    <Text style={[styles.greeting, style]}>
      {greeting}{username}
    </Text>
  );
}

const styles = StyleSheet.create({
  greeting: {
    fontFamily: 'Nunito-Bold',
    fontSize: 28,
    color: '#333',
  },
});