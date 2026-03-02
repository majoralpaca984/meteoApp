import { useEffect, useMemo, useState } from "react";
import { geocode, getWeather } from "./services/api";
import { weatherEmoji, weatherLabel } from "./utils/weatherCodes";

export default function App() {
  const [city, setCity] = useState("Roma");
  const [place, setPlace] = useState(null);
  const [current, setCurrent] = useState(null);
  const [daily, setDaily] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("meteo_favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const nicePlaceLabel = useMemo(() => {
    if (!place) return "";
    const admin = place.admin1 ? `, ${place.admin1}` : "";
    const country = place.country ? ` (${place.country})` : "";
    return `${place.name}${admin}${country}`;
  }, [place]);

  function saveFavorites(next) {
    setFavorites(next);
    localStorage.setItem("meteo_favorites", JSON.stringify(next));
  }

  function addFavorite() {
    if (!place) return;
    const key = `${place.name}|${place.admin1 || ""}|${place.country || ""}|${place.latitude}|${place.longitude}`;
    if (favorites.some((f) => f.key === key)) return;

    const next = [
      ...favorites,
      {
        key,
        label: nicePlaceLabel || place.name,
        latitude: place.latitude,
        longitude: place.longitude,
      },
    ];
    saveFavorites(next);
  }

  function removeFavorite(key) {
    saveFavorites(favorites.filter((f) => f.key !== key));
  }

  async function loadFavorite(fav) {
    setErr("");
    setLoading(true);
    setPlace({ name: fav.label, admin1: "", country: "", latitude: fav.latitude, longitude: fav.longitude });
    setCurrent(null);
    setDaily(null);

    try {
      const meteo = await getWeather(fav.latitude, fav.longitude);
      setCurrent(meteo.current);
    } catch (e) {
      setErr(e.message || "Errore");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    const q = city.trim();
    if (!q) return;

    setErr("");
    setLoading(true);
    setPlace(null);
    setCurrent(null);
    setDaily(null);

    try {
      const geo = await geocode(q);
      if (!geo.found || !geo.results?.length) {
        setErr("Città non trovata");
        return;
      }

      const first = geo.results[0];
      setPlace(first);

      const meteo = await getWeather(first.latitude, first.longitude);
      setCurrent(meteo.current);
      setDaily(meteo.daily);
    } catch (e) {
      setErr(e.message || "Errore");
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <div className="page">
      <div className="shell">
        <header className="header">
          <div>
            <h1 className="title">Meteo</h1>
            <p className="subtitle">Ricerca per città · Preferiti · Mobile friendly</p>
          </div>
          <div className="pill">Full Stack</div>
        </header>

        <section className="card">
          <div className="searchRow">
            <div className="field">
              <label className="label">Città</label>
              <input
                className="input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Es. Roma, Milano, Napoli..."
                autoComplete="off"
              />
            </div>
            <button className="btnPrimary" onClick={handleSearch} disabled={loading}>
              {loading ? "Carico..." : "Cerca"}
            </button>
          </div>

          {err && <div className="alert">{err}</div>}

          {place && (
            <div className="resultRow">
              <div className="resultText">
                <span className="resultLabel">Risultato:</span> <b>{nicePlaceLabel}</b>
              </div>
              <button className="btnGhost" onClick={addFavorite} title="Aggiungi ai preferiti">
                ⭐ Preferiti
              </button>
            </div>
          )}

          {favorites.length > 0 && (
            <div className="favorites">
              <div className="favoritesTop">
                <span className="favoritesTitle">Preferiti</span>
                <span className="favoritesHint">tocca per ricaricare</span>
              </div>
              <div className="chips">
                {favorites.map((f) => (
                  <div key={f.key} className="chip">
                    <button className="chipBtn" onClick={() => loadFavorite(f)}>
                      {f.label}
                    </button>
                    <button className="chipDel" onClick={() => removeFavorite(f.key)} aria-label="Rimuovi preferito">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {current && (
          <section className="card meteoCard">
            <div className="meteoTop">
              <div className="meteoIcon" aria-hidden="true">
                {weatherEmoji(current.weather_code)}
              </div>
              <div>
                {place && <div className="meteoPlace">{nicePlaceLabel}</div>}
                <div className="meteoTemp">{Math.round(current.temperature_2m)}°C</div>
                <div className="meteoDesc">{weatherLabel(current.weather_code)}</div>
              </div>
            </div>

            {daily?.time?.length > 0 && (
  <section className="card">
    <div className="forecastHeader">
      <h2 className="forecastTitle">Prossimi 7 giorni</h2>
      <span className="forecastHint">min / max</span>
    </div>

    <div className="forecastGrid">
      {daily.time.map((date, i) => {
        const min = Math.round(daily.temperature_2m_min[i]);
        const max = Math.round(daily.temperature_2m_max[i]);
        const code = daily.weather_code[i];

        const d = new Date(date);
        const label = d.toLocaleDateString("it-IT", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        });

        return (
          <div key={date} className="forecastItem">
            <div className="forecastDay">{label}</div>
            <div className="forecastIcon">{weatherEmoji(code)}</div>
            <div className="forecastTemps">
              <span className="tMin">{min}°</span>
              <span className="tSep">/</span>
              <span className="tMax">{max}°</span>
            </div>
            <div className="forecastDesc">{weatherLabel(code)}</div>
          </div>
        );
      })}
    </div>
  </section>
)}

            <div className="stats">
  <div className="stat">
    <span className="statLabel">Vento</span>
    <span className="statValue">{Math.round(current.wind_speed_10m)} km/h</span>
  </div>
  <div className="stat">
    <span className="statLabel">Condizioni</span>
    <span className="statValue">{weatherLabel(current.weather_code)}</span>
  </div>
</div>
          </section>
        )}

        <footer className="footer">
          <span>API: Open-Meteo</span>
          <span>·</span>
          <span>React + Vite + Express</span>
        </footer>
      </div>
    </div>
  );
}