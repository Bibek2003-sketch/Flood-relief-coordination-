export interface GeocodeResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  importance?: number;
}

// Search coordinates by place name / address
export const searchPlace = async (query: string): Promise<GeocodeResult[]> => {
  if (!query || query.trim().length < 2) return [];
  if (query.startsWith('GPS:')) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query.trim())}&limit=5&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error searching place:', error);
    return [];
  }
};

// Reverse geocode coordinates to readable address
export const reverseGeocode = async (lat: number, lon: number): Promise<string | null> => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data?.display_name || null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

// Calculate distance in kilometers using the Haversine formula
export const calculateDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // 1 decimal place
};
