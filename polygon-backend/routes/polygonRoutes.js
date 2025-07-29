const express = require("express");
const router = express.Router();
const polygonController = require("../controllers/polygon.controller");

// Tambah polygon dari gambar manual (GeoJSON)
router.post("/", polygonController.createPolygon);

// Ambil semua polygon
router.get("/", polygonController.getAllPolygons);

// Ambil polygon berdasarkan ID
router.get("/:id", polygonController.getPolygonById);

// Update polygon berdasarkan ID
router.put("/:id", polygonController.updatePolygon);

// Hapus polygon berdasarkan ID
router.delete("/:id", polygonController.deletePolygon);

module.exports = router;
