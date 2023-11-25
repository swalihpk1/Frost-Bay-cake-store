
const express = require("express");
const userController = require("../controllers/userController");
const validation = require("../middlewares/validation");
const authUser = require("../middlewares/AuthUser");

const app = express();


//View engine
app.set('view engine','ejs');
app.set('views','./views/users');

app.use(express.static('public'));

app.get('/',authUser.isLogout,userController.home);

// SIGN-UP
app.get('/authentication',authUser.isLogout,userController.authentication);
app.post('/authentication',validation.validateForm,userController.insertUser);

// HOME
app.get('/home',authUser.isLogin, userController.home);


//OTP
app.get('/otpVerify',authUser.isLogout,userController.renderOtp);
app.post('/otpVerify',userController.verifyOtp);

// LOGIN
app.post('/login',userController.verifyLogin);

//RESEND-OTP
app.get('/logOtp',authUser.isLogout,userController.logOtp);
app.post('/logOtp',userController.sendOtp);

//LOGOUT
app.get('/logout',authUser.isLogin,userController.logout);


module.exports = app;