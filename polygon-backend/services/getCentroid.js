const turf = require("@turf/turf");

module.exports = function getCentroid(geojson) {
  const firstFeature = geojson.features[0];
  return turf.centroid(firstFeature);
};
