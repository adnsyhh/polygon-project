const path = require("path");
const fs = require("fs");
const { Position } = require("../models");
const extractZip = require("../services/extractZip");
const convertToGeoJSON = require("../services/convertToGeoJSON");
const getCentroid = require("../services/getCentroid");
const getAddress = require("../services/getAddress");
const findRegion = require("../services/findRegion");
const getArea = require("../services/getArea");

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
    const area = getArea(geojson.features[0].geometry); // satuan: m2

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

    // helper pilih level terkecil
    const pickLevel = (r) => {
      if (!r) return null;
      if (r.kelurahan) return "kelurahan";
      if (r.kecamatan) return "kecamatan";
      if (r.kab_kota) return "kab_kota";
      return null;
    };

    // bangun payload per feature (0,1,2,...)
    const payloadObject = geojson.features.reduce((acc, feature, idx) => {
      // hitung area per polygon
      const perArea = getArea(feature.geometry); // m²

      // region object: jika tidak ketemu, kirim { result: false } saja
      const level = pickLevel(region);
      const regionObj = level
        ? { result: true, level, region_id: region?.region_id }
        : { result: false };

      // pastikan properties ada (kosongkan kalau null)
      const safeFeature = {
        type: "Feature",
        properties: feature.properties || {},
        geometry: feature.geometry,
      };

      acc[idx] = {
        overlap: false, // TODO: ganti jika sudah ada pengecekan overlap
        area: perArea,
        region: regionObj,
        geoJSON: safeFeature,
        kek_ki: false,
        pasal_181: false,
        rdtr: false,
      };
      return acc;
    }, {});

    // total area semua polygon
    const totalArea = Object.values(payloadObject).reduce(
      (sum, it) => sum + it.area,
      0
    );

    // metadata upload (sementara dummy—silakan sesuaikan)
    const data_upload = {
      path: `uploads/${path.basename(zip[0].path)}`,
      id_upload: `U-${Date.now()}`,
      nama_file: zip[0].originalname || `${baseName}.zip`,
    };

    // kirim response final
    return res.status(200).json({
      ...payloadObject, // "0": {...}, "1": {...}, ...
      status: 200,
      keterangan: "Berhasil mendaftarkan file ke database",
      data_upload,
      area: totalArea, // total di root
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res
      .status(500)
      .json({ error: "Gagal proses shapefile", detail: error.message });
  }
};
