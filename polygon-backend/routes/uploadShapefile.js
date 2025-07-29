const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const uploadShapefileController = require("../controllers/uploadShapefile.controller");

// Konfigurasi penyimpanan
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Route untuk upload file ZIP
router.post(
  "/",
  upload.fields([{ name: "zip", maxCount: 1 }]),
  uploadShapefileController.handleUploadShapefile
);

module.exports = router;
