const express = require("express");
const consultationRouter = express.Router();
const auth = require("../middleware/auth");
const { createConsultationRoom, getConsultationAppointment, startConsultation } = require("../controllers/consultationRoom");

consultationRouter.post("/start", auth,createConsultationRoom);
consultationRouter.get("/by-appointment/:appointmentId",getConsultationAppointment);

consultationRouter.patch("/start-consultation/:appointmentId",startConsultation);

module.exports = consultationRouter;
