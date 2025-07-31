const express = require("express");
const router = express.Router();
const PositionController = require("../controllers/position.controller");

// Endpoint CRUD untuk positions
router.post("/", PositionController.createPosition);
router.get("/", PositionController.getAllPositions);
router.get("/:id", PositionController.getPositionById);
router.put("/:id", PositionController.updatePosition);
router.delete("/:id", PositionController.deletePosition);

module.exports = router;
