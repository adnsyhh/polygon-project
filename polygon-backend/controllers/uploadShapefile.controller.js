const shapefile = require("shapefile");
const fs = require("fs");
const path = require("path");
const turf = require("@turf/turf");
const reverseGeocode = require("../utils/reverseGeocode");
const { Polygon } = require("../models");
const MRegion = require("../models/postgres/m_region");
const { Op } = require("sequelize"); // ✅ gunakan Op dari Sequelize langsung

exports.handleUploadShapefile = async (req, res) => {
  try {
    const { shp, dbf, shx } = req.files;
    if (!shp || !dbf) {
      return res
        .status(400)
        .json({ error: "File .shp dan .dbf wajib diunggah" });
    }

    const shpFile = shp[0];
    const dbfFile = dbf[0];
    const shxFile = shx?.[0];

    const originalBaseName = path.parse(shpFile.originalname).name;
    const uploadsDir = path.resolve(__dirname, "../uploads");

    const newShpPath = path.join(uploadsDir, `${originalBaseName}.shp`);
    const newDbfPath = path.join(uploadsDir, `${originalBaseName}.dbf`);
    const newShxPath = path.join(uploadsDir, `${originalBaseName}.shx`);

    // Salin file ke direktori uploads
    fs.copyFileSync(shpFile.path, newShpPath);
    fs.copyFileSync(dbfFile.path, newDbfPath);

    if (shxFile && fs.existsSync(shxFile.path)) {
      fs.copyFileSync(shxFile.path, newShxPath);
    } else {
      console.warn(
        "⚠️ File SHX tidak tersedia atau tidak ditemukan di path:",
        shxFile?.path
      );
    }

    console.log("✅ File berhasil di-rename:", {
      newShpPath,
      newDbfPath,
      newShxPath,
    });

    // Konversi ke GeoJSON
    const features = [];
    await shapefile.open(newShpPath, newDbfPath).then((source) =>
      source.read().then(function log(result) {
        if (result.done) return;
        features.push(result.value);
        return source.read().then(log);
      })
    );

    const geojson = {
      type: "FeatureCollection",
      features,
    };

    // Ambil koordinat tengah polygon
    const firstFeature = geojson.features[0];
    const centroid = turf.centroid(firstFeature);
    const [lon, lat] = centroid.geometry.coordinates;

    // Reverse geocode
    const address = await reverseGeocode(lat, lon);
    console.log("Alamat dari koordinat:", address);

    // Coba temukan id_region dari tabel PostgreSQL (m_region)
    let regionInfo = null;
    if (address?.state && (address?.county || address?.city)) {
      const provinsi = address.state;
      const kabupaten = address.county || address.city;
      const kecamatan = address.city_district;

      const result = await MRegion.findOne({
        where: {
          propinsi: { [Op.iLike]: `%${provinsi}%` },
          kab_kota: { [Op.iLike]: `%${kabupaten}%` },
          kecamatan: { [Op.iLike]: `%${kecamatan}%` },
        },
      });

      if (result) {
        regionInfo = result.dataValues;
        console.log("✅ Region ditemukan:", regionInfo);
      } else {
        console.warn(
          "⚠️ Tidak ditemukan region untuk:",
          address.state,
          kabupaten
        );
      }
    } else {
      console.warn(
        "⚠️ Tidak ada informasi provinsi/kabupaten dari reverse geocode"
      );
    }

    // Simpan ke MySQL
    await Polygon.create({
      name: originalBaseName,
      geojson,
      latitude: lat,
      longitude: lon,
      id_region: regionInfo?.region_id || null,
      region_name: regionInfo?.nama || null,
    });

    // Hapus file sementara
    fs.unlinkSync(newShpPath);
    fs.unlinkSync(newDbfPath);
    if (fs.existsSync(newShxPath)) fs.unlinkSync(newShxPath);

    res.status(200).json({
      message: "✅ Shapefile berhasil diproses & disimpan",
      geojson,
      centroid: { lat, lon },
      address,
      region: regionInfo,
    });
  } catch (error) {
    console.error("❌ Error saat konversi shapefile:", error);
    res.status(500).json({
      error: "Gagal mengonversi shapefile",
      detail: error.message,
    });
  }
};
