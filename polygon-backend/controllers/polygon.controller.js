const { Polygon } = require("../models");

// ✅ CREATE polygon
exports.createPolygon = async (req, res) => {
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
      data: polygon,
    });
  } catch (error) {
    console.error("❌ Gagal simpan ke DB:", error);
    res.status(500).json({ error: "Gagal menyimpan polygon" });
  }
};

// ✅ READ all polygons
exports.getAllPolygons = async (req, res) => {
  try {
    const polygons = await Polygon.findAll();
    res.status(200).json({ data: polygons });
  } catch (error) {
    console.error("❌ Gagal ambil data:", error);
    res.status(500).json({ error: "Gagal ambil data polygon" });
  }
};

// ✅ READ polygon by ID
exports.getPolygonById = async (req, res) => {
  try {
    const { id } = req.params;
    const polygon = await Polygon.findByPk(id);

    if (!polygon)
      return res.status(404).json({ error: "Data tidak ditemukan" });

    res.status(200).json({ data: polygon });
  } catch (error) {
    console.error("❌ Gagal ambil data:", error);
    res.status(500).json({ error: "Gagal ambil data polygon" });
  }
};

// ✅ UPDATE polygon by ID
exports.updatePolygon = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Polygon.update(req.body, { where: { id } });

    if (!updated) {
      return res
        .status(404)
        .json({ error: "Data tidak ditemukan atau tidak ada perubahan" });
    }

    res.status(200).json({ message: "✅ Polygon berhasil diperbarui" });
  } catch (error) {
    console.error("❌ Gagal update:", error);
    res.status(500).json({ error: "Gagal update polygon" });
  }
};

// ✅ DELETE polygon by ID
exports.deletePolygon = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Polygon.destroy({ where: { id } });

    if (!deleted)
      return res.status(404).json({ error: "Data tidak ditemukan" });

    res.status(200).json({ message: "✅ Polygon berhasil dihapus" });
  } catch (error) {
    console.error("❌ Gagal hapus data:", error);
    res.status(500).json({ error: "Gagal hapus polygon" });
  }
};
