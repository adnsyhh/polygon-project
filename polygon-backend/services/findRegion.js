const MRegion = require("../models/postgres/m_region");
const { Op } = require("sequelize");

module.exports = async function findRegion(address) {
  const { village, suburb, town, city_district, county } = address;
  const kelurahan = village || suburb || town;
  const kecamatan = city_district || county || town;

  if (kelurahan) {
    const region = await MRegion.findOne({
      where: { nama: { [Op.iLike]: `%${kelurahan}%` } },
    });
    if (region) return region;
  }

  if (kecamatan) {
    const region = await MRegion.findOne({
      where: { nama: { [Op.iLike]: `%${kecamatan}%` } },
    });
    if (region) return region;
  }

  console.warn("⚠️ Tidak ditemukan region untuk:", kelurahan, kecamatan);
  return null;
};
