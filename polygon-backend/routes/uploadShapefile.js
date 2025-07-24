const express = require("express");
const router = express.Router();
const multer = require("multer");
const uploadShapefileController = require("../controllers/uploadShapefile.controller");

const upload = multer({ dest: "uploads/" });

router.post(
  "/",
  upload.fields([
    { name: "shp", maxCount: 1 },
    { name: "shx", maxCount: 1 },
    { name: "dbf", maxCount: 1 },
  ]),
  uploadShapefileController.handleUploadShapefile
);

module.exports = router;
