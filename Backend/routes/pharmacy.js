const express = require("express");
const { registerPharmacy, loginPharmacy, addMedicine } = require("../controllers/pharmacyController");
const auth = require("../middleware/auth");
const pharmacyRouter = express.Router();

pharmacyRouter.post("/signup",registerPharmacy);
pharmacyRouter.post("/login",loginPharmacy);
pharmacyRouter.post("/add-medicine",auth, addMedicine);
module.exports = pharmacyRouter;
<<<<<<< HEAD

// Added pharmacy analytics endpoint. Existing pharmacy routes above are unchanged.
pharmacyRouter.get(
  "/dashboard",
  auth,
  require("../controllers/pharmacyDashboardController").getPharmacyDashboard
);
=======
>>>>>>> b9e6f0f6bf88485b03619677651207f148e9f35e
