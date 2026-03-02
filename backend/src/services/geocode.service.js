const GEO = "https://geocoding-api.open-meteo.com/v1/search";

export async function geocodeCity(city) {
  const url = new URL(GEO);
  url.searchParams.set("name", city);
  url.searchParams.set("count", "5");
  url.searchParams.set("language", "it");
  url.searchParams.set("format", "json");

  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding error");
  const json = await res.json();

  const first = json?.results?.[0];
  if (!first) return { found: false, results: [] };

  return {
    found: true,
    results: json.results.map((r) => ({
      name: r.name,
      country: r.country,
      admin1: r.admin1,
      latitude: r.latitude,
      longitude: r.longitude,
    })),
  };
}