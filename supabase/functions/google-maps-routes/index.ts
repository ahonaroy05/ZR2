import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// TypeScript interfaces for request/response
interface RouteRequest {
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

interface RouteResponse {
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

interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}

// Rate limiting storage (in-memory for this example)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // per minute per IP

// Simple cache storage (in production, use Redis or similar)
const routeCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Utility functions
function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

function isRateLimited(clientIP: string): boolean {
  const now = Date.now();
  const clientData = rateLimitStore.get(clientIP);
  
  if (!clientData || now > clientData.resetTime) {
    // Reset or initialize rate limit
    rateLimitStore.set(clientIP, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return false;
  }
  
  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }
  
  clientData.count++;
  return false;
}

function generateCacheKey(request: RouteRequest): string {
  const key = JSON.stringify({
    origin: request.origin,
    destination: request.destination,
    waypoints: request.waypoints,
    options: request.options
  });
  return btoa(key).replace(/[^a-zA-Z0-9]/g, '');
}

function getCachedRoute(cacheKey: string): any | null {
  const cached = routeCache.get(cacheKey);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL) {
    routeCache.delete(cacheKey);
    return null;
  }
  
  return cached.data;
}

function setCachedRoute(cacheKey: string, data: any): void {
  routeCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
}

function validateRouteRequest(body: any): { valid: boolean; error?: string } {
  if (!body.origin || !body.destination) {
    return { valid: false, error: 'Origin and destination are required' };
  }
  
  if (typeof body.origin.lat !== 'number' || typeof body.origin.lng !== 'number') {
    return { valid: false, error: 'Origin must have valid lat/lng coordinates' };
  }
  
  if (typeof body.destination.lat !== 'number' || typeof body.destination.lng !== 'number') {
    return { valid: false, error: 'Destination must have valid lat/lng coordinates' };
  }
  
  // Validate coordinate ranges
  if (Math.abs(body.origin.lat) > 90 || Math.abs(body.destination.lat) > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90' };
  }
  
  if (Math.abs(body.origin.lng) > 180 || Math.abs(body.destination.lng) > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180' };
  }
  
  // Validate waypoints if provided
  if (body.waypoints && Array.isArray(body.waypoints)) {
    for (const waypoint of body.waypoints) {
      if (typeof waypoint.lat !== 'number' || typeof waypoint.lng !== 'number') {
        return { valid: false, error: 'All waypoints must have valid lat/lng coordinates' };
      }
      if (Math.abs(waypoint.lat) > 90 || Math.abs(waypoint.lng) > 180) {
        return { valid: false, error: 'Waypoint coordinates out of valid range' };
      }
    }
  }
  
  return { valid: true };
}

async function fetchGoogleMapsRoute(request: RouteRequest): Promise<any> {
  const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }
  
  // Build the Google Maps Directions API URL
  const baseUrl = 'https://maps.googleapis.com/maps/api/directions/json';
  const params = new URLSearchParams({
    origin: `${request.origin.lat},${request.origin.lng}`,
    destination: `${request.destination.lat},${request.destination.lng}`,
    key: apiKey,
  });
  
  // Add optional parameters
  if (request.options) {
    if (request.options.mode) {
      params.append('mode', request.options.mode);
    }
    if (request.options.units) {
      params.append('units', request.options.units);
    }
    if (request.options.alternatives) {
      params.append('alternatives', 'true');
    }
    if (request.options.avoidTolls) {
      params.append('avoid', 'tolls');
    }
    if (request.options.avoidHighways) {
      const avoid = params.get('avoid');
      params.set('avoid', avoid ? `${avoid}|highways` : 'highways');
    }
    if (request.options.avoidFerries) {
      const avoid = params.get('avoid');
      params.set('avoid', avoid ? `${avoid}|ferries` : 'ferries');
    }
    if (request.options.departureTime) {
      // Convert ISO string to Unix timestamp
      const timestamp = Math.floor(new Date(request.options.departureTime).getTime() / 1000);
      params.append('departure_time', timestamp.toString());
    }
  }
  
  // Add waypoints if provided
  if (request.waypoints && request.waypoints.length > 0) {
    const waypointsStr = request.waypoints
      .map(wp => `${wp.lat},${wp.lng}`)
      .join('|');
    params.append('waypoints', waypointsStr);
  }
  
  const url = `${baseUrl}?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google Maps API returned status: ${data.status}. ${data.error_message || ''}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching from Google Maps API:', error);
    throw error;
  }
}

function transformGoogleMapsResponse(googleResponse: any): RouteResponse['data'] {
  return {
    routes: googleResponse.routes.map((route: any) => ({
      summary: route.summary,
      distance: route.legs.reduce((total: any, leg: any) => ({
        text: total.text || leg.distance.text,
        value: total.value + leg.distance.value
      }), { text: '', value: 0 }),
      duration: route.legs.reduce((total: any, leg: any) => ({
        text: total.text || leg.duration.text,
        value: total.value + leg.duration.value
      }), { text: '', value: 0 }),
      durationInTraffic: route.legs.reduce((total: any, leg: any) => {
        if (!leg.duration_in_traffic) return total;
        return {
          text: total.text || leg.duration_in_traffic.text,
          value: total.value + leg.duration_in_traffic.value
        };
      }, { text: '', value: 0 }),
      legs: route.legs.map((leg: any) => ({
        distance: leg.distance,
        duration: leg.duration,
        startAddress: leg.start_address,
        endAddress: leg.end_address,
        steps: leg.steps.map((step: any) => ({
          distance: step.distance,
          duration: step.duration,
          htmlInstructions: step.html_instructions,
          maneuver: step.maneuver,
          startLocation: step.start_location,
          endLocation: step.end_location,
        })),
      })),
      overviewPolyline: route.overview_polyline,
      warnings: route.warnings || [],
      copyrights: route.copyrights,
    })),
    status: googleResponse.status,
  };
}

serve(async (req: Request) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Method not allowed. Use POST.',
        } as ErrorResponse),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Rate limiting
    const clientIP = getClientIP(req);
    if (isRateLimited(clientIP)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
        } as ErrorResponse),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Parse request body
    let body: RouteRequest;
    try {
      body = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid JSON in request body',
        } as ErrorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Validate request
    const validation = validateRouteRequest(body);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: validation.error,
        } as ErrorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Check cache
    const cacheKey = generateCacheKey(body);
    const cachedResult = getCachedRoute(cacheKey);
    
    if (cachedResult) {
      return new Response(
        JSON.stringify({
          success: true,
          data: cachedResult,
          cached: true,
        } as RouteResponse),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Fetch from Google Maps API
    const googleResponse = await fetchGoogleMapsRoute(body);
    const transformedData = transformGoogleMapsResponse(googleResponse);
    
    // Cache the result
    setCachedRoute(cacheKey, transformedData);
    
    // Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        data: transformedData,
        cached: false,
      } as RouteResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
    
  } catch (error) {
    console.error('Edge function error:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      } as ErrorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});