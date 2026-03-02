import { Router } from "express";
import { getWeatherByCoords } from "../services/weather.service.js";

const router = Router();

// GET /api/weather?lat=41.9028&lon=12.4964
router.get("/", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "Missing lat or lon" });

    const data = await getWeatherByCoords(lat, lon);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Weather fetch failed" });
  }
});

export default router;