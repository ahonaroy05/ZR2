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
      console.error('Error fetching routes:', error);
      
      // Check if this is a configuration or network error that should show demo data
      const shouldShowDemo = error instanceof Error && (
        error.message.includes('not configured') ||
        error.message.includes('environment variable') ||
        error.message.includes('Network error') ||
        error.message.includes('Connection failed') ||
        error.message.includes('timed out')
      );
      
      if (shouldShowDemo) {
        console.log('Loading demo routes due to configuration/network issues');
        const demoRoutes = getDemoRoutes();
        setState(prev => ({ 
          ...prev, 
          routes: demoRoutes, 
          loading: false,
          error: null 
        }));
        return;
      }
      
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
      
      // Re-throw the error so the UI can handle it
      throw error;
    }
  }, []);

  // Demo routes for development/fallback
  const getDemoRoutes = () => {
    return [
      {
        id: 'demo-route-1',
        name: 'Scenic Route',
        summary: 'Via Park Avenue',
        distance: { text: '5.2 km', value: 5200 },
        duration: { text: '12 mins', value: 720 },
        durationInTraffic: { text: '15 mins', value: 900 },
        stressLevel: 'low' as const,
        stressFactors: ['Light traffic', 'Scenic views'],
        therapyType: 'Nature Sounds',
        color: '#A8E6CF',
        traffic: 'Light',
        legs: [],
        overviewPolyline: { points: 'demo_polyline_1' },
        warnings: [],
      },
      {
        id: 'demo-route-2',
        name: 'Express Route',
        summary: 'Via Highway 101',
        distance: { text: '4.8 km', value: 4800 },
        duration: { text: '8 mins', value: 480 },
        durationInTraffic: { text: '18 mins', value: 1080 },
        stressLevel: 'high' as const,
        stressFactors: ['Heavy traffic', 'Construction zones'],
        therapyType: 'Guided Meditation',
        color: '#FFB3BA',
        traffic: 'Heavy',
        legs: [],
        overviewPolyline: { points: 'demo_polyline_2' },
        warnings: ['Construction ahead'],
      },
      {
        id: 'demo-route-3',
        name: 'Balanced Route',
        summary: 'Via Main Street',
        distance: { text: '5.0 km', value: 5000 },
        duration: { text: '10 mins', value: 600 },
        durationInTraffic: { text: '13 mins', value: 780 },
        stressLevel: 'medium' as const,
        stressFactors: ['Moderate traffic', 'Some intersections'],
        therapyType: 'Breathing Exercise',
        color: '#FFD93D',
        traffic: 'Moderate',
        legs: [],
        overviewPolyline: { points: 'demo_polyline_3' },
        warnings: [],
      },
    ];
  };

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