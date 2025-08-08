const express = require("express");
const cors = require("cors");
// const fileUpload = require("express-fileupload");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const apiRoutes = require("./routes");
const swaggerDocument = YAML.load("./docs/swagger.yaml");
const errorHandler = require("./middlewares/errorHandler");
const notFoundHandler = require("./middlewares/notFoundHandler");

const app = express();

app.use(cors());
app.use(express.json());
// app.use(fileUpload());

app.use("/api", apiRoutes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check (opsional bisa pindah ke routes)
app.get("/", (req, res) => {
  res.send("Polygon API v1 aktif!");
});

// Error handling (gunakan middleware terpisah)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
