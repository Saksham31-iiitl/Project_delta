const axios = require("axios");

/**
 * Geocode an address string to { lat, lng } using OpenStreetMap Nominatim.
 * Returns null if geocoding fails.
 */
async function geocodeAddress(addressParts) {
  const query = addressParts.filter(Boolean).join(", ");
  if (!query) return null;
  try {
    const { data } = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: { q: query, format: "json", limit: 1, addressdetails: 0 },
      headers: { "User-Agent": "HostTheGuest/1.0 (hosttheguest.netlify.app)" },
      timeout: 5000,
    });
    if (data?.length) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch { /* fall through */ }
  return null;
}

module.exports = { geocodeAddress };
