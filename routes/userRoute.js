
const express = require("express");
const path = require('path');
const userController = require("../controllers/userController");

const app = express();


//View engine
app.set('view engine','ejs');
app.set('views','./views/users');

app.use(express.static('public'));

// SIGN-UP
app.get('/authentication', userController.authentication);
app.post('/authentication', userController.insertUser);

// HOME
app.get('/home', userController.home);


//OTP
app.get('/otpVerify',userController.renderOtp)
app.post('/otpVerify',userController.verifyOtp)


module.exports = app;