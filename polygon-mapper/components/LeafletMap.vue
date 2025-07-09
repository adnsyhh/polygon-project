<template>
  <div id="map" style="height: 500px"></div>
  <pre style="margin-top: 1rem; background: #eee; padding: 1rem">
    {{ coordinates }}
  </pre>
  <p style="margin-top: 10px"><strong>Luas:</strong> {{ areaText }}</p>
</template>

<script setup>
import { onMounted, ref } from "vue";

const coordinates = ref([]);
const areaText = ref("");

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

  const map = L.map("map").setView([-6.914744, 107.60981], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  const drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

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
      featureGroup: drawnItems,
    },
  });
  map.addControl(drawControl);

  // ✅ Ambil polygon dari backend dan render ulang
  try {
    const res = await fetch("http://localhost:3001/api/polygons");
    const resData = await res.json(); // Ambil respons lengkap
    const polygons = resData.data; // Ambil array `data` di dalamnya

    if (Array.isArray(polygons)) {
      polygons.forEach((geojson) => {
        try {
          const parsed = JSON.parse(geojson); // ✅ ubah string jadi objek
          const layer = L.geoJSON(parsed);
          layer.addTo(drawnItems);
        } catch (err) {
          console.error("Gagal parsing polygon:", err, geojson);
        }
      });
    } else {
      console.warn("Response polygon bukan array:", polygons);
    }
  } catch (err) {
    console.error("Gagal ambil polygon:", err);
  }

  // Saat pengguna menggambar polygon
  map.on(L.Draw.Event.CREATED, async (e) => {
    const layer = e.layer;
    drawnItems.addLayer(layer);

    const geojson = layer.toGeoJSON();
    coordinates.value = geojson.geometry.coordinates;

    // ✅ Hitung luas polygon (meter persegi ke hektar)
    let totalArea = 0;
    drawnItems.eachLayer((layer) => {
      if (layer instanceof L.Polygon) {
        const latlngs = layer.getLatLngs()[0];
        totalArea += L.GeometryUtil.geodesicArea(latlngs);
      }
    });
    const areaInHectare = (totalArea / 10000).toFixed(2);

    areaText.value = `${areaInHectare} hektar`;
    alert(`Luas area: ${areaText.value}`);

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

    console.log("🔴 EVENT TERPANGGIL:", e);
  });
});
</script>
