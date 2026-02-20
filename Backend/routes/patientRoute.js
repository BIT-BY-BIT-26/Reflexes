const express = require('express');
const { registerPatient, getPatientProfile, updatePatientProfile, getMyProfile, getPatientAppointments, getMyReports, getPatientReportForDoctor } = require('../controllers/patientController');
const auth = require('../middleware/auth');
const { ROLE } = require('../config/Role');
const authorize = require('../middleware/authorize');

const patientRoute = express.Router();

patientRoute.post('/register',registerPatient);
patientRoute.get('/get-patient-profile/:patientId',getPatientProfile);
patientRoute.patch('/update-patient-profile',auth, updatePatientProfile);
patientRoute.get("/me",auth,authorize(ROLE.patient),getMyProfile);
patientRoute.get('/get-appointments/:patientId',auth,getPatientAppointments);
patientRoute.get('/get-my-reports',auth,authorize(ROLE.patient), getMyReports);
patientRoute.get('/get-reports/:patientId',auth, getPatientReportForDoctor);

module.exports=patientRoute;