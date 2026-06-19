const express = require("express");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const { ROLE } = require("../config/role");
const { getDoctorByHospital, submitProfile, getDoctorsByDepartment ,getMyProfile, getCompletedAppointments, updateProfile, toggleDoctorOnline, toggleOpd, uploadDoctorPhoto } = require("../controllers/DoctorController");

const { addDoctor } = require("../controllers/addDoctorController");
const { upload } = require("../middleware/uploadCloud");
const doctorRouter = express.Router();

/* ================= ADMIN ROUTES ================= */


// Toggle doctor active/inactive
// doctorRouter.patch(
//   "/:id/toggle-status",
//   auth,
//   authorize(ROLE.admin),
//   toggleDoctorStatus
// );

/* ================= USER / PATIENT APP ================= */

//Get doctors by hospital + department
doctorRouter.get(
  "/hospital/:hospitalId/department/:departmentId",
  getDoctorsByDepartment
);

// Search patient (doctor only)
// doctorRouter.get(
//   "/see-patient",
//   auth,
//   authorize(ROLE.doctor),
//   searchPatient
// );

/* ================= DOCTOR PROFILE ================= */

// Check profile status
// doctorRouter.get(
//   "/profile-status",
//   auth,
//   getProfileStatus
// );

// Submit doctor profile
doctorRouter.post(
  "/doctor-profile",
  auth,
  authorize(ROLE.doctor),
  submitProfile
);
doctorRouter.post('/add-doctor',auth,  authorize(ROLE.admin),addDoctor);
doctorRouter.get('/get-doctors',auth,authorize(ROLE.admin), getDoctorByHospital);
doctorRouter.get("/appointments/completed",auth,getCompletedAppointments);
doctorRouter.get("/me", auth, getMyProfile);
doctorRouter.patch("/update-profile", auth, updateProfile);
doctorRouter.patch("/toggle-online", auth, toggleDoctorOnline);
doctorRouter.patch("/toggle-opd", auth, toggleOpd);
doctorRouter.patch("/upload-photo",auth, upload.single("photo"),uploadDoctorPhoto);
module.exports = doctorRouter;
