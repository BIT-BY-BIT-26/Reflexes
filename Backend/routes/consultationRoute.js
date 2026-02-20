const express = require("express");
const consultationRouter = express.Router();
const auth = require("../middleware/auth");
const { createConsultationRoom, getConsultationAppointment } = require("../controller/consultationRoom");

// doctor starts consultation
consultationRouter.post("/start", auth,createConsultationRoom);
consultationRouter.get("by-appointment/:appointmentId",getConsultationAppointment);

module.exports = consultationRouter;
