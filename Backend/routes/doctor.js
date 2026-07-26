const express = require("express");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const { ROLE } = require("../config/role");
const { getDoctorByHospital, submitProfile, getDoctorsByDepartment ,getMyProfile, getCompletedAppointments, updateProfile, toggleDoctorOnline, toggleOpd, uploadDoctorPhoto, getProfileStatus,getUniquePatients, getDoctorDashboard, startConsultation, stopConsultation, pauseConsultation, resumeConsultation, callNext, skipPatient } = require("../controllers/DoctorController");

const { addDoctor  } = require("../controllers/adminController");
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
doctorRouter.get(
  "/profile-status",
  auth,
  getProfileStatus
);

// Submit doctor profile
doctorRouter.post(
  "/doctor-profile",
  auth,
  authorize(ROLE.doctor),
  submitProfile
);

doctorRouter.post("/consultation/start",auth,startConsultation);
doctorRouter.post("/consultation/stop",auth,stopConsultation);
doctorRouter.post("/consultation/pause",auth,pauseConsultation);
doctorRouter.post("/consultation/resume",auth,resumeConsultation);
doctorRouter.post("/consultation/next",auth,callNext);
doctorRouter.post("/consultation/skip",auth,skipPatient);
//doctorRouter.get("/queue-status/:appointmentId",auth,getQueueStatus);
doctorRouter.post('/add-doctor',auth,authorize(ROLE.admin),addDoctor);
doctorRouter.get('/get-doctors',auth,authorize(ROLE.admin), getDoctorByHospital);
doctorRouter.get("/appointments/completed",auth,getCompletedAppointments);
doctorRouter.get("/me", auth, getMyProfile);
doctorRouter.get("/profile-status", auth, getProfileStatus);
doctorRouter.post("/submit-profile",auth,submitProfile);
doctorRouter.patch("/update-profile", auth, updateProfile);
doctorRouter.patch("/toggle-online", auth, toggleDoctorOnline);
doctorRouter.patch("/toggle-opd", auth, toggleOpd);
doctorRouter.patch("/upload-photo",auth, upload.single("photo"),uploadDoctorPhoto);
// doctorRouter.get("/all-completed",auth,getTotalCompletedAppointments);
// doctorRouter.get("/today-completed",auth,getTodayCompletedConsultations);
// doctorRouter.get("/today-new",auth,getTodayNewPatients);
// doctorRouter.get('/all-unique-counts',auth,getTotalUniquePatientsCounts);
doctorRouter.get('/all-unique',auth,getUniquePatients);
doctorRouter.get('/all-data',auth,getDoctorDashboard);

module.exports = doctorRouter;
