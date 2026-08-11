import express from "express";
import cors from "cors";
import "dotenv/config";
import weatherRouter from "./routes/weather.routes.js";
import geocodeRouter from "./routes/geocode.routes.js";

const app = express();

app.disable("x-powered-by");
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "20kb" }));

app.get("/health", (req, res) => res.json({
  ok: true,
  service: "meteora-api",
  uptime: Math.round(process.uptime()),
}));
app.use("/api/geocode", geocodeRouter);
app.use("/api/weather", weatherRouter);

app.use((req, res) => res.status(404).json({ error: "Endpoint non trovato" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`Meteora API attiva sulla porta ${PORT}`));
