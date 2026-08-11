# Meteora — Full Stack Weather Dashboard

Meteora è una dashboard meteo responsive sviluppata con React, Vite, Node.js ed Express. Mostra condizioni attuali, previsioni orarie e andamento dei prossimi sette giorni con un'interfaccia che cambia atmosfera in base al tempo e al momento della giornata.

## Demo

- Frontend: https://meteo-app-ebon.vercel.app
- Backend: https://meteoapp-t1q5.onrender.com
- Health check: https://meteoapp-t1q5.onrender.com/health

> I link pubblici mostrano l'ultima versione distribuita. Dopo aver pubblicato questo aggiornamento, Vercel e Render useranno il nuovo codice.

## Funzionalità

- Ricerca meteo per città con geocoding in italiano
- Utilizzo della posizione del dispositivo
- Condizioni attuali e temperatura percepita
- Previsioni delle prossime 12 ore
- Previsioni dettagliate per 7 giorni
- Umidità, vento e raffiche, pressione, visibilità, UV, alba e tramonto
- Preferiti e ricerche recenti persistenti
- Cache nel browser per risposte più rapide e meno richieste
- Tema dinamico per sereno, notte, pioggia, neve, temporale e cielo coperto
- Skeleton di caricamento, errori leggibili e pulsante di riprova
- Layout accessibile e responsive per desktop, tablet e smartphone

## Affidabilità e prestazioni

La versione di produzione interroga Open-Meteo direttamente dal browser. Questo evita l'attesa del risveglio di un servizio Render gratuito e impedisce che un limite applicato agli IP condivisi di Render blocchi l'app.

Il backend Express resta disponibile come modalità opzionale. Se viene abilitato e non risponde entro 3,5 secondi, il frontend passa automaticamente alla chiamata diretta.

Il backend include inoltre:

- cache in memoria;
- timeout e un nuovo tentativo per errori temporanei;
- validazione delle coordinate;
- status HTTP più corretti;
- log utili per capire gli errori dell'API esterna;
- header di cache HTTP.

## Stack

### Frontend

- React 19
- Vite 7
- CSS responsive senza framework UI
- Local Storage e Session Storage
- Geolocation API del browser

### Backend

- Node.js 20+
- Express 5
- CORS
- Open-Meteo Forecast e Geocoding API

## Struttura

```text
meteoApp/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   └── package.json
└── README.md
```

## Avvio locale

Servono Node.js 20 o superiore e due terminali.

### Backend

```bash
cd backend
npm install
npm run dev
```

Il server parte su `http://localhost:3001`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Il frontend parte su `http://localhost:5173`.

## Variabili del frontend

Il file `frontend/.env` contiene:

```env
VITE_API_BASE_URL=https://meteoapp-t1q5.onrender.com
VITE_USE_BACKEND=false
```

- `VITE_USE_BACKEND=false`: modalità consigliata per la demo pubblica, più veloce e resistente ai limiti degli IP condivisi.
- `VITE_USE_BACKEND=true`: prova prima il backend e passa automaticamente a Open-Meteo se il server non risponde.

## Endpoint backend

```text
GET /health
GET /api/geocode?city=Roma
GET /api/weather?lat=41.9028&lon=12.4964
```

## Verifica prima del deploy

```bash
cd frontend
npm run lint
npm run build
```

Testare poi ricerca, geolocalizzazione, preferiti e resa mobile.

## Crediti

Dati meteorologici forniti da [Open-Meteo](https://open-meteo.com/) con licenza CC BY 4.0.

Progetto di Eleonora Troiani — https://www.eleonoratroiani.dev
