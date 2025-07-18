const express = require("express");
const router = express.Router();
const multer = require("multer");
const shapefile = require("shapefile");
const fs = require("fs");
const path = require("path");

const upload = multer({ dest: "uploads/" });

router.post(
  "/",
  upload.fields([
    { name: "shp", maxCount: 1 },
    { name: "shx", maxCount: 1 },
    { name: "dbf", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { shp, dbf, shx } = req.files;

      if (!shp || !dbf) {
        return res
          .status(400)
          .json({ error: "File .shp dan .dbf wajib diunggah" });
      }

      // Ambil file asli
      const shpFile = shp[0];
      const dbfFile = dbf[0];
      const shxFile = shx?.[0];

      // Gunakan nama asli dari user (tanpa ekstensi)
      const originalBaseName = path.parse(shpFile.originalname).name;

      const uploadsDir = path.resolve(__dirname, "../uploads"); // 👈 path absolut
      const newShpPath = path.join(uploadsDir, `${originalBaseName}.shp`);
      const newDbfPath = path.join(uploadsDir, `${originalBaseName}.dbf`);
      const newShxPath = shxFile
        ? path.join(uploadsDir, `${originalBaseName}.shx`)
        : null;

      // Rename
      fs.copyFileSync(shpFile.path, newShpPath);
      fs.copyFileSync(dbfFile.path, newDbfPath);
      if (shxFile) fs.copyFileSync(shxFile.path, newShxPath);

      // Optional: hapus file sementara
      fs.unlinkSync(shpFile.path);
      fs.unlinkSync(dbfFile.path);
      if (shxFile) fs.unlinkSync(shxFile.path);

      // Debug
      console.log("✅ File berhasil di-rename:");
      console.log({ newShpPath, newDbfPath, newShxPath });

      // Konversi ke GeoJSON
      const features = [];
      console.log("🚀 Membuka file:", newShpPath, newDbfPath);
      console.log("📁 File ada?", {
        shp: fs.existsSync(newShpPath),
        dbf: fs.existsSync(newDbfPath),
        shx: newShxPath ? fs.existsSync(newShxPath) : "tidak ada",
      });
      await shapefile.open(newShpPath, newDbfPath).then((source) =>
        source.read().then(function log(result) {
          if (result.done) {
            console.log("✅ Total feature dibaca:", features.length);
            return;
          }
          features.push(result.value);
          return source.read().then(log);
        })
      );

      // Hapus file
      fs.unlinkSync(newShpPath);
      fs.unlinkSync(newDbfPath);
      if (newShxPath) fs.unlinkSync(newShxPath);

      const geojson = {
        type: "FeatureCollection",
        features,
      };
      console.log("✅ GeoJSON generated:", JSON.stringify(geojson, null, 2));
      res.status(200).json({ geojson });
    } catch (error) {
      console.error("❌ Error saat konversi shapefile:", error);
      res
        .status(500)
        .json({ error: "Gagal mengonversi shapefile", detail: error.message });
    }
  }
);

module.exports = router;
