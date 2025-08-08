const turf = require("@turf/turf");

module.exports = function getArea(geometry) {
  const polygon = turf.feature(geometry);
  const areaInSquareMeters = turf.area(polygon);
  return areaInSquareMeters;
};
