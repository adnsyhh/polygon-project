"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("positions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      matra: {
        type: Sequelize.STRING,
      },
      file_name: {
        type: Sequelize.STRING,
      },
      alamat: {
        type: Sequelize.TEXT,
      },
      provinsi: {
        type: Sequelize.STRING,
      },
      kota_kabupaten: {
        type: Sequelize.STRING,
      },
      kecamatan: {
        type: Sequelize.STRING,
      },
      kelurahan: {
        type: Sequelize.STRING,
      },
      kode_pos: {
        type: Sequelize.STRING,
      },
      dalam_kawasan: {
        type: Sequelize.BOOLEAN,
      },
      polygon: {
        type: Sequelize.GEOMETRY("POLYGON", 4326),
      },
      centroid: {
        type: Sequelize.GEOMETRY("POINT", 4326),
      },
      region_id: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("positions");
  },
};
