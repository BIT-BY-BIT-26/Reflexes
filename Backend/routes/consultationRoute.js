const express = require("express");
const consultationRouter = express.Router();
const auth = require("../middleware/auth");
const { createConsultationRoom, getConsultationAppointment } = require("../controllers/consultationRoom");

consultationRouter.post("/start", auth,createConsultationRoom);
consultationRouter.get("by-appointment/:appointmentId",getConsultationAppointment);

module.exports = consultationRouter;
