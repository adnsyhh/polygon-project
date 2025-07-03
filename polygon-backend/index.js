// polygon-backend/index.js
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const polygonRoutes = require("./routes/polygonRoutes");

const app = express();
const PORT = 3001;

// Middleware dasar
app.use(cors());
app.use(express.json());

// Routing utama
app.use("/api/polygons", polygonRoutes);

// Optional: Health check
app.get("/", (req, res) => {
  res.send("Polygon API v1 aktif!");
});

// 404 handler (endpoint tidak ditemukan)
app.use((req, res, next) => {
  res.status(404).json({ error: "Endpoint tidak ditemukan" });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error("🔥 Error Server:", err.stack);
  res.status(500).json({ error: "Terjadi kesalahan pada server" });
});

// Mulai server hanya jika koneksi DB berhasil
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Koneksi ke database berhasil!");
    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Gagal koneksi ke database:", err);
  });
