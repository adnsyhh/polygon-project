const { Sequelize } = require("sequelize");

const postgresSequelize = new Sequelize(
  process.env.PG_DATABASE,
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    dialect: "postgres",
    define: {
      schema: "public", // ✅ default schema PostgreSQL
    },
    logging: false,
  }
);

module.exports = postgresSequelize;
