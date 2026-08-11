const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const CACHE_TTL = 24 * 60 * 60 * 1000;
const cache = new Map();

export async function geocodeCity(city) {
  const normalizedCity = city.trim();
  const cacheKey = normalizedCity.toLowerCase();
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.savedAt < CACHE_TTL) return cached.data;

  const url = new URL(GEOCODING_URL);
  url.searchParams.set("name", normalizedCity);
  url.searchParams.set("count", "8");
  url.searchParams.set("language", "it");
  url.searchParams.set("format", "json");

  const response = await fetch(url, {
    signal: AbortSignal.timeout(9000),
    headers: { Accept: "application/json" },
  });

  if (!response.ok) throw new Error(`Geocoding upstream status ${response.status}`);
  const json = await response.json();
  const results = (json.results || []).map((place) => ({
    name: place.name,
    country: place.country,
    admin1: place.admin1,
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone,
  }));
  const data = { found: results.length > 0, results };

  cache.set(cacheKey, { savedAt: Date.now(), data });
  return data;
}
