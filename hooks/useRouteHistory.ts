import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getRouteHistory, 
  addRouteHistory, 
  getFavoriteRoutes, 
  RouteHistory 
} from '@/lib/database';

export function useRouteHistory() {
  const { user, isDemoMode } = useAuth();
  const [routes, setRoutes] = useState<RouteHistory[]>([]);
  const [favoriteRoutes, setFavoriteRoutes] = useState<RouteHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRouteHistory = useCallback(async () => {
    if (!user) return;

    // In demo mode, start with empty routes
    if (isDemoMode) {
      setRoutes([]);
      setFavoriteRoutes([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [historyResult, favoritesResult] = await Promise.all([
        getRouteHistory(user.id),
        getFavoriteRoutes(user.id),
      ]);

      if (historyResult.error) throw historyResult.error;
      if (favoritesResult.error) throw favoritesResult.error;

      setRoutes(historyResult.data || []);
      setFavoriteRoutes(favoritesResult.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load route history');
    } finally {
      setLoading(false);
    }
  }, [user, isDemoMode]);

  const saveRoute = useCallback(async (routeData: Omit<RouteHistory, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: 'User not authenticated' };

    // In demo mode, just add to local state
    if (isDemoMode) {
      const mockRoute: RouteHistory = {
        id: `demo-route-${Date.now()}`,
        user_id: user.id,
        ...routeData,
        created_at: new Date().toISOString(),
      };
      setRoutes(prev => [mockRoute, ...prev]);
      
      // Add to favorites if rating is high
      if (routeData.rating && routeData.rating >= 4) {
        setFavoriteRoutes(prev => [mockRoute, ...prev]);
      }
      
      return { data: mockRoute, error: null };
    }

    try {
      const { data, error } = await addRouteHistory({
        user_id: user.id,
        ...routeData,
      });

      if (error) throw error;

      if (data) {
        setRoutes(prev => [data, ...prev]);
        
        // Add to favorites if rating is high
        if (data.rating && data.rating >= 4) {
          setFavoriteRoutes(prev => [data, ...prev]);
        }
      }

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save route';
      setError(errorMessage);
      return { error: errorMessage };
    }
  }, [user, isDemoMode]);

  const getRoutesByTransportMode = useCallback((mode: RouteHistory['transport_mode']) => {
    return routes.filter(route => route.transport_mode === mode);
  }, [routes]);

  const getAverageStressReduction = useCallback(() => {
    const routesWithStressData = routes.filter(
      route => route.stress_level_before !== undefined && route.stress_level_after !== undefined
    );

    if (routesWithStressData.length === 0) return null;

    const totalReduction = routesWithStressData.reduce((sum, route) => {
      const reduction = ((route.stress_level_before! - route.stress_level_after!) / route.stress_level_before!) * 100;
      return sum + reduction;
    }, 0);

    return Math.round(totalReduction / routesWithStressData.length);
  }, [routes]);

  const getMostUsedTherapy = useCallback(() => {
    const therapyCount = routes.reduce((acc, route) => {
      if (route.therapy_used) {
        acc[route.therapy_used] = (acc[route.therapy_used] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const mostUsed = Object.entries(therapyCount).sort(([,a], [,b]) => b - a)[0];
    return mostUsed ? mostUsed[0] : null;
  }, [routes]);

  const getRouteStats = useCallback(() => {
    const totalRoutes = routes.length;
    const totalDistance = routes.reduce((sum, route) => sum + route.distance_meters, 0);
    const totalDuration = routes.reduce((sum, route) => sum + route.duration_seconds, 0);
    const averageRating = routes.filter(r => r.rating).reduce((sum, route) => sum + (route.rating || 0), 0) / routes.filter(r => r.rating).length;

    return {
      totalRoutes,
      totalDistance: Math.round(totalDistance / 1000), // Convert to km
      totalDuration: Math.round(totalDuration / 60), // Convert to minutes
      averageRating: Math.round(averageRating * 10) / 10 || 0,
      averageStressReduction: getAverageStressReduction(),
      mostUsedTherapy: getMostUsedTherapy(),
    };
  }, [routes, getAverageStressReduction, getMostUsedTherapy]);

  useEffect(() => {
    loadRouteHistory();
  }, [loadRouteHistory]);

  return {
    routes,
    favoriteRoutes,
    loading,
    error,
    saveRoute,
    getRoutesByTransportMode,
    getRouteStats,
    refreshRouteHistory: loadRouteHistory,
  };
}