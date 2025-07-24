"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("polygons", "region_id", {
      type: Sequelize.STRING(16),
      allowNull: true, // nullable biar bisa diisi belakangan
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("polygons", "region_id");
  },
};
