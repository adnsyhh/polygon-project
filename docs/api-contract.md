# API Contract: Polygon Management System (OSS Mapper)

## Base URL

```
http://localhost:3001/api
```

---

## 1. Upload Polygon SHP File

### `POST /upload-zip`

Mengunggah file shapefile `.zip` lalu menyimpan data posisi berdasarkan hasil konversi dan reverse geocoding.

### Request

- **Content-Type:** `multipart/form-data`
- **Body:**

  | Key | Type | Description                 |
  | --- | ---- | --------------------------- |
  | zip | File | File `.zip` SHP (maks. 5MB) |

### Response

```json
{
  "alamat": "-",
  "provinsi": "Jawa Barat",
  "kab_kota": "Kab. Bandung",
  "kecamatan": "Bojongsoang",
  "kelurahan": null,
  "kode_pos": "40621",
  "matra": "Darat",
  "koordinat_upload": [
    {
      "lat": -6.971375169653563,
      "lng": 107.71420164903238
    },
    {
      "lat": -6.971375169653563,
      "lng": 107.714859837979
    },
    {
      "lat": -6.971711066110434,
      "lng": 107.714859837979
    },
    {
      "lat": -6.971711066110434,
      "lng": 107.71420164903238
    },
    {
      "lat": -6.971375169653563,
      "lng": 107.71420164903238
    }
  ]
}
```

---

## 2. Ambil Semua Posisi

### `GET /position`

Mengambil seluruh data posisi yang tersimpan di database.

### Response

```json
{
  "data": [
    {
      "id": 2,
      "matra": "Darat",
      "file_name": "tegalluar-A",
      "alamat": null,
      "provinsi": "Jawa Barat",
      "kota_kabupaten": "Kab. Bandung",
      "kecamatan": "Bojongsoang",
      "kelurahan": null,
      "kode_pos": "40621",
      "dalam_kawasan": true,
      "polygon": {
        "crs": {
          "type": "name",
          "properties": {
            "name": "EPSG:4326"
          }
        },
        "type": "Polygon",
        "coordinates": [
          [
            [107.71420164903238, -6.971375169653563],
            [107.714859837979, -6.971375169653563],
            [107.714859837979, -6.971711066110434],
            [107.71420164903238, -6.971711066110434],
            [107.71420164903238, -6.971375169653563]
          ]
        ]
      },
      "centroid": {
        "crs": {
          "type": "name",
          "properties": {
            "name": "EPSG:4326"
          }
        },
        "type": "Point",
        "coordinates": [107.71453074350569, -6.971543117881999]
      },
      "region_id": "3204080000",
      "createdAt": "2025-07-31T02:00:11.773Z",
      "updatedAt": "2025-07-31T02:00:11.773Z"
    }
  ]
}
```

---

## 3. Ambil Detail Posisi

### `GET /position/:id`

Mengambil detail data posisi berdasarkan ID.

### Response

```json
{
  "data": {
    "id": 2,
    "matra": "Darat",
    "file_name": "tegalluar-A",
    "alamat": null,
    "provinsi": "Jawa Barat",
    "kota_kabupaten": "Kab. Bandung",
    "kecamatan": "Bojongsoang",
    "kelurahan": null,
    "kode_pos": "40621",
    "dalam_kawasan": true,
    "polygon": {
      "crs": {
        "type": "name",
        "properties": {
          "name": "EPSG:4326"
        }
      },
      "type": "Polygon",
      "coordinates": [
        [
          [107.71420164903238, -6.971375169653563],
          [107.714859837979, -6.971375169653563],
          [107.714859837979, -6.971711066110434],
          [107.71420164903238, -6.971711066110434],
          [107.71420164903238, -6.971375169653563]
        ]
      ]
    },
    "centroid": {
      "crs": {
        "type": "name",
        "properties": {
          "name": "EPSG:4326"
        }
      },
      "type": "Point",
      "coordinates": [107.71453074350569, -6.971543117881999]
    },
    "region_id": "3204080000",
    "createdAt": "2025-07-31T02:00:11.773Z",
    "updatedAt": "2025-07-31T02:00:11.773Z"
  }
}
```

---

## 4. Hapus Posisi

### `DELETE /position/:id`

Menghapus data posisi berdasarkan ID.

### Response

```json
{
  "message": "Posisi berhasil dihapus"
}
```

---

## 5. Ekspor Polygon SHP

### `GET /export`

Men-download data polygon dalam format `.zip` berisi SHP.

### Response

- **Content-Type:** `application/zip`
- File terdownload: `polygon-export.zip`

---

## Catatan Tambahan

- Semua endpoint menggunakan PostgreSQL (PostGIS)
- Region otomatis diambil dari tabel `m_region`
- Reverse geocoding pakai [Nominatim API](https://nominatim.openstreetmap.org/)

---


