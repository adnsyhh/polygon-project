"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Polygon extends Model {
    static associate(models) {
      // Belum ada relasi antar model
    }
  }

  Polygon.init(
    {
      geojson: {
        type: DataTypes.JSON,
        allowNull: false, // ❗ data tidak boleh kosong
      },
    },
    {
      sequelize,
      modelName: "Polygon",
      tableName: "Polygons", // ❗ opsional tapi eksplisit
    }
  );

  return Polygon;
};
