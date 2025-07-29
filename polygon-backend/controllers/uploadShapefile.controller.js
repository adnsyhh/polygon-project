const path = require("path");
const fs = require("fs");
const { Polygon } = require("../models");
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
    const centroid = getCentroid(geojson);
    const [lon, lat] = centroid.geometry.coordinates;
    const address = await getAddress(lat, lon);
    console.log("📍 Alamat dari koordinat:", address);
    const kelurahan =
      address?.village || address?.suburb || address?.town || null;
    const kecamatan =
      address?.city_district || address?.county || address?.town || null;
    const region = await findRegion(address);

    const koordinat_upload = geojson.features[0].geometry.coordinates[0].map(
      ([lng, lat]) => ({ lat, lng })
    );

    await Polygon.create({
      name: baseName,
      geojson,
      latitude: lat,
      longitude: lon,
      id_region: region?.region_id || null,
      region_name: region?.nama || null,
      alamat: address?.road || address?.residential || null,
    });

    [shpPath, dbfPath, shxPath, zipPath].forEach((file) => {
      if (file && fs.existsSync(file)) fs.unlinkSync(file);
    });

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
