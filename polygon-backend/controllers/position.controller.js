const { Position } = require("../models");
const { sequelize } = require("../models");

// ✅ CREATE position
exports.createPosition = async (req, res) => {
  try {
    const {
      matra,
      file_name,
      alamat,
      provinsi,
      kota_kabupaten,
      kecamatan,
      kelurahan,
      kode_pos,
      dalam_kawasan,
      polygon,
    } = req.body;

    // Validasi GeoJSON Polygon
    if (!polygon || polygon.type !== "Polygon" || !polygon.coordinates) {
      return res.status(400).json({
        success: false,
        message: "Format GeoJSON Polygon tidak valid",
      });
    }

    // Hitung centroid
    const [centroidResult] = await sequelize.query(
      `SELECT ST_Centroid(ST_GeomFromGeoJSON(:polygon)) AS centroid`,
      {
        replacements: { polygon: JSON.stringify(polygon) },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const centroid = centroidResult.centroid;

    // Cari region_id berdasarkan centroid
    const [regionResult] = await sequelize.query(
      `SELECT region_id
       FROM m_region
       WHERE ST_Contains(
         ST_SetSRID(geom, 4326),
         ST_SetSRID(ST_GeomFromGeoJSON(:centroid), 4326)
       )
       LIMIT 1`,
      {
        replacements: { centroid: JSON.stringify(centroid) },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const region_id = regionResult?.region_id || null;

    // Simpan ke database
    const position = await Position.create({
      matra,
      file_name,
      alamat,
      provinsi,
      kota_kabupaten,
      kecamatan,
      kelurahan,
      kode_pos,
      dalam_kawasan,
      polygon,
      centroid,
      region_id,
    });

    res.status(201).json({
      success: true,
      message: "Posisi berhasil disimpan",
      data: position,
    });
  } catch (error) {
    console.error("❌ Gagal simpan ke DB:", error);
    res.status(500).json({ error: "Gagal menyimpan posisi" });
  }
};

// ✅ READ all positions
exports.getAllPositions = async (req, res) => {
  try {
    const positions = await Position.findAll();
    res.status(200).json({ data: positions });
  } catch (error) {
    console.error("❌ Gagal ambil data:", error);
    res.status(500).json({ error: "Gagal ambil data posisi" });
  }
};

// ✅ READ position by ID
exports.getPositionById = async (req, res) => {
  try {
    const { id } = req.params;
    const position = await Position.findByPk(id);

    if (!position)
      return res.status(404).json({ error: "Data tidak ditemukan" });

    res.status(200).json({ data: position });
  } catch (error) {
    console.error("❌ Gagal ambil data:", error);
    res.status(500).json({ error: "Gagal ambil data posisi" });
  }
};

// ✅ UPDATE position by ID
exports.updatePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Position.update(req.body, { where: { id } });

    if (!updated) {
      return res.status(404).json({
        error: "Data tidak ditemukan atau tidak ada perubahan",
      });
    }

    res.status(200).json({ message: "✅ Posisi berhasil diperbarui" });
  } catch (error) {
    console.error("❌ Gagal update:", error);
    res.status(500).json({ error: "Gagal update posisi" });
  }
};

// ✅ DELETE position by ID
exports.deletePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Position.destroy({ where: { id } });

    if (!deleted)
      return res.status(404).json({ error: "Data tidak ditemukan" });

    res.status(200).json({ message: "✅ Posisi berhasil dihapus" });
  } catch (error) {
    console.error("❌ Gagal hapus data:", error);
    res.status(500).json({ error: "Gagal hapus posisi" });
  }
};
