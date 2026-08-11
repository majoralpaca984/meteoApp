const BASE_URL = "https://api.open-meteo.com/v1/forecast";
const CACHE_TTL = 10 * 60 * 1000;
const cache = new Map();

export class WeatherServiceError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = "WeatherServiceError";
    this.status = status;
  }
}

function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.savedAt > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

async function fetchForecast(url, attempt = 1) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(6500),
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      const reason = payload?.reason || `Open-Meteo ha risposto ${response.status}`;

      if (response.status >= 500 && attempt < 2) {
        return fetchForecast(url, attempt + 1);
      }

      throw new WeatherServiceError(reason, response.status === 429 ? 503 : 502);
    }

    return response.json();
  } catch (error) {
    if (error instanceof WeatherServiceError) throw error;
    if (attempt < 2) return fetchForecast(url, attempt + 1);
    throw new WeatherServiceError("Servizio meteo temporaneamente non raggiungibile", 503);
  }
}

export async function getWeatherByCoords(latitude, longitude) {
  const lat = Number(latitude);
  const lon = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    throw new WeatherServiceError("Coordinate non valide", 400);
  }

  const cacheKey = `${lat.toFixed(3)}:${lon.toFixed(3)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = new URL(BASE_URL);
  url.searchParams.set("latitude", lat.toFixed(4));
  url.searchParams.set("longitude", lon.toFixed(4));
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility,is_day",
  );
  url.searchParams.set("hourly", "temperature_2m,weather_code,precipitation_probability");
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,uv_index_max",
  );
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("timezone", "auto");

  const data = await fetchForecast(url);
  cache.set(cacheKey, { savedAt: Date.now(), data });
  return data;
}
