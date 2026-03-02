const BASE = "https://api.open-meteo.com/v1/forecast";

export async function getWeatherByCoords(lat, lon) {
  const url = new URL(BASE);
  url.searchParams.set("latitude", lat);
  url.searchParams.set("longitude", lon);

  // current
  url.searchParams.set("current", "temperature_2m,weather_code,wind_speed_10m");

  // daily forecast (7 giorni)
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min"
  );
  url.searchParams.set("forecast_days", "7");

  url.searchParams.set("timezone", "auto");

  const res = await fetch(url);
  if (!res.ok) throw new Error("Open-Meteo error");
  return res.json();
}