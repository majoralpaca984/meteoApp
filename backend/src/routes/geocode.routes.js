import { Router } from "express";
import { geocodeCity } from "../services/geocode.service.js";

const router = Router();

// GET /api/geocode?city=Roma
router.get("/", async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: "Missing city" });

    const data = await geocodeCity(city);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Geocode failed" });
  }
});

export default router;