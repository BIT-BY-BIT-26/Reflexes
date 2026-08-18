const express = require("express");
const consultationRouter = express.Router();
const auth = require("../middleware/auth");
const { startConsultation, stopConsultation, pauseConsultation, resumeConsultation, skipPatient, callNext, getCurrentPatient } = require("../controllers/DoctorController");
// consultationRouter.post("/start", auth,createConsultationRoom);
// consultationRouter.get("/by-appointment/:appointmentId",getConsultationAppointment);


consultationRouter.get("/current-patient",auth,getCurrentPatient);
consultationRouter.patch("/start-consultation/:appointmentId",auth,startConsultation);
consultationRouter.patch("/stop-consultation/:appointmentId",auth,stopConsultation);
consultationRouter.patch("/pause-consultation/:appointmentId",auth,pauseConsultation);
consultationRouter.patch("/resume-consultation/:appointmentId",auth,resumeConsultation);
consultationRouter.patch("/skip-consultation/:appointmentId",auth,skipPatient);
consultationRouter.patch("/call-next",auth,callNext);
module.exports = consultationRouter;
