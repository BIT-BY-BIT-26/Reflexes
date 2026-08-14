const express = require("express");

const memoryUpload = require("../middleware/memoryUpload");
const { analyzeMedicine } = require("../controllers/medicineController");

const medicineRouter = express.Router();


medicineRouter.post(
  "/analyze",
  memoryUpload.single("image"),
  analyzeMedicine
);


module.exports = medicineRouter;