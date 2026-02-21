const express = require("express");
const consultationRouter = express.Router();
const auth = require("../middleware/auth");
const { createConsultationRoom, getConsultationAppointment, startConsultation, startOnlineConsultation } = require("../controllers/consultationRoom");

consultationRouter.post("/start", auth,startConsultation);
consultationRouter.get("/by-appointment/:appointmentId",getConsultationAppointment);
consultationRouter.post("/start-online", auth, startOnlineConsultation);
module.exports = consultationRouter;
