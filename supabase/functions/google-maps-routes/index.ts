import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

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
    departureTime?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Google Maps API key from environment
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY environment variable is not set')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Google Maps API key not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const body: RouteRequest = await req.json()
    
    // Validate required fields
    if (!body.origin || !body.destination) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Origin and destination are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Build Google Maps Directions API URL
    const baseUrl = 'https://maps.googleapis.com/maps/api/directions/json'
    const params = new URLSearchParams({
      origin: `${body.origin.lat},${body.origin.lng}`,
      destination: `${body.destination.lat},${body.destination.lng}`,
      key: apiKey,
    })

    // Add optional parameters
    if (body.options) {
      if (body.options.mode) params.append('mode', body.options.mode)
      if (body.options.units) params.append('units', body.options.units)
      if (body.options.alternatives) params.append('alternatives', 'true')
      if (body.options.avoidTolls) params.append('avoid', 'tolls')
      if (body.options.avoidHighways) params.append('avoid', 'highways')
      if (body.options.avoidFerries) params.append('avoid', 'ferries')
      if (body.options.departureTime) {
        params.append('departure_time', Math.floor(new Date(body.options.departureTime).getTime() / 1000).toString())
      }
    }

    // Add waypoints if provided
    if (body.waypoints && body.waypoints.length > 0) {
      const waypointsStr = body.waypoints
        .map(wp => `${wp.lat},${wp.lng}`)
        .join('|')
      params.append('waypoints', waypointsStr)
    }

    // Make request to Google Maps API
    const response = await fetch(`${baseUrl}?${params.toString()}`)
    const data = await response.json()

    if (!response.ok) {
      console.error('Google Maps API error:', data)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch routes from Google Maps API' 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if Google Maps returned an error
    if (data.status !== 'OK') {
      console.error('Google Maps API status error:', data.status, data.error_message)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.error_message || `Google Maps API error: ${data.status}` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Transform Google Maps response to our format
    const transformedRoutes = data.routes.map((route: any) => ({
      summary: route.summary,
      distance: route.legs[0].distance,
      duration: route.legs[0].duration,
      durationInTraffic: route.legs[0].duration_in_traffic,
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
    }))

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          routes: transformedRoutes,
          status: data.status,
        },
        cached: false,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})