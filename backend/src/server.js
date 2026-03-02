import express from "express";
import cors from "cors";
import "dotenv/config";
import weatherRouter from "./routes/weather.routes.js";
import geocodeRouter from "./routes/geocode.routes.js";


const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/api/geocode", geocodeRouter);
app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/weather", weatherRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));