const express = require("express");
const { registerPharmacy, loginPharmacy, addMedicine, getAvailablePharmacies } = require("../controllers/pharmacyController");
const auth = require("../middleware/auth");
const { getMedicinesByPharmacy } = require("../controllers/medicineController");
const pharmacyRouter = express.Router();

pharmacyRouter.post("/signup",registerPharmacy);
pharmacyRouter.post("/login",loginPharmacy);
pharmacyRouter.post("/add-medicine",auth, addMedicine);
pharmacyRouter.get("/available",getAvailablePharmacies);
pharmacyRouter.get("/medicine/:pharmacyId",getMedicinesByPharmacy);

module.exports = pharmacyRouter;
