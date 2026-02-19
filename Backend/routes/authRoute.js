const express = require('express');
const { loginUser, getProfile, resetPassword } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { loginValidator } = require('../helper/validator');

const authRoute = express.Router();


authRoute.post('/user-login' ,loginValidator,loginUser)
authRoute.get("/me", auth, getProfile);
authRoute.post("/reset_password",resetPassword);

 module.exports=authRoute;