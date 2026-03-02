# Meteo App — Full Stack (React + Node/Express)

Meteo App completa da portfolio: ricerca meteo per città tramite geocoding, meteo corrente e gestione preferiti (persistenza in localStorage).
Il backend (Node/Express) funge da proxy verso le API esterne ed è pronto per feature “da produzione” come cache, rate limit e  gestione API key.

---

## 🔗 Demo (Live)

- **Frontend (Vercel):** https://meteo-app-ebon.vercel.app
- **Backend (Render):** https://meteoapp-t1q5.onrender.com

Test rapidi backend:
- https://meteoapp-t1q5.onrender.com/health
- https://meteoapp-t1q5.onrender.com/api/geocode?city=Roma
- https://meteoapp-t1q5.onrender.com/api/weather?lat=41.9028&lon=12.4964

---

## ✨ Features

- Ricerca per **città**
- **Geocoding** (città → lat/lon)
- **Meteo corrente**: temperatura, vento, condizioni
- Mapping `weather_code` → **descrizione leggibile + emoji**
- **Preferiti** salvati in `localStorage`
- Backend Express con endpoint dedicati (`/api/geocode`, `/api/weather`)

---

## 🧰 Tech Stack

**Frontend**
- React + Vite

**Backend**
- Node.js + Express
- cors, dotenv
- nodemon (dev)

**API**
- Open-Meteo Forecast API
- Open-Meteo Geocoding API

---

## 📁 Struttura progetto

```
meteo-app/
  backend/
    src/
      server.js
      routes/
      services/
    package.json
  frontend/
    src/
      App.jsx
      services/
      utils/
    package.json
  README.md
```

---

## ▶️ Avvio in locale

Apri **due terminali** (uno per backend e uno per frontend).

### 1) Backend

```bash
cd backend
npm install
npm run dev
```

Backend: `http://localhost:3001`

Test rapidi:
- `http://localhost:3001/health`
- `http://localhost:3001/api/geocode?city=Roma`
- `http://localhost:3001/api/weather?lat=41.9028&lon=12.4964`

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

---

## 🔌 API Endpoints (Backend)

### Health Check
- `GET /health`

Esempio risposta:
```json
{ "ok": true }
```

### Geocoding (città → coordinate)
- `GET /api/geocode?city=Roma`

Esempio risposta (struttura):
```json
{
  "found": true,
  "results": [
    {
      "name": "Roma",
      "country": "Italy",
      "admin1": "Lazio",
      "latitude": 41.8933,
      "longitude": 12.4829
    }
  ]
}
```

### Meteo (coordinate → meteo corrente)
- `GET /api/weather?lat=41.9028&lon=12.4964`

Esempio risposta (struttura, semplificata):
```json
{
  "current": {
    "temperature_2m": 18.2,
    "wind_speed_10m": 9.4,
    "weather_code": 2
  }
}
```

---

## 🧪 Test veloce (checklist)

1. Cerca una città (es. Roma)
2. Verifica che compaiano temperatura/vento/condizioni
3. Aggiungi ai preferiti almeno 2 città
4. Ricarica la pagina e verifica che i preferiti restino
5. Clicca un preferito per ricaricare il meteo

---

## 🚀 Idee per miglioramenti (Roadmap)

- Forecast 7 giorni (daily)
- UI responsive + layout a cards
- Dark/Light mode
- Selezione unità (°C/°F)
- Cache backend (in-memory) per ridurre chiamate
- Rate limiting e gestione errori più dettagliata
- Deploy: Frontend (Vercel/Netlify) + Backend (Render/Fly.io)

---

## 📸 Screenshots


---

## 👩‍💻 Autore

- Nome: (Eleonora Troiani)
- Portfolio: (https://www.eleonoratroiani.dev)
- Repo: (https://github.com/majoralpaca984/meteoApp/tree/main)
