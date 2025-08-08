const express = require("express");
const router = express.Router();

// Import semua route modular
const positionRoutes = require("./positions.routes");
const uploadShapefileRoutes = require("./uploads.routes");
const exportRoutes = require("./exports.routes");
// const polygonRoutes = require("./polygonRoutes");

// Daftarkan prefix untuk tiap routes
router.use("/positions", positionRoutes);
router.use("/uploadSHP", uploadShapefileRoutes);
router.use("/export", exportRoutes);
// router.use("/polygons", polygonRoutes);

module.exports = router;
