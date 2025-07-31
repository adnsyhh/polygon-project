const path = require("path");
const fs = require("fs");
const { Position } = require("../models");
const extractZip = require("../services/extractZip");
const convertToGeoJSON = require("../services/convertToGeoJSON");
const getCentroid = require("../services/getCentroid");
const getAddress = require("../services/getAddress");
const findRegion = require("../services/findRegion");

exports.handleUploadShapefile = async (req, res) => {
  try {
    const { zip } = req.files;
    if (!zip || !zip[0]) {
      return res.status(400).json({ error: "File .zip wajib diunggah" });
    }

    const uploadsDir = path.resolve(__dirname, "../uploads");
    const zipPath = zip[0].path;

    const { shpPath, dbfPath, shxPath, baseName } = extractZip(
      zipPath,
      uploadsDir
    );
    const geojson = await convertToGeoJSON(shpPath, dbfPath);
    const centroid = getCentroid(geojson); // { type: 'Point', coordinates: [lon, lat] }
    const [lon, lat] = centroid.geometry.coordinates;

    const address = await getAddress(lat, lon);
    const region = await findRegion(address);

    // Simpan ke tabel Position
    await Position.create({
      matra: "Darat",
      file_name: baseName,
      alamat: address?.road || address?.residential || null,
      provinsi: region?.propinsi || null,
      kota_kabupaten: region?.kab_kota || null,
      kecamatan: region?.kecamatan || address?.city_district || null,
      kelurahan: region?.kelurahan || address?.village || null,
      kode_pos: address?.postcode || null,
      dalam_kawasan: true,
      polygon: geojson.features[0].geometry,
      centroid: centroid.geometry,
      region_id: region?.region_id || null,
    });

    // Bersihkan file setelah selesai
    [shpPath, dbfPath, shxPath, zipPath].forEach((file) => {
      if (file && fs.existsSync(file)) fs.unlinkSync(file);
    });

    // Kirim respons ke frontend
    const koordinat_upload = geojson.features[0].geometry.coordinates[0].map(
      ([lng, lat]) => ({ lat, lng })
    );

    res.status(200).json({
      alamat: address?.road || address?.residential || "-",
      provinsi: region?.propinsi || null,
      kab_kota: region?.kab_kota || null,
      kecamatan: region?.kecamatan || address?.city_district || null,
      kelurahan: region?.kelurahan || address?.village || null,
      kode_pos: address?.postcode || null,
      matra: "Darat",
      koordinat_upload,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res
      .status(500)
      .json({ error: "Gagal proses shapefile", detail: error.message });
  }
};
