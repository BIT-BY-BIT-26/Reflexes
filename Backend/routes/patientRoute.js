const express = require('express');
const { registerPatient, getMyReports, getPatientAppointments, getMyProfile, updatePatientProfile, getPatientReportForDoctor, getPatientProfile } = require('../controllers/patientController');
const { ROLE } = require('../config/Role');
const auth = require('../middleware/auth');
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