import { Coordinates, Place } from "../types";

// Using OpenStreetMap Overpass API for Places (Free, High Limits)
const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";
// Using OpenStreetMap Nominatim API for Geocoding (Free, No Key)
const NOMINATIM_API_URL = "https://nominatim.openstreetmap.org";

export const fetchNearbyPlaces = async (coords: Coordinates, category: string = 'all', radius: number = 1000): Promise<Place[]> => {
  try {
    // Construct amenity tags based on category
    // Added 'street_vendor' and 'marketplace' for better accuracy in Asian contexts (Kaki lima/Pasar)
    let amenityTags = "restaurant|cafe|fast_food|food_court|bar|pub|ice_cream|biergarten";
    let shopTags = "bakery|pastry|beverages|food";
    let craftTags = "caterer";

    if (category === 'restaurant') {
        amenityTags = "restaurant|food_court|warmindo|makan";
        shopTags = "";
    }
    if (category === 'cafe') {
        amenityTags = "cafe|internet_cafe";
        shopTags = "coffee|tea|bubble_tea";
    }
    if (category === 'fast_food') {
        amenityTags = "fast_food";
        shopTags = "";
    }
    if (category === 'street_food') { // New category logic if needed internally
        amenityTags = "street_vendor|marketplace";
    }

    // Overpass QL Query
    // Increased timeout to 90 seconds to avoid Gateway Timeouts on large areas
    const query = `
      [out:json][timeout:90];
      (
        node["amenity"~"${amenityTags}"](around:${radius},${coords.latitude},${coords.longitude});
        way["amenity"~"${amenityTags}"](around:${radius},${coords.latitude},${coords.longitude});
        node["shop"~"${shopTags}"](around:${radius},${coords.latitude},${coords.longitude});
        node["craft"~"${craftTags}"](around:${radius},${coords.latitude},${coords.longitude});
      );
      out center;
    `;

    const response = await fetch(OVERPASS_API_URL, {
      method: 'POST',
      body: query
    });

    if (!response.ok) {
      // Throw specific error for timeouts
      if (response.status === 504) {
        throw new Error("Gateway Timeout");
      }
      throw new Error(`Overpass API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    const places: Place[] = data.elements
      .filter((el: any) => {
        // Filter out places with no name
        if (!el.tags || !el.tags.name) return false;
        
        const name = el.tags.name.toLowerCase();
        // Filter out generic names that are not helpful
        const genericNames = ['restaurant', 'cafe', 'kafe', 'warung', 'rumah makan', 'food court', 'unknown'];
        if (genericNames.includes(name)) return false;

        return true;
      })
      .map((el: any) => {
        // For 'way' (buildings), OSM returns a center coordinate. For 'node', it returns lat/lon.
        const lat = el.lat || el.center?.lat || coords.latitude;
        const lon = el.lon || el.center?.lon || coords.longitude;

        return {
          id: String(el.id),
          name: el.tags.name,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(el.tags.name)}&query_place_id=${el.lat},${el.lon}`, // Improved maps link
          address: el.tags['addr:street'] 
            ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] || ''}` 
            : (el.tags['addr:city'] || el.tags['addr:village'] || ''),
          rating: el.tags['cuisine'] ? `🍽️ ${el.tags['cuisine'].replace(/_/g, ' ')}` : undefined // Use cuisine as "rating" or type info
        };
      });

    // Remove duplicates based on name
    const uniquePlaces = places.filter((place, index, self) =>
      index === self.findIndex((t) => (
        t.name === place.name
      ))
    );

    // Shuffle and limit
    return uniquePlaces.sort(() => Math.random() - 0.5).slice(0, 50);

  } catch (error) {
    console.error("Error fetching places from OSM:", error);
    throw error;
  }
};

// Search location by name
export const searchLocation = async (query: string): Promise<Coordinates | null> => {
  try {
    const response = await fetch(`${NOMINATIM_API_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error("Error searching location:", error);
    return null;
  }
};

// Get address name from coordinates
export const getAddressFromCoords = async (coords: Coordinates): Promise<string> => {
  try {
    const response = await fetch(`${NOMINATIM_API_URL}/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`);
    const data = await response.json();
    
    if (data && data.display_name) {
      const parts = data.display_name.split(', ');
      // Return a slightly longer address for context, e.g., "Jalan Tebet Raya, Tebet"
      return parts.slice(0, 4).join(', ');
    }
    return "Lokasi Tidak Diketahui";
  } catch (error) {
    return "Gagal memuat alamat";
  }
};