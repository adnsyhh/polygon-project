const { DataTypes } = require("sequelize");
const postgresSequelize = require("../../config/postgres");

const MRegion = postgresSequelize.define(
  "m_region",
  {
    region_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    propinsi: {
      type: DataTypes.STRING(255),
    },
    kab_kota: {
      type: DataTypes.STRING(255),
    },
    kecamatan: {
      type: DataTypes.STRING(255),
    },
    kelurahan: {
      type: DataTypes.STRING(255),
    },
    flag_ibukota: {
      type: DataTypes.BOOLEAN,
    },
    keterangan: {
      type: DataTypes.TEXT,
    },
    parent_id: {
      type: DataTypes.BIGINT,
    },
    nama: {
      type: DataTypes.STRING(255),
    },
    level: {
      type: DataTypes.STRING(50),
    },
    updated: {
      type: DataTypes.DATE,
    },
    created: {
      type: DataTypes.DATE,
    },
    flag_aktif: {
      type: DataTypes.BOOLEAN,
    },
    region_id_lama: {
      type: DataTypes.BIGINT,
    },
  },
  {
    tableName: "m_region",
    schema: "public",
    timestamps: false,
  }
);

module.exports = MRegion;
