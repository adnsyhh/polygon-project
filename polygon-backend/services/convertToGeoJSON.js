  const shapefile = require("shapefile");

  module.exports = async function convertToGeoJSON(shpPath, dbfPath) {
    const features = [];
    const source = await shapefile.open(shpPath, dbfPath);
    let result = await source.read();
    while (!result.done) {
      features.push(result.value);
      result = await source.read();
    }

    return {
      type: "FeatureCollection",
      features,
    };
  };
