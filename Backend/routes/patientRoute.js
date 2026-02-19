const express = require('express');
const { registerPatient } = require('../controllers/patientController');

const patientRoute = express.Router();

patientRoute.post('/register',registerPatient);

module.exports=patientRoute;