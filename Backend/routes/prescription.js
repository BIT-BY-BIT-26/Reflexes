const express = require('express');
const { createPrescription, getPatientPrescriptionsForDoctor, getPrescriptionByAppointment } = require('../controllers/prescriptionController');

const auth = require('../middleware/auth');
const { ROLE } = require('../config/Role');
const authorize = require('../middleware/authorize');
const prescriptionRoute = express.Router();

prescriptionRoute.post('/create-prescription',auth, authorize(ROLE.doctor), createPrescription);
prescriptionRoute.get('/get-prescription/:patientId',auth,  getPatientPrescriptionsForDoctor);
prescriptionRoute.get('/get-prescription/appointment/:appointmentId',auth, getPrescriptionByAppointment);


module.exports=prescriptionRoute;