const express = require("express");
const { registerPharmacy, loginPharmacy, addMedicine } = require("../controllers/pharmacyController");
const auth = require("../middleware/auth");
const pharmacyRouter = express.Router();

pharmacyRouter.post("/signup",registerPharmacy);
pharmacyRouter.post("/login",loginPharmacy);
pharmacyRouter.post("/add-medicine",auth, addMedicine);
module.exports = pharmacyRouter;
