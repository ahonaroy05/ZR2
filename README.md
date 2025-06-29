# ZenRoute - Mindful Commuting App

A React Native Expo app that transforms your daily commute into a mindful, stress-reducing experience using intelligent route optimization and wellness features.

## Features

- **Smart Route Analysis**: AI-powered route optimization that considers traffic, complexity, and stress factors
- **Google Maps Integration**: Real-time route data with traffic information
- **Stress Tracking**: Monitor and track your stress levels throughout your journey
- **Mindful Breathing**: Guided breathing exercises during commutes
- **Meditation Sessions**: Curated meditation content for different route types
- **Journal Integration**: Reflect on your commuting experiences
- **Soundscape Mixer**: Calming audio environments for your journey

## Google Maps Edge Function Setup

### Prerequisites

1. **Google Maps API Key**: You need a Google Maps API key with the following APIs enabled:
   - Directions API
   - Maps JavaScript API (optional, for map display)

2. **Supabase Project**: The app uses Supabase Edge Functions for secure API key handling

### Environment Variables

Add your Google Maps API key to your Supabase Edge Function environment:

```bash
# In your Supabase project dashboard, go to Edge Functions settings
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Edge Function Deployment

The Google Maps integration is handled by a Supabase Edge Function located at:
`supabase/functions/google-maps-routes/index.ts`

This function provides:
- **Secure API Key Management**: Your Google Maps API key is never exposed to the client
- **Rate Limiting**: Prevents API abuse with configurable limits
- **Caching**: Reduces API calls and improves performance
- **Error Handling**: Comprehensive error handling and validation
- **CORS Support**: Proper CORS headers for web compatibility

### API Usage

The Edge Function accepts POST requests with the following structure:

```typescript
{
  "origin": {
    "lat": 37.7749,
    "lng": -122.4194
  },
  "destination": {
    "lat": 37.7849,
    "lng": -122.4094
  },
  "options": {
    "avoidTolls": false,
    "avoidHighways": false,
    "alternatives": true,
    "mode": "driving",
    "departureTime": "2024-01-01T09:00:00Z"
  }
}
```

### Client-Side Integration

Use the provided `useGoogleMapsRoutes` hook for easy integration:

```typescript
import { useGoogleMapsRoutes } from '@/hooks/useGoogleMapsRoutes';

function RouteComponent() {
  const { routes, loading, error, getStressOptimizedRoutes } = useGoogleMapsRoutes();
  
  const handleGetRoutes = async () => {
    try {
      await getStressOptimizedRoutes(
        { lat: 37.7749, lng: -122.4194 }, // Origin
        { lat: 37.7849, lng: -122.4094 }  // Destination
      );
    } catch (error) {
      console.error('Failed to get routes:', error);
    }
  };
  
  return (
    // Your component JSX
  );
}
```

### Features

- **Route Analysis**: Automatically analyzes routes for stress factors
- **Traffic Integration**: Real-time traffic data for accurate ETAs
- **Alternative Routes**: Multiple route options with stress level analysis
- **Therapy Recommendations**: Suggests appropriate wellness content based on route stress level

### Rate Limiting

The Edge Function implements rate limiting:
- **100 requests per minute per IP address**
- **15-minute cache TTL** for identical requests
- **Automatic cache invalidation** for expired entries

### Error Handling

The API provides detailed error responses:
- **Validation Errors**: Invalid coordinates or parameters
- **Rate Limit Errors**: When request limits are exceeded
- **API Errors**: Google Maps API issues
- **Network Errors**: Connection problems

### Security Features

- **API Key Protection**: Google Maps API key is never exposed to clients
- **Input Validation**: Comprehensive validation of all input parameters
- **CORS Protection**: Proper CORS headers for secure cross-origin requests
- **Error Sanitization**: Sensitive information is never leaked in error messages

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your environment variables
4. Deploy the Edge Function to Supabase
5. Start the development server: `npm run dev`

## Deployment

The app can be deployed using Expo's build service or as a web application. Make sure to:

1. Deploy the Edge Function to your Supabase project
2. Configure your Google Maps API key in the Supabase environment
3. Update the Supabase URL and keys in your app configuration

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License.