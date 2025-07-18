<template>
  <div id="map" style="height: 500px"></div>
  <pre style="margin-top: 1rem; background: #eee; padding: 1rem">
    {{ coordinates }}
  </pre>
  <p style="margin-top: 10px"><strong>Luas:</strong> {{ areaText }}</p>

  <form
    @submit.prevent="uploadShapefile"
    enctype="multipart/form-data"
    style="margin-top: 1rem"
  >
    <input
      type="file"
      name="shp"
      accept=".shp"
      @change="onFileChange($event, 'shp')"
      required
    />
    <input
      type="file"
      name="shx"
      accept=".shx"
      @change="onFileChange($event, 'shx')"
    />
    <input
      type="file"
      name="dbf"
      accept=".dbf"
      @change="onFileChange($event, 'dbf')"
      required
    />
    <button type="submit">Upload SHP</button>
  </form>
</template>

<script setup>
import { onMounted, ref } from "vue";

// Ref variabel global
const coordinates = ref([]);
const areaText = ref("");
const shapefileData = ref({ shp: null, shx: null, dbf: null });
const map = ref(null); // Disimpan agar bisa dipakai lintas fungsi
const drawnItems = ref(null); // Untuk menyimpan layer gambar

// Fungsi saat user mengganti file
function onFileChange(event, type) {
  shapefileData.value[type] = event.target.files[0];
}

// Fungsi upload file SHP
async function uploadShapefile() {
  const formData = new FormData();
  formData.append("shp", shapefileData.value.shp);
  if (shapefileData.value.shx) formData.append("shx", shapefileData.value.shx);
  formData.append("dbf", shapefileData.value.dbf);

  try {
    const res = await fetch("http://localhost:3001/api/upload-shp", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Upload error detail:", errorText);
      alert(`Gagal upload SHP.\nDetail: ${errorText}`);
      return;
    }

    const resData = await res.json();
    const { geojson } = resData;

    if (!geojson || !geojson.features || geojson.features.length === 0) {
      alert("Tidak ada data di dalam SHP.");
      return;
    }

    // Hapus semua layer sebelumnya (opsional)
    drawnItems.value.clearLayers();

    const layer = L.geoJSON(geojson);
    layer.addTo(drawnItems.value);
    alert("✅ SHP berhasil ditampilkan di peta!");
  } catch (err) {
    console.error("❌ Upload gagal (exception):", err);
    alert("Gagal upload SHP (network error).");
  }
}

onMounted(async () => {
  if (typeof window === "undefined") return;

  const L = window.L;

  // Fix ikon marker
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  });

  // Inisialisasi peta
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
        shapeOptions: {
          color: "#97009c",
        },
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

  // Ambil polygon dari backend
  try {
    const res = await fetch("http://localhost:3001/api/polygons");
    const resData = await res.json();
    const polygons = resData.data;

    if (Array.isArray(polygons)) {
      polygons.forEach((geojson) => {
        try {
          const parsed = JSON.parse(geojson);
          const layer = L.geoJSON(parsed);
          layer.addTo(drawnItems.value);
        } catch (err) {
          console.error("Gagal parsing polygon:", err, geojson);
        }
      });
    }
  } catch (err) {
    console.error("Gagal ambil polygon:", err);
  }

  // Saat pengguna menggambar polygon
  map.value.on(L.Draw.Event.CREATED, async (e) => {
    const layer = e.layer;
    drawnItems.value.addLayer(layer);

    const geojson = layer.toGeoJSON();
    coordinates.value = geojson.geometry.coordinates;

    let totalArea = 0;
    drawnItems.value.eachLayer((layer) => {
      if (layer instanceof L.Polygon) {
        const latlngs = layer.getLatLngs()[0];
        totalArea += L.GeometryUtil.geodesicArea(latlngs);
      }
    });
    const areaInHectare = (totalArea / 10000).toFixed(2);
    areaText.value = `${areaInHectare} hektar`;
    alert(`Luas area: ${areaText.value}`);

    // Kirim ke backend
    try {
      await fetch("http://localhost:3001/api/polygons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geojson),
      });
      alert("Polygon berhasil disimpan!");
    } catch (err) {
      console.error("Gagal simpan polygon:", err);
    }
  });
});
</script>
