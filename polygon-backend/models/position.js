"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Position extends Model {
    static associate(models) {
      // define association here kalau ada relasi
    }
  }
  Position.init(
    {
      matra: DataTypes.STRING,
      file_name: DataTypes.STRING,
      alamat: DataTypes.TEXT,
      provinsi: DataTypes.STRING,
      kota_kabupaten: DataTypes.STRING,
      kecamatan: DataTypes.STRING,
      kelurahan: DataTypes.STRING,
      kode_pos: DataTypes.STRING,
      dalam_kawasan: DataTypes.BOOLEAN,
      polygon: DataTypes.GEOMETRY("POLYGON", 4326),
      centroid: DataTypes.GEOMETRY("POINT", 4326),
      region_id: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: "Position",
      tableName: "positions", // ⬅️ Tambahkan ini
      timestamps: true,
    }
  );
  return Position;
};
