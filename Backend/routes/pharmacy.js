const express = require("express");
const { registerPharmacy, loginPharmacy } = require("../controllers/pharmacyController");
const pharmacyRouter = express.Router();

pharmacyRouter.post("/register", registerPharmacy);
pharmacyRouter.post("/login", loginPharmacy);

module.exports = pharmacyRouter;
