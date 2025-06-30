import React from 'react';

/**
 * Get a time-based greeting message that updates automatically
 * @param date Optional date to use for greeting (defaults to current time)
 * @returns Greeting string with comma and space
 */
export function getTimeBasedGreeting(date?: Date): string {
  const now = date || new Date();
  const hour = now.getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'Good morning, ';
  } else if (hour >= 12 && hour < 17) {
    return 'Good afternoon, ';
  } else {
    // Use "Good evening" for all hours from 5:00 PM onwards (17:00) and through the night
    return 'Good evening, ';
  }
}

/**
 * Get greeting for current time
 * @returns Current time-based greeting
 */
export function getCurrentGreeting(): string {
  return getTimeBasedGreeting();
}

/**
 * Get greeting for a specific time
 * @param date Date object to get greeting for
 * @returns Time-based greeting for the specified date
 */
export function getGreetingForTime(date: Date): string {
  return getTimeBasedGreeting(date);
}

/**
 * Hook to get real-time greeting that updates automatically
 * @param updateInterval Update interval in milliseconds (default: 60000 = 1 minute)
 * @returns Current greeting that updates in real-time
 */
export function useRealTimeGreeting(updateInterval: number = 60000): string {
  const [greeting, setGreeting] = React.useState(getTimeBasedGreeting());
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
    }, updateInterval);
    
    return () => clearInterval(interval);
  }, [updateInterval]);
  
  return greeting;
}