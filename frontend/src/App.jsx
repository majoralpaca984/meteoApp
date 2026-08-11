import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { geocode, getWeather } from "./services/api";
import { weatherEmoji, weatherLabel, weatherTheme } from "./utils/weatherCodes";

const FAVORITES_KEY = "meteo_favorites_v2";
const RECENT_KEY = "meteo_recent_v2";

function readStoredList(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function placeKey(place) {
  return `${Number(place.latitude).toFixed(3)}:${Number(place.longitude).toFixed(3)}`;
}

function formatDay(date, long = false) {
  return new Intl.DateTimeFormat("it-IT", {
    weekday: long ? "long" : "short",
    day: "numeric",
    month: long ? "long" : undefined,
  }).format(new Date(`${date}T12:00:00`));
}

function formatHour(dateTime) {
  return dateTime?.slice(11, 16) || "--:--";
}

function windDirection(degrees) {
  if (!Number.isFinite(degrees)) return "—";
  const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  return directions[Math.round(degrees / 45) % 8];
}

function metric(value, suffix = "", fallback = "—") {
  return Number.isFinite(value) ? `${Math.round(value)}${suffix}` : fallback;
}

function SkeletonDashboard() {
  return (
    <div className="dashboard skeletonDashboard" aria-label="Caricamento meteo">
      <div className="skeleton heroSkeleton" />
      <div className="skeleton stripSkeleton" />
      <div className="skeleton detailsSkeleton" />
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [place, setPlace] = useState(null);
  const [weather, setWeather] = useState(null);
  const [favorites, setFavorites] = useState(() => readStoredList(FAVORITES_KEY));
  const [recent, setRecent] = useState(() => readStoredList(RECENT_KEY));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [retryPlace, setRetryPlace] = useState(null);
  const requestId = useRef(0);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    searchCity("Roma", false);
    // La città iniziale deve essere caricata soltanto al primo avvio.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  }, [recent]);

  async function loadPlace(nextPlace, remember = true) {
    const activeRequest = ++requestId.current;
    setRetryPlace(nextPlace);
    setLoading(true);
    setError("");

    try {
      const data = await getWeather(nextPlace.latitude, nextPlace.longitude);
      if (activeRequest !== requestId.current) return;

      setPlace(nextPlace);
      setWeather(data);

      if (remember && nextPlace.name !== "La tua posizione") {
        setRecent((items) => {
          const next = [nextPlace, ...items.filter((item) => placeKey(item) !== placeKey(nextPlace))];
          return next.slice(0, 4);
        });
      }
      return true;
    } catch (requestError) {
      if (activeRequest === requestId.current) {
        setError(requestError.message || "Non riesco a recuperare il meteo in questo momento.");
      }
      return false;
    } finally {
      if (activeRequest === requestId.current) setLoading(false);
    }
  }

  async function searchCity(city, remember = true) {
    const normalized = city.trim();
    if (!normalized) return;

    const activeRequest = ++requestId.current;
    setRetryPlace(null);
    setLoading(true);
    setError("");

    try {
      const result = await geocode(normalized);
      if (activeRequest !== requestId.current) return;
      if (!result.found || !result.results.length) {
        setError(`Non ho trovato “${normalized}”. Controlla il nome e riprova.`);
        setLoading(false);
        return;
      }

      const loaded = await loadPlace(result.results[0], remember);
      if (loaded) setQuery("");
    } catch (requestError) {
      if (activeRequest === requestId.current) {
        setError(requestError.message || "La ricerca non è disponibile. Riprova tra poco.");
        setLoading(false);
      }
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    searchCity(query);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Il tuo browser non supporta la geolocalizzazione.");
      return;
    }

    setLocationLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        loadPlace({
          name: "La tua posizione",
          admin1: "",
          country: "",
          latitude: coords.latitude,
          longitude: coords.longitude,
        }, false).finally(() => setLocationLoading(false));
      },
      () => {
        setError("Non ho potuto accedere alla posizione. Verifica i permessi del browser.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 },
    );
  }

  const current = weather?.current;
  const daily = weather?.daily;
  const hourly = weather?.hourly;
  const currentPlaceKey = place ? placeKey(place) : "";
  const isFavorite = favorites.some((item) => placeKey(item) === currentPlaceKey);
  const theme = current ? weatherTheme(current.weather_code, current.is_day) : "clear";

  const hourlyForecast = useMemo(() => {
    if (!hourly?.time?.length || !current?.time) return [];
    const start = Math.max(0, hourly.time.findIndex((time) => time >= current.time));
    return hourly.time.slice(start, start + 12).map((time, offset) => {
      const index = start + offset;
      return {
        time,
        temperature: hourly.temperature_2m[index],
        code: hourly.weather_code[index],
        rain: hourly.precipitation_probability[index],
      };
    });
  }, [current?.time, hourly]);

  function toggleFavorite() {
    if (!place || place.name === "La tua posizione") return;
    if (isFavorite) {
      setFavorites((items) => items.filter((item) => placeKey(item) !== currentPlaceKey));
    } else {
      setFavorites((items) => [place, ...items].slice(0, 8));
    }
  }

  return (
    <div className={`app theme-${theme}`}>
      <div className="ambient ambientOne" />
      <div className="ambient ambientTwo" />

      <main className="container">
        <header className="topbar">
          <a className="brand" href="#top" aria-label="Meteora home">
            <span className="brandIcon">◉</span>
            <span>Meteora</span>
          </a>
          <span className="liveBadge"><i /> Dati in tempo reale</span>
        </header>

        <section className="intro" id="top">
          <div>
            <p className="eyebrow">IL METEO, SENZA ATTESE</p>
            <h1>Che tempo fa<br /><span>nel tuo mondo?</span></h1>
            <p className="introText">Previsioni precise, immediate e facili da leggere per organizzare al meglio la tua giornata.</p>
          </div>

          <form className="searchPanel" onSubmit={handleSearch}>
            <div className="searchInputWrap">
              <span className="searchIcon" aria-hidden="true">⌕</span>
              <label className="srOnly" htmlFor="city-search">Cerca una città</label>
              <input
                id="city-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cerca una città..."
                autoComplete="off"
              />
              <button className="searchButton" type="submit" disabled={loading || !query.trim()}>
                Cerca
              </button>
            </div>
            <div className="quickActions">
              <button className="locationButton" type="button" onClick={useCurrentLocation} disabled={locationLoading}>
                <span aria-hidden="true">⌖</span> {locationLoading ? "Localizzo..." : "Usa la mia posizione"}
              </button>
              {recent.length > 0 && (
                <div className="quickCities" aria-label="Ricerche recenti">
                  {recent.map((item) => (
                    <button key={placeKey(item)} type="button" onClick={() => loadPlace(item)}>
                      {item.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>
        </section>

        {error && (
          <div className="errorBanner" role="alert">
            <span aria-hidden="true">!</span>
            <p><strong>Qualcosa non ha funzionato.</strong>{error}</p>
            <button type="button" onClick={() => retryPlace ? loadPlace(retryPlace, false) : searchCity(query || "Roma", false)}>Riprova</button>
          </div>
        )}

        {loading && !weather ? (
          <SkeletonDashboard />
        ) : weather && current ? (
          <div className={`dashboard ${loading ? "isRefreshing" : ""}`}>
            <section className="weatherHero panel">
              <div className="heroMain">
                <div className="placeBlock">
                  <p className="currentLabel">METEO ATTUALE</p>
                  <h2>{place?.name}</h2>
                  <p>{[place?.admin1, place?.country].filter(Boolean).join(", ") || "Coordinate attuali"}</p>
                </div>
                <button
                  className={`favoriteButton ${isFavorite ? "isFavorite" : ""}`}
                  type="button"
                  onClick={toggleFavorite}
                  disabled={place?.name === "La tua posizione"}
                  aria-label={isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
                >
                  {isFavorite ? "★" : "☆"}
                </button>
              </div>

              <div className="temperatureRow">
                <span className="mainWeatherIcon" aria-hidden="true">{weatherEmoji(current.weather_code, current.is_day)}</span>
                <div className="temperatureBlock">
                  <div className="temperature">{metric(current.temperature_2m, "°")}</div>
                  <p>{weatherLabel(current.weather_code)}</p>
                </div>
              </div>

              <div className="heroMeta">
                <span>Percepita {metric(current.apparent_temperature, "°")}</span>
                <span>Max {metric(daily?.temperature_2m_max?.[0], "°")}</span>
                <span>Min {metric(daily?.temperature_2m_min?.[0], "°")}</span>
              </div>
              <p className="updatedAt">Aggiornato alle {formatHour(current.time)} · {weather.timezone_abbreviation}</p>
            </section>

            <section className="panel hourlyPanel">
              <div className="sectionHeading">
                <div>
                  <p className="sectionEyebrow">PROSSIME ORE</p>
                  <h3>Oggi, ora per ora</h3>
                </div>
                <span>Scorri →</span>
              </div>
              <div className="hourlyScroll">
                {hourlyForecast.map((hour, index) => (
                  <article className={`hourCard ${index === 0 ? "now" : ""}`} key={hour.time}>
                    <p>{index === 0 ? "Adesso" : formatHour(hour.time)}</p>
                    <span className="hourIcon" aria-hidden="true">{weatherEmoji(hour.code, current.is_day)}</span>
                    <strong>{metric(hour.temperature, "°")}</strong>
                    <small>💧 {metric(hour.rain, "%")}</small>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel forecastPanel">
              <div className="sectionHeading">
                <div>
                  <p className="sectionEyebrow">TENDENZA SETTIMANALE</p>
                  <h3>Prossimi 7 giorni</h3>
                </div>
              </div>
              <div className="forecastList">
                {daily.time.map((date, index) => (
                  <article className="forecastRow" key={date}>
                    <div className="forecastDate">
                      <strong>{index === 0 ? "Oggi" : formatDay(date)}</strong>
                      <span>{weatherLabel(daily.weather_code[index])}</span>
                    </div>
                    <span className="forecastIcon" aria-hidden="true">{weatherEmoji(daily.weather_code[index])}</span>
                    <div className="rainChance"><span>💧</span>{metric(daily.precipitation_probability_max[index], "%")}</div>
                    <div className="tempRange">
                      <span>{metric(daily.temperature_2m_min[index], "°")}</span>
                      <div><i style={{ width: `${Math.max(24, Math.min(100, daily.temperature_2m_max[index] * 2.5))}%` }} /></div>
                      <strong>{metric(daily.temperature_2m_max[index], "°")}</strong>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="detailsSection">
              <div className="sectionHeading detailsHeading">
                <div>
                  <p className="sectionEyebrow">PANORAMICA</p>
                  <h3>Dettagli di oggi</h3>
                </div>
                <span>{daily?.time?.[0] ? formatDay(daily.time[0], true) : ""}</span>
              </div>
              <div className="detailsGrid">
                <article className="detailCard"><span className="detailIcon">💧</span><div><p>Umidità</p><strong>{metric(current.relative_humidity_2m, "%")}</strong><small>{current.relative_humidity_2m > 70 ? "Aria umida" : "Nella norma"}</small></div></article>
                <article className="detailCard"><span className="detailIcon">💨</span><div><p>Vento</p><strong>{metric(current.wind_speed_10m, " km/h")}</strong><small>{windDirection(current.wind_direction_10m)} · raffiche {metric(current.wind_gusts_10m, " km/h")}</small></div></article>
                <article className="detailCard"><span className="detailIcon">☀️</span><div><p>Indice UV</p><strong>{metric(daily?.uv_index_max?.[0])}</strong><small>{daily?.uv_index_max?.[0] >= 6 ? "Protezione consigliata" : "Esposizione moderata"}</small></div></article>
                <article className="detailCard"><span className="detailIcon">◉</span><div><p>Pressione</p><strong>{metric(current.pressure_msl, " hPa")}</strong><small>{current.pressure_msl >= 1013 ? "Alta pressione" : "Bassa pressione"}</small></div></article>
                <article className="detailCard"><span className="detailIcon">👁</span><div><p>Visibilità</p><strong>{metric(current.visibility / 1000, " km")}</strong><small>{current.visibility >= 10000 ? "Ottima" : "Ridotta"}</small></div></article>
                <article className="detailCard"><span className="detailIcon">🌅</span><div><p>Sole</p><strong>{formatHour(daily?.sunrise?.[0])}</strong><small>Tramonto {formatHour(daily?.sunset?.[0])}</small></div></article>
              </div>
            </section>

            {favorites.length > 0 && (
              <section className="favoritesPanel panel">
                <div className="sectionHeading">
                  <div><p className="sectionEyebrow">SALVATE</p><h3>Le tue città</h3></div>
                </div>
                <div className="favoriteCities">
                  {favorites.map((item) => (
                    <button type="button" key={placeKey(item)} onClick={() => loadPlace(item)}>
                      <span>☆</span><strong>{item.name}</strong><small>{item.country}</small>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : null}

        <footer>
          <p>Previsioni fornite da <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open‑Meteo</a></p>
          <p>Progettata con React, Vite ed Express</p>
        </footer>
      </main>
    </div>
  );
}
