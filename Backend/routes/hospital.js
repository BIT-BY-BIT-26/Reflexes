

const express = require('express');
const { getRouteToHospital } = require('../controllers/locationController.js');
const { getHospitalStates, getHospitalCities, getHospitals, registerHospital, updateHospitalProfile, getHospitalProfile, getStats } = require('../controllers/hospitalController.js');
const { hospitalUpload } = require('../middleware/uploadCloud.js');
const auth = require('../middleware/auth.js');

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
route.get('/statistics',auth,getStats);



 module.exports=route;