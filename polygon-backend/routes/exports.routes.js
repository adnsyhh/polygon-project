const express = require("express");
const fs = require("fs");
const shpwrite = require("shp-write");
const archiver = require("archiver");
const { Polygon } = require("../models");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const polygons = await Polygon.findAll();

    const geojsonFeatures = [];

    for (const polygon of polygons) {
      const geojson = JSON.parse(polygon.geojson);

      // Pastikan geometry dan koordinat tersedia
      if (geojson && geojson.geometry && geojson.geometry.coordinates) {
        geojsonFeatures.push({
          type: "Feature",
          geometry: geojson.geometry,
          properties: { id: polygon.id },
        });
      }
    }

    const geojson = {
      type: "FeatureCollection",
      features: geojsonFeatures,
    };

    // Tulis shapefile ke dalam memory
    const buffers = shpwrite.zip(geojson);

    // Kirim sebagai file download
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=polygon-data.zip"
    );
    res.setHeader("Content-Type", "application/zip");
    res.send(Buffer.from(buffers));
  } catch (err) {
    console.error("❌ Gagal ekspor shapefile:", err);
    res.status(500).json({ error: "Gagal ekspor shapefile" });
  }
});

module.exports = router;
