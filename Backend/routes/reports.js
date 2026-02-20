const express = require('express');
const auth = require('../middleware/auth');
const { ROLE } = require('../config/Role');
const authorize = require('../middleware/authorize');
const { uploadReport, shareReport } = require('../controller/reportController');
const upload = require('../middleware/uploadCloud');
const reportsRoute = express.Router();

reportsRoute.post('/upload-report',auth,upload.single("file"),uploadReport);
reportsRoute.get('/get-report-patient',auth,  );
reportsRoute.patch('/share-report/:reportId',auth, shareReport);
module.exports=reportsRoute;