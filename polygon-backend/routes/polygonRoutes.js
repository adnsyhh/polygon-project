// routes/polygonRoutes.js
const express = require("express");
const router = express.Router();
const { Polygon } = require("../models");

// POST: Simpan polygon baru
router.post("/", async (req, res) => {
  try {
    const geojson = req.body;

    if (!geojson || !geojson.geometry || geojson.type !== "Feature") {
      return res.status(400).json({
        success: false,
        message: "Format GeoJSON tidak valid",
      });
    }

    const polygon = await Polygon.create({ geojson });
    res.status(201).json({
      success: true,
      message: "Polygon berhasil disimpan",
      data: polygon.geojson,
    });
  } catch (err) {
    console.error("❌ Gagal simpan ke DB:", err);
    res
      .status(500)
      .json({ success: false, message: "Gagal menyimpan polygon" });
  }
});

// GET: Ambil semua polygon
router.get("/", async (req, res) => {
  try {
    const polygons = await Polygon.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: polygons.map((p) => p.geojson),
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Gagal mengambil polygon" });
  }
});

module.exports = router;
