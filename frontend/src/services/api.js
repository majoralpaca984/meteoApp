const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export async function geocode(city) {
  const url = new URL(`${API_BASE}/api/geocode`);
  url.searchParams.set("city", city);

  const res = await fetch(url);
  if (!res.ok) throw new Error("Errore geocoding");
  return res.json();
}

export async function getWeather(lat, lon) {
  const url = new URL(`${API_BASE}/api/weather`);
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lon);

  const res = await fetch(url);
  if (!res.ok) throw new Error("Errore meteo");
  return res.json();
}