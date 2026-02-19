
const express = require('express');
const { getHospitalStates, getHospitalCities, getHospitals, registerHospital } = require('../controllers/hospitalController.js');

const route = express.Router();

route.get('/hospitals/states',getHospitalStates);
route.get('/hospitals/cities',getHospitalCities)
route.get('/hospitals',getHospitals)
route.post('/hospitals',registerHospital)

 module.exports=route;