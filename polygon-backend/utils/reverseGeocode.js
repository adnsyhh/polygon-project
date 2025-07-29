const axios = require("axios");

async function reverseGeocode(lat, lon) {
  const url = "https://nominatim.openstreetmap.org/reverse";
  try {
    const response = await axios.get(url, {
      params: {
        lat,
        lon,
        format: "json",
        addressdetails: 1,
      },
      headers: {
        "User-Agent": "polygon-mapper/1.0 (adnansyah26@gmail.com.com)", 
      },
    });

    return response.data.address;
  } catch (error) {
    console.error("❌ Gagal reverse geocoding:", error.message);
    return null;
  }
}

module.exports = reverseGeocode;
