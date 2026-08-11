const express = require('express');
const { getRouteToHospital } = require('../controllers/locationController.js');
const { getHospitalStates, getHospitalCities, getHospitals, registerHospital, updateHospitalProfile, getHospitalProfile, getStats, getHospitalById } = require('../controllers/hospitalController.js');
const { hospitalUpload } = require('../middleware/uploadCloud.js');
const auth = require('../middleware/auth.js');
const { updateDoctorOpdSchedule } = require('../controllers/adminController.js');
const authorize = require('../middleware/authorize.js');
const { ROLE } = require('../config/role.js');

const route = express.Router();
route.get('/test', (req, res) => {
  console.log("test route hit");
  res.send("working");
});

route.get('/hospitals/states',getHospitalStates);
route.get('/hospitals/cities',getHospitalCities)
route.get('/hospitals',getHospitals)
route.post('/hospitals',registerHospital)
route.post("/route-to-hospital",getRouteToHospital);
route.patch('/profile',auth, hospitalUpload.fields([{name:"logo",maxCount:1},
    {name:"coverImage",maxCount:1},
    {name:"galleryImages",maxCount:10}
]),updateHospitalProfile)

route.get('/profile', auth, getHospitalProfile)
route.get("/hospitals/profile/:id", getHospitalById);
route.get('/statistics',auth,getStats);


//done
route.patch("/opd-schedule/:doctorId",auth,authorize(ROLE.admin),updateDoctorOpdSchedule);

 module.exports=route;