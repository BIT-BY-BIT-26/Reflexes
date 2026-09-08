const express = require("express");
const { registerPharmacy, loginPharmacy, addMedicine, getAvailablePharmacies,getMyInventory} = require("../controllers/pharmacyController");
const auth = require("../middleware/auth");
const { getMedicinesByPharmacy } = require("../controllers/medicineController");
const authorize = require("../middleware/authorize");
const { ROLE } = require("../config/role");
const pharmacyRouter = express.Router();

pharmacyRouter.post("/signup",registerPharmacy);
pharmacyRouter.post("/login",loginPharmacy);
pharmacyRouter.post("/add-medicine",auth, addMedicine);
pharmacyRouter.get("/available",getAvailablePharmacies);
pharmacyRouter.get("/medicine/:pharmacyId",getMedicinesByPharmacy);
// Added pharmacy analytics endpoint. Existing pharmacy routes above are unchanged.
pharmacyRouter.get(
  "/dashboard",
  auth,
  require("../controllers/pharmacyDashboardController").getPharmacyDashboard
);
// pharmacyRouter.get("/my-inventory", auth, authorize(ROLE.pharmacy), getMyInventory);
module.exports = pharmacyRouter;


