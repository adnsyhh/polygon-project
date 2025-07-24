"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("Polygons", "name", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("Polygons", "latitude", {
      type: Sequelize.FLOAT,
    });
    await queryInterface.addColumn("Polygons", "longitude", {
      type: Sequelize.FLOAT,
    });
    await queryInterface.addColumn("Polygons", "id_region", {
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn("Polygons", "region_name", {
      type: Sequelize.STRING,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("Polygons", "name");
    await queryInterface.removeColumn("Polygons", "latitude");
    await queryInterface.removeColumn("Polygons", "longitude");
    await queryInterface.removeColumn("Polygons", "id_region");
    await queryInterface.removeColumn("Polygons", "region_name");
  },
};
