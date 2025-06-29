// Global type declarations for Google Maps API
declare global {
  interface Window {
    google: {
      maps: {
        Map: any;
        Marker: any;
        Polyline: any;
        LatLngBounds: any;
        SymbolPath: any;
        geometry: {
          encoding: {
            decodePath: (encodedPath: string) => Array<{ lat: number; lng: number }>;
          };
        };
      };
    };
  }
}

export {};