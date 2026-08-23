const express = require("express");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const { createEmergency } = require("../controllers/patientController");
const { updateEmergencyStatus } = require("../controllers/hospitalController");

const emergencyRoute = express.Router();
emergencyRoute.post(
  "/",auth,authorize("PATIENT"),createEmergency
);


emergencyRoute.patch(
  "/:emergencyId/status",
  auth,
  authorize("HOSPITAL_ADMIN"),
  updateEmergencyStatus
);


module.exports=emergencyRoute;