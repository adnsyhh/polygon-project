const reverseGeocode = require("../utils/reverseGeocode");

module.exports = async function getAddress(lat, lon) {
  return await reverseGeocode(lat, lon);
};
