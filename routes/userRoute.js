
const express = require("express");
const path = require('path');
const userController = require("../controllers/userController");
const validation = require("../middlewares/validation")

const app = express();


//View engine
app.set('view engine','ejs');
app.set('views','./views/users');

app.use(express.static('public'));

// SIGN-UP
app.get('/authentication', userController.authentication);
app.post('/authentication',validation.validateForm,userController.insertUser);

// HOME
app.get('/home', userController.home);


//OTP
app.get('/otpVerify',userController.renderOtp);
app.post('/otpVerify',userController.verifyOtp);

// LOGIN
app.post('/login',userController.verifyLogin);

//RESEND-OTP
app.get('/resendOtp',userController.resendOtp);
app.post('/resendOtp',userController.sendOtp)



module.exports = app;