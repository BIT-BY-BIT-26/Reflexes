const express = require('express');
const { registerPatient, getDailyPatientsWithDetails, getMyReports, getPatientAppointments, getMyProfile, updatePatientProfile } = require('../controllers/patientController');
const { ROLE } = require('../config/Role');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const patientRoute = express.Router();

patientRoute.post('/register',registerPatient);
patientRoute.get("/hospital/daily-patients",getDailyPatientsWithDetails );
patientRoute.patch('/update-patient-profile',auth, updatePatientProfile);
patientRoute.get("/me",auth,authorize(ROLE.patient),getMyProfile);
patientRoute.get('/get-appointments/:patientId',auth,getPatientAppointments);
patientRoute.get('/get-my-reports',auth,authorize(ROLE.patient), getMyReports);

module.exports=patientRoute;