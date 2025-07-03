# 🗺️ Polygon Mapper - Wilayah Interaktif Berbasis Web

**Polygon Mapper** adalah aplikasi peta interaktif berbasis web yang memungkinkan pengguna menggambar wilayah dalam bentuk polygon secara langsung di peta (menggunakan Leaflet.js), lalu menyimpannya ke dalam basis data melalui backend REST API. Aplikasi ini cocok untuk kebutuhan pemetaan wilayah usaha, kebun, proyek pembangunan, hingga wilayah administratif.

## 🎯 Tujuan Proyek

Proyek ini bertujuan membuat sistem sederhana namun fungsional untuk:

- Memetakan area secara visual langsung di web.
- Menyimpan koordinat polygon ke database.
- Menampilkan ulang data polygon yang sudah disimpan.

---

## 🧰 Teknologi yang Digunakan

| Layer    | Teknologi                        |
| -------- | -------------------------------- |
| Frontend | Nuxt 4, Leaflet.js, Leaflet-Draw |
| Backend  | Express.js, Sequelize ORM        |
| Database | MySQL                            |
| DevOps   | Docker & Docker Compose          |

---

## 🧩 Struktur Folder

```bash
polygon-project/
├── polygon-mapper/          # Frontend Nuxt
│   ├── app.vue
│   └── pages/index.vue      # Peta dan fitur drawing
├── polygon-backend/         # Backend Express
│   ├── models/
│   ├── routes/
│   ├── config/
│   └── index.js             # Entry point Express
├── docker-compose.yml       # Konfigurasi Docker multi-container
└── README.md

🔥 Fitur Aplikasi
Gambar polygon langsung di atas peta

Koordinat polygon otomatis tersimpan di database

Polygon yang sudah ada ditampilkan ulang saat reload

Backend REST API yang modular

Berjalan otomatis dengan Docker (tanpa setup manual)

🧪 Cara Menjalankan
1. Clone Repository
bash
Salin
Edit
git clone https://github.com/adnsyhh/polygon-project.git
cd polygon-project
2. Jalankan Docker Compose
bash
Salin
Edit
docker-compose up --build
3. Akses Aplikasi
Frontend (Peta): http://localhost:3000

API Backend: http://localhost:3001/api/polygons

🌐 Endpoint Backend
Method	Endpoint	Deskripsi
GET	/api/polygons	Mengambil semua polygon
POST	/api/polygons	Menyimpan polygon baru

🗃️ Struktur Data Polygon
Data polygon disimpan dalam format GeoJSON. Contoh data:

json
Salin
Edit
{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[107.61, -6.91], [107.62, -6.91], [107.61, -6.92], [107.61, -6.91]]]
  }
}
💾 Pengaturan Database
Host: localhost

Port: 3306

Username: root

Password: password

Database: polygon_db
```
