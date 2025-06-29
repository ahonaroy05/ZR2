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

Deno.serve(async (req) => {
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
          error: 'Google Maps API key not configured. Please set up your Google Maps API key in the Supabase dashboard.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    let body: RouteRequest
    try {
      body = await req.json()
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid request body format' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
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

    // Validate coordinates
    if (typeof body.origin.lat !== 'number' || typeof body.origin.lng !== 'number' ||
        typeof body.destination.lat !== 'number' || typeof body.destination.lng !== 'number') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid coordinates format' 
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
        try {
          const timestamp = Math.floor(new Date(body.options.departureTime).getTime() / 1000)
          params.append('departure_time', timestamp.toString())
        } catch (dateError) {
          console.warn('Invalid departure time format:', body.options.departureTime)
        }
      }
    }

    // Add waypoints if provided
    if (body.waypoints && body.waypoints.length > 0) {
      const waypointsStr = body.waypoints
        .map(wp => `${wp.lat},${wp.lng}`)
        .join('|')
      params.append('waypoints', waypointsStr)
    }

    const apiUrl = `${baseUrl}?${params.toString()}`
    console.log('Making request to Google Maps API...')

    // Make request to Google Maps API with timeout and error handling
    let response: Response
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Supabase-Edge-Function/1.0',
        }
      })

      clearTimeout(timeoutId)
    } catch (fetchError) {
      console.error('Network error when calling Google Maps API:', fetchError)
      
      let errorMessage = 'Failed to connect to Google Maps API'
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          errorMessage = 'Request to Google Maps API timed out'
        } else if (fetchError.message.includes('fetch')) {
          errorMessage = 'Network error: Unable to reach Google Maps API. This may be due to network restrictions or API configuration issues.'
        }
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          details: 'Please check your Google Maps API key configuration and ensure the Directions API is enabled.'
        }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!response.ok) {
      console.error('Google Maps API HTTP error:', response.status, response.statusText)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Google Maps API returned HTTP ${response.status}: ${response.statusText}` 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse Google Maps response
    let data: any
    try {
      data = await response.json()
    } catch (jsonError) {
      console.error('Failed to parse Google Maps API response:', jsonError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid response from Google Maps API' 
        }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if Google Maps returned an error
    if (data.status !== 'OK') {
      console.error('Google Maps API status error:', data.status, data.error_message)
      
      let userFriendlyError = 'Failed to get route information'
      switch (data.status) {
        case 'NOT_FOUND':
          userFriendlyError = 'Could not find a route between the specified locations'
          break
        case 'ZERO_RESULTS':
          userFriendlyError = 'No routes found between the specified locations'
          break
        case 'OVER_QUERY_LIMIT':
          userFriendlyError = 'API quota exceeded. Please try again later.'
          break
        case 'REQUEST_DENIED':
          userFriendlyError = 'API access denied. Please check your API key configuration.'
          break
        case 'INVALID_REQUEST':
          userFriendlyError = 'Invalid route request parameters'
          break
        default:
          userFriendlyError = data.error_message || `Google Maps API error: ${data.status}`
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: userFriendlyError,
          status: data.status
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate that we have routes
    if (!data.routes || data.routes.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No routes returned from Google Maps API' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Transform Google Maps response to our format
    const transformedRoutes = data.routes.map((route: any) => ({
      summary: route.summary || 'Route',
      distance: route.legs[0]?.distance || { text: '0 km', value: 0 },
      duration: route.legs[0]?.duration || { text: '0 mins', value: 0 },
      durationInTraffic: route.legs[0]?.duration_in_traffic,
      legs: route.legs?.map((leg: any) => ({
        distance: leg.distance || { text: '0 km', value: 0 },
        duration: leg.duration || { text: '0 mins', value: 0 },
        startAddress: leg.start_address || '',
        endAddress: leg.end_address || '',
        steps: leg.steps?.map((step: any) => ({
          distance: step.distance || { text: '0 m', value: 0 },
          duration: step.duration || { text: '0 mins', value: 0 },
          htmlInstructions: step.html_instructions || '',
          maneuver: step.maneuver,
          startLocation: step.start_location || { lat: 0, lng: 0 },
          endLocation: step.end_location || { lat: 0, lng: 0 },
        })) || [],
      })) || [],
      overviewPolyline: route.overview_polyline || { points: '' },
      warnings: route.warnings || [],
      copyrights: route.copyrights || '',
    }))

    console.log(`Successfully processed ${transformedRoutes.length} routes`)

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
    
    let errorMessage = 'Internal server error'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        details: 'An unexpected error occurred while processing your request'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})