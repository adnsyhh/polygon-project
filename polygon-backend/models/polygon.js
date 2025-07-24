"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Polygon extends Model {
    static associate(models) {
      // Jika nanti perlu relasi, tambahkan di sini
    }
  }

  Polygon.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      geojson: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      latitude: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      id_region: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      region_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Polygon",
      tableName: "polygons", // ✅ lowercase sesuai konvensi MySQL
      timestamps: true,
    }
  );

  return Polygon;
};
