const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

module.exports = function extractZip(zipPath, outputDir) {
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(outputDir, true);

  const files = fs.readdirSync(outputDir);
  const shp = files.find((f) => f.endsWith(".shp"));
  const dbf = files.find((f) => f.endsWith(".dbf"));
  const shx = files.find((f) => f.endsWith(".shx"));
  const baseName = path.parse(shp).name;

  return {
    shpPath: path.join(outputDir, shp),
    dbfPath: path.join(outputDir, dbf),
    shxPath: shx ? path.join(outputDir, shx) : null,
    baseName,
  };
};
