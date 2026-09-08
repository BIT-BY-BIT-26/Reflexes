const express = require("express");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const { createEmergency, getEmergencyById, cancelEmergency, getActiveEmergency } = require("../controllers/patientController");
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

emergencyRoute.get(
  "/active",
  auth,
  authorize("PATIENT"),
  getActiveEmergency
);

emergencyRoute.get(
  "/:emergencyId",
  auth,
  authorize("PATIENT"),
  getEmergencyById
);


emergencyRoute.patch(
  "/:emergencyId/cancel",
  auth,
  authorize("PATIENT"),
  cancelEmergency
);


module.exports=emergencyRoute;