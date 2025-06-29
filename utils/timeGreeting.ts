/**
 * Get a time-based greeting message
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
  } else if (hour >= 17 && hour < 22) {
    return 'Good evening, ';
  } else {
    return 'Good night, ';
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