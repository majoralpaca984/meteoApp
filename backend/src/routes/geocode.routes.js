import { Router } from "express";
import { geocodeCity } from "../services/geocode.service.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const city = String(req.query.city || "").trim();
    if (city.length < 2) return res.status(400).json({ error: "Inserisci almeno 2 caratteri" });

    const data = await geocodeCity(city);
    res.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    return res.json(data);
  } catch (error) {
    console.error("[geocode]", { message: error.message });
    return res.status(502).json({ error: "Ricerca città temporaneamente non disponibile" });
  }
});

export default router;
