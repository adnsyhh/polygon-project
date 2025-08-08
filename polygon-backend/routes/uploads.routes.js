const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uploadShapefileController = require("../controllers/uploadShapefile.controller");

// pastikan folder uploads ada
const uploadsDir = path.resolve(__dirname, "../uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

// storage disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ts = Date.now();
    cb(null, `${ts}-${file.originalname}`);
  },
});

// validasi hanya zip
function fileFilter(req, file, cb) {
  const extOk = path.extname(file.originalname).toLowerCase() === ".zip";
  const mimeOk = [
    "application/zip",
    "application/x-zip-compressed",
    "multipart/x-zip",
    "application/octet-stream", // kadang zip terdeteksi ini
  ].includes(file.mimetype);

  if (extOk && mimeOk) return cb(null, true);
  cb(new Error("Hanya file .zip yang diperbolehkan"));
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// wrapper untuk nangkep error multer with fields()
const uploadZipMiddleware = (req, res, next) => {
  upload.fields([{ name: "zip", maxCount: 1 }])(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        // contoh: LIMIT_FILE_SIZE, etc
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ error: err.message || "Upload gagal" });
    }
    next();
  });
};

// route
router.post(
  "/",
  uploadZipMiddleware,
  uploadShapefileController.handleUploadShapefile
);

module.exports = router;
