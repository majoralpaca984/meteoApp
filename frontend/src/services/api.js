const BACKEND_URL = import.meta.env.VITE_API_BASE_URL;
const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === "true";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const CACHE_TTL = 10 * 60 * 1000;

const KNOWN_CITIES = {
  roma: { name: "Roma", admin1: "Lazio", country: "Italia", latitude: 41.8933, longitude: 12.4829 },
  milano: { name: "Milano", admin1: "Lombardia", country: "Italia", latitude: 45.4643, longitude: 9.1895 },
  napoli: { name: "Napoli", admin1: "Campania", country: "Italia", latitude: 40.8359, longitude: 14.2488 },
  torino: { name: "Torino", admin1: "Piemonte", country: "Italia", latitude: 45.0705, longitude: 7.6868 },
  palermo: { name: "Palermo", admin1: "Sicilia", country: "Italia", latitude: 38.1112, longitude: 13.3524 },
  genova: { name: "Genova", admin1: "Liguria", country: "Italia", latitude: 44.4048, longitude: 8.9444 },
  bologna: { name: "Bologna", admin1: "Emilia-Romagna", country: "Italia", latitude: 44.4938, longitude: 11.3387 },
  firenze: { name: "Firenze", admin1: "Toscana", country: "Italia", latitude: 43.7696, longitude: 11.2558 },
  bari: { name: "Bari", admin1: "Puglia", country: "Italia", latitude: 41.1258, longitude: 16.862 },
  catania: { name: "Catania", admin1: "Sicilia", country: "Italia", latitude: 37.5021, longitude: 15.0872 },
  venezia: { name: "Venezia", admin1: "Veneto", country: "Italia", latitude: 45.4372, longitude: 12.3346 },
  verona: { name: "Verona", admin1: "Veneto", country: "Italia", latitude: 45.4384, longitude: 10.9916 },
  trieste: { name: "Trieste", admin1: "Friuli-Venezia Giulia", country: "Italia", latitude: 45.6495, longitude: 13.7768 },
  padova: { name: "Padova", admin1: "Veneto", country: "Italia", latitude: 45.407, longitude: 11.8859 },
  "guidonia montecelio": { name: "Guidonia Montecelio", admin1: "Lazio", country: "Italia", latitude: 41.9936, longitude: 12.7224 },
};

function readCache(key) {
  try {
    const cached = JSON.parse(sessionStorage.getItem(key));
    if (cached && Date.now() - cached.savedAt < CACHE_TTL) return cached.data;
    sessionStorage.removeItem(key);
  } catch {
    sessionStorage.removeItem(key);
  }
  return null;
}

function writeCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // La cache è un'ottimizzazione: l'app deve funzionare anche se non è disponibile.
  }
}

async function fetchJson(url, timeout = 7000) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const message = payload?.reason || payload?.error || `Errore HTTP ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }

    return payload;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Il servizio meteo sta impiegando troppo tempo. Riprova tra poco.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function normalizeGeocoding(data) {
  const results = (data?.results || []).map((place) => ({
    name: place.name,
    country: place.country,
    admin1: place.admin1,
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone,
  }));

  return { found: results.length > 0, results };
}

async function requestWithOptionalBackend(backendPath, directUrl, directTimeout = 7000) {
  if (!USE_BACKEND || !BACKEND_URL) return fetchJson(directUrl, directTimeout);

  try {
    return await fetchJson(`${BACKEND_URL}${backendPath}`, 3500);
  } catch (backendError) {
    console.warn("Backend non disponibile, uso Open-Meteo direttamente.", backendError);
    return fetchJson(directUrl, directTimeout);
  }
}

export async function geocode(city) {
  const normalizedCity = city.trim();
  const knownCity = KNOWN_CITIES[normalizedCity.toLocaleLowerCase("it-IT")];
  if (knownCity) return { found: true, results: [knownCity] };

  const cacheKey = `meteo:geo:${normalizedCity.toLowerCase()}`;
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const directUrl = new URL(GEOCODING_URL);
  directUrl.searchParams.set("name", normalizedCity);
  directUrl.searchParams.set("count", "8");
  directUrl.searchParams.set("language", "it");
  directUrl.searchParams.set("format", "json");

  const backendPath = `/api/geocode?city=${encodeURIComponent(normalizedCity)}`;
  const response = await requestWithOptionalBackend(backendPath, directUrl, 10000);
  const data = normalizeGeocoding(response);
  writeCache(cacheKey, data);
  return data;
}

export async function getWeather(latitude, longitude) {
  const lat = Number(latitude).toFixed(4);
  const lon = Number(longitude).toFixed(4);
  const cacheKey = `meteo:forecast:${lat}:${lon}`;
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const directUrl = new URL(FORECAST_URL);
  directUrl.searchParams.set("latitude", lat);
  directUrl.searchParams.set("longitude", lon);
  directUrl.searchParams.set(
    "current",
    [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "precipitation",
      "weather_code",
      "cloud_cover",
      "pressure_msl",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "visibility",
      "is_day",
    ].join(","),
  );
  directUrl.searchParams.set(
    "hourly",
    "temperature_2m,weather_code,precipitation_probability",
  );
  directUrl.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "apparent_temperature_max",
      "apparent_temperature_min",
      "sunrise",
      "sunset",
      "precipitation_probability_max",
      "precipitation_sum",
      "wind_speed_10m_max",
      "uv_index_max",
    ].join(","),
  );
  directUrl.searchParams.set("forecast_days", "7");
  directUrl.searchParams.set("timezone", "auto");

  const backendPath = `/api/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
  const data = await requestWithOptionalBackend(backendPath, directUrl);
  writeCache(cacheKey, data);
  return data;
}
