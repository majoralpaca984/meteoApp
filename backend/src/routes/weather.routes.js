import { Router } from "express";
import { getWeatherByCoords } from "../services/weather.service.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "Latitudine e longitudine sono obbligatorie" });

    const data = await getWeatherByCoords(lat, lon);
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=300");
    return res.json(data);
  } catch (error) {
    const status = error.status || 502;
    console.error("[weather]", { status, message: error.message });
    return res.status(status).json({
      error: "Impossibile recuperare le previsioni",
      detail: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
});

export default router;
