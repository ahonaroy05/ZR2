// Client-side API wrapper for the Google Maps Edge Function

export interface RouteRequest {
  origin: {
    lat: number;
    lng: number;
  };
  destination: {
    lat: number;
    lng: number;
  };
  waypoints?: Array<{
    lat: number;
    lng: number;
    stopover?: boolean;
  }>;
  options?: {
    avoidTolls?: boolean;
    avoidHighways?: boolean;
    avoidFerries?: boolean;
    mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
    units?: 'metric' | 'imperial';
    alternatives?: boolean;
    departureTime?: string; // ISO string for traffic data
  };
}

export interface RouteResponse {
  success: boolean;
  data?: {
    routes: Array<{
      summary: string;
      distance: {
        text: string;
        value: number; // in meters
      };
      duration: {
        text: string;
        value: number; // in seconds
      };
      durationInTraffic?: {
        text: string;
        value: number; // in seconds
      };
      legs: Array<{
        distance: { text: string; value: number };
        duration: { text: string; value: number };
        startAddress: string;
        endAddress: string;
        steps: Array<{
          distance: { text: string; value: number };
          duration: { text: string; value: number };
          htmlInstructions: string;
          maneuver?: string;
          startLocation: { lat: number; lng: number };
          endLocation: { lat: number; lng: number };
        }>;
      }>;
      overviewPolyline: {
        points: string;
      };
      warnings: string[];
      copyrights: string;
    }>;
    status: string;
  };
  error?: string;
  cached?: boolean;
}

export class GoogleMapsApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'GoogleMapsApiError';
  }
}

export class GoogleMapsApi {
  private baseUrl: string;

  constructor() {
    // Use the Supabase Edge Function URL
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      console.warn('EXPO_PUBLIC_SUPABASE_URL environment variable is not set');
      // Use a fallback URL for development
      this.baseUrl = 'http://localhost:54321/functions/v1/google-maps-routes';
    } else {
      this.baseUrl = `${supabaseUrl}/functions/v1/google-maps-routes`;
    }
  }

  async getRoutes(request: RouteRequest): Promise<RouteResponse> {
    try {
      const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      if (!anonKey) {
        console.warn('EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable is not set');
        // For development, we can proceed without the anon key
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (anonKey) {
        headers['Authorization'] = `Bearer ${anonKey}`;
      }

      // Add timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch {
          // If we can't parse the error response, use the default message
        }
        
        throw new GoogleMapsApiError(
          errorMessage,
          'HTTP_ERROR',
          response.status
        );
      }

      const data: RouteResponse = await response.json();

      if (!data.success) {
        throw new GoogleMapsApiError(
          data.error || 'Route request failed',
          'ROUTE_ERROR',
          response.status
        );
      }

      return data;
    } catch (error) {
      if (error instanceof GoogleMapsApiError) {
        throw error;
      }

      // Network or other errors
      let errorMessage = 'Unknown error occurred';
      let errorCode = 'UNKNOWN_ERROR';
      
      if (error instanceof Error && error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please check your internet connection and try again.';
        errorCode = 'TIMEOUT_ERROR';
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection.';
        errorCode = 'NETWORK_ERROR';
      } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = 'Connection failed: Unable to reach the route service. This may be due to network restrictions or server configuration issues.';
        errorCode = 'CONNECTION_ERROR';
      } else if (error instanceof Error) {
        errorMessage = error.message;
        errorCode = 'NETWORK_ERROR';
      }
      
      throw new GoogleMapsApiError(
        errorMessage,
        errorCode
      );
    }
  }

  // Convenience method for simple route requests
  async getSimpleRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    options?: RouteRequest['options']
  ): Promise<RouteResponse> {
    return this.getRoutes({
      origin,
      destination,
      options,
    });
  }

  // Method to get multiple route alternatives
  async getRouteAlternatives(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    options?: Omit<RouteRequest['options'], 'alternatives'>
  ): Promise<RouteResponse> {
    return this.getRoutes({
      origin,
      destination,
      options: {
        ...options,
        alternatives: true,
      },
    });
  }

  // Method to get route with traffic data
  async getRouteWithTraffic(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    departureTime?: Date,
    options?: Omit<RouteRequest['options'], 'departureTime'>
  ): Promise<RouteResponse> {
    return this.getRoutes({
      origin,
      destination,
      options: {
        ...options,
        departureTime: departureTime?.toISOString() || new Date().toISOString(),
      },
    });
  }

  // Utility method to calculate stress-optimized routes
  async getStressOptimizedRoutes(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<RouteResponse> {
    return this.getRoutes({
      origin,
      destination,
      options: {
        alternatives: true,
        avoidHighways: false, // We'll analyze all options
        avoidTolls: false,
        mode: 'driving',
        units: 'metric',
        departureTime: new Date().toISOString(),
      },
    });
  }
}

// Export a singleton instance
export const googleMapsApi = new GoogleMapsApi();

// Utility functions for route analysis
export function analyzeRouteStressLevel(route: RouteResponse['data']['routes'][0]): {
  stressLevel: 'low' | 'medium' | 'high';
  factors: string[];
} {
  const factors: string[] = [];
  let stressScore = 0;

  // Analyze duration vs distance (traffic indicator)
  const avgSpeed = route.distance.value / route.duration.value; // meters per second
  const avgSpeedKmh = avgSpeed * 3.6;

  if (avgSpeedKmh < 20) {
    stressScore += 2;
    factors.push('Heavy traffic conditions');
  } else if (avgSpeedKmh < 40) {
    stressScore += 1;
    factors.push('Moderate traffic');
  }

  // Check for traffic delays
  if (route.durationInTraffic && route.durationInTraffic.value > route.duration.value * 1.3) {
    stressScore += 2;
    factors.push('Significant traffic delays');
  }

  // Analyze route complexity (number of turns/steps)
  const totalSteps = route.legs.reduce((sum, leg) => sum + leg.steps.length, 0);
  const stepsPerKm = totalSteps / (route.distance.value / 1000);

  if (stepsPerKm > 10) {
    stressScore += 1;
    factors.push('Complex route with many turns');
  }

  // Check warnings
  if (route.warnings.length > 0) {
    stressScore += 1;
    factors.push('Route has warnings');
  }

  // Determine stress level
  let stressLevel: 'low' | 'medium' | 'high';
  if (stressScore >= 4) {
    stressLevel = 'high';
  } else if (stressScore >= 2) {
    stressLevel = 'medium';
  } else {
    stressLevel = 'low';
  }

  return { stressLevel, factors };
}

export function recommendTherapyType(stressLevel: 'low' | 'medium' | 'high'): string {
  switch (stressLevel) {
    case 'low':
      return 'Nature Sounds';
    case 'medium':
      return 'Breathing Exercise';
    case 'high':
      return 'Guided Meditation';
    default:
      return 'Mindful Music';
  }
}