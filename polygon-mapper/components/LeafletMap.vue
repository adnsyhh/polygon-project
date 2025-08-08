<template>
  <div>
    <div id="map" style="height: 500px"></div>
    <pre style="margin-top: 1rem; background: #eee; padding: 1rem">
      {{ coordinates }}
    </pre>
    <p style="margin-top: 10px"><strong>Luas:</strong> {{ areaText }}</p>

    <!-- FORM UPLOAD SHP -->
    <form
      @submit.prevent="uploadShapefile"
      enctype="multipart/form-data"
      style="margin-top: 1rem"
    >
      <input
        type="file"
        name="zip"
        accept=".zip"
        @change="onFileChange"
        required
      />
      <button type="submit">Upload ZIP</button>
    </form>

    <!-- FORM TAMBAH POSISI -->
    <form
      v-if="formData.geojson"
      @submit.prevent="submitPolygonData"
      style="margin-top: 2rem"
    >
      <h3>📝 Form Tambah Lokasi</h3>
      <label
        >Matra:
        <select v-model="formData.matra" required>
          <option>Darat</option>
          <option>Laut</option>
          <option>Hutan</option>
        </select> </label
      ><br />

      <label
        >Nama Lokasi: <input v-model="formData.nama_lokasi" required /> </label
      ><br />

      <label>Provinsi: <input v-model="formData.provinsi" required /> </label
      ><br />

      <label
        >Luas Lahan (Ha):
        <input v-model.number="formData.luas_lahan" required /> </label
      ><br />

      <button type="submit">Simpan ke Database</button>
    </form>

    <!-- OUTPUT ADDRESS DAN REGION -->
    <div v-if="address || regionInfo" style="margin-top: 2rem">
      <h3>📍 Informasi Lokasi dari SHP</h3>
      <p><strong>Provinsi:</strong> {{ address?.state }}</p>
      <p>
        <strong>Kota/Kabupaten:</strong> {{ address?.city || address?.county }}
      </p>
      <p>
        <strong>Kecamatan:</strong>
        {{ address?.suburb || address?.city_district }}
      </p>
      <p><strong>Kelurahan:</strong> {{ address?.village || "-" }}</p>

      <h3>🗺️ Data Region (PostgreSQL)</h3>
      <p><strong>Region ID:</strong> {{ regionInfo?.region_id }}</p>
      <p><strong>Nama Wilayah:</strong> {{ regionInfo?.nama }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";

const coordinates = ref([]);
const areaText = ref("");
const zipFile = ref(null);
const map = ref(null);
const drawnItems = ref(null);
const address = ref(null);
const regionInfo = ref(null);

const formData = ref({
  matra: "",
  nama_lokasi: "",
  provinsi: "",
  luas_lahan: 0,
  satuan_luas: "Ha",
  geojson: null,
});

// 📦 Fungsi saat mengganti file
function onFileChange(event) {
  zipFile.value = event.target.files[0];
}

// 📤 Fungsi upload shapefile
async function uploadShapefile() {
  const formDataZip = new FormData();
  formDataZip.append("zip", zipFile.value);

  try {
    // Reset form data dulu
    formData.value = {
      matra: "",
      nama_lokasi: "",
      provinsi: "",
      luas_lahan: 0,
      satuan_luas: "Ha",
      geojson: null,
    };

    const res = await fetch("http://localhost:3001/api/upload-zip", {
      method: "POST",
      body: formDataZip,
    });

    const resData = await res.json();
    console.log("✅ Respon upload:", resData);

    const { geojson, address: locInfo, region } = resData;
    address.value = locInfo;
    regionInfo.value = region;

    if (!geojson || !geojson.features || geojson.features.length === 0) {
      console.log("🧪 GeoJSON problem:", geojson);
      alert("❌ Tidak ada fitur dalam GeoJSON hasil upload.");
      return;
    }

    drawnItems.value.clearLayers();

    // Tambahkan semua ke peta
    geojson.features.forEach((feature) => {
      const layer = L.geoJSON(feature);
      layer.addTo(drawnItems.value);
    });

    // Simpan fitur pertama (jika ada) ke formData
    formData.value.geojson = geojson.features[0] ?? null;

    // Hitung luas (opsional, pakai bounding box saja)
    const firstCoords = geojson.features[0]?.geometry?.coordinates?.[0];
    if (firstCoords) {
      let area = L.GeometryUtil.geodesicArea(
        firstCoords.map(([lng, lat]) => L.latLng(lat, lng))
      );
      const areaHa = (area / 10000).toFixed(2);
      formData.value.luas_lahan = Number(areaHa);
      areaText.value = `${areaHa} hektar`;
    }

    alert("✅ ZIP berhasil ditampilkan & form siap diisi!");
  } catch (err) {
    console.error("❌ Upload gagal:", err);
    alert("Gagal upload shapefile.");
  }
}

// 🧠 Submit data ke /api/positions
async function submitPolygonData() {
  if (!formData.value.geojson) {
    alert("Silakan gambar polygon terlebih dahulu.");
    return;
  }

  const payload = {
    ...formData.value,
    satuan_luas: "Ha",
  };

  try {
    const res = await fetch("http://localhost:3001/api/positions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText);
    }

    alert("✅ Data posisi berhasil disimpan!");

    // Reset form
    formData.value = {
      matra: "",
      nama_lokasi: "",
      provinsi: "",
      luas_lahan: 0,
      satuan_luas: "Ha",
      geojson: null,
    };
  } catch (err) {
    alert("❌ Gagal menyimpan ke database.");
    console.error(err);
  }
}

// 🌍 Inisialisasi peta
onMounted(async () => {
  if (typeof window === "undefined") return;

  const L = window.L;

  // Perbaiki ikon marker
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  });

  map.value = L.map("map").setView([-6.914744, 107.60981], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map.value);

  drawnItems.value = new L.FeatureGroup();
  map.value.addLayer(drawnItems.value);

  const drawControl = new L.Control.Draw({
    position: "topright",
    draw: {
      polygon: {
        allowIntersection: false,
        showArea: true,
        shapeOptions: { color: "#97009c" },
      },
      marker: false,
      polyline: false,
      rectangle: false,
      circle: false,
      circlemarker: false,
    },
    edit: {
      featureGroup: drawnItems.value,
    },
  });
  map.value.addControl(drawControl);

  // Ambil data posisi dari backend
  try {
    const res = await fetch("http://localhost:3001/api/positions");
    const data = await res.json();
    data.forEach((item) => {
      const layer = L.geoJSON(item.geojson);
      layer.addTo(drawnItems.value);
    });
  } catch (err) {
    console.error("Gagal ambil data posisi:", err);
  }

  // Saat user menggambar
  map.value.on(L.Draw.Event.CREATED, async (e) => {
    const layer = e.layer;
    drawnItems.value.addLayer(layer);

    const geojson = layer.toGeoJSON();
    coordinates.value = geojson.geometry.coordinates;
    formData.value.geojson = geojson;

    // Hitung luas
    let totalArea = 0;
    drawnItems.value.eachLayer((layer) => {
      if (layer instanceof L.Polygon) {
        const latlngs = layer.getLatLngs()[0];
        totalArea += L.GeometryUtil.geodesicArea(latlngs);
      }
    });
    const areaInHectare = (totalArea / 10000).toFixed(2);
    formData.value.luas_lahan = Number(areaInHectare);
    areaText.value = `${areaInHectare} hektar`;

    alert(`✅ Polygon digambar. Luas: ${areaText.value}`);
  });
});
</script>
