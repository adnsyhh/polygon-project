require("dotenv").config();

module.exports = {
  development: {
    username: process.env.PG_USER || "postgres",
    password: process.env.PG_PASSWORD || "15maret2004",
    database: process.env.PG_DATABASE || "region_db",
    host: process.env.PG_HOST || "postgis",
    port: process.env.PG_PORT || "5432",
    dialect: "postgres",
  },
  production: {
    username: process.env.PG_USER || "postgres",
    password: process.env.PG_PASSWORD || "15maret2004",
    database: process.env.PG_DATABASE || "region_db",
    host: process.env.PG_HOST || "postgis",
    port: process.env.PG_PORT || "5432",
    dialect: "postgres",
  },
};
