import { useState, useCallback } from 'react';
import { 
  googleMapsApi, 
  RouteRequest, 
  RouteResponse, 
  GoogleMapsApiError,
  analyzeRouteStressLevel,
  recommendTherapyType
} from '@/lib/googleMapsApi';

export interface EnhancedRoute {
  id: string;
  name: string;
  summary: string;
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  durationInTraffic?: { text: string; value: number };
  stressLevel: 'low' | 'medium' | 'high';
  stressFactors: string[];
  therapyType: string;
  color: string;
  traffic: string;
  legs: RouteResponse['data']['routes'][0]['legs'];
  overviewPolyline: { points: string };
  warnings: string[];
}

export interface RouteState {
  routes: EnhancedRoute[];
  loading: boolean;
  error: string | null;
  cached: boolean;
}

const STRESS_COLORS = {
  low: '#A8E6CF',
  medium: '#FFD3A5', 
  high: '#FFB3BA'
};

const TRAFFIC_LEVELS = {
  low: 'Light',
  medium: 'Moderate',
  high: 'Heavy'
};

export function useGoogleMapsRoutes() {
  const [state, setState] = useState<RouteState>({
    routes: [],
    loading: false,
    error: null,
    cached: false,
  });

  const getRoutes = useCallback(async (request: RouteRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await googleMapsApi.getRoutes(request);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to get routes');
      }

      // Transform and enhance routes
      const enhancedRoutes: EnhancedRoute[] = response.data.routes.map((route, index) => {
        const analysis = analyzeRouteStressLevel(route);
        const therapyType = recommendTherapyType(analysis.stressLevel);
        
        // Determine traffic level based on duration vs traffic duration
        let trafficLevel: 'low' | 'medium' | 'high' = 'low';
        if (route.durationInTraffic) {
          const trafficRatio = route.durationInTraffic.value / route.duration.value;
          if (trafficRatio > 1.5) {
            trafficLevel = 'high';
          } else if (trafficRatio > 1.2) {
            trafficLevel = 'medium';
          }
        }

        return {
          id: `route-${index}`,
          name: route.summary || `Route ${index + 1}`,
          summary: route.summary,
          distance: route.distance,
          duration: route.duration,
          durationInTraffic: route.durationInTraffic,
          stressLevel: analysis.stressLevel,
          stressFactors: analysis.factors,
          therapyType,
          color: STRESS_COLORS[analysis.stressLevel],
          traffic: TRAFFIC_LEVELS[trafficLevel],
          legs: route.legs,
          overviewPolyline: route.overviewPolyline,
          warnings: route.warnings,
        };
      });

      setState({
        routes: enhancedRoutes,
        loading: false,
        error: null,
        cached: response.cached || false,
      });

      return enhancedRoutes;
    } catch (error) {
      let errorMessage = 'Failed to fetch routes';
      
      if (error instanceof GoogleMapsApiError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes('fetch')) {
          errorMessage = 'Unable to connect to the route service. Please check your internet connection.';
        } else if (error.message.includes('EXPO_PUBLIC_SUPABASE_URL')) {
          errorMessage = 'Route service is not configured. Please contact support.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      throw error;
    }
  }, []);

  const getSimpleRoute = useCallback(async (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    options?: RouteRequest['options']
  ) => {
    return getRoutes({ origin, destination, options });
  }, [getRoutes]);

  const getStressOptimizedRoutes = useCallback(async (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ) => {
    return getRoutes({
      origin,
      destination,
      options: {
        alternatives: true,
        avoidHighways: false,
        avoidTolls: false,
        mode: 'driving',
        units: 'metric',
        departureTime: new Date().toISOString(),
      },
    });
  }, [getRoutes]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearRoutes = useCallback(() => {
    setState({
      routes: [],
      loading: false,
      error: null,
      cached: false,
    });
  }, []);

  return {
    ...state,
    getRoutes,
    getSimpleRoute,
    getStressOptimizedRoutes,
    clearError,
    clearRoutes,
  };
}