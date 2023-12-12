// Require modules
const express = require("express");
const app = express();


// Require user Controllers
const userController = require("../controllers/userController");
const productController = require("../controllers/productController");
const cartControllers = require("../controllers/cartController");



// Require custom middlewares
const validation = require("../middlewares/validation");
const authUser = require("../middlewares/AuthUser");


// Set view engine
app.set('view engine','ejs');
app.set('views','./views/users');
app.use(express.static('public'));

// ---------------------Home--------------------
app.get('/',authUser.isLogout,userController.home);
app.get('/home',authUser.isLogin, userController.home);

// --------------------------------Signup--------------------------------
app.get('/authentication',authUser.isLogout,userController.authentication);
app.post('/authentication',validation.validateForm,userController.insertUser);

// --------------------------OTP-verification-------------------
app.get('/otpVerify',authUser.isLogout,userController.renderOtp);
app.post('/otpVerify',userController.verifyOtp);

// --------------------Login----------------
app.post('/login',userController.verifyLogin);

// ---------------------Login with OTP--------------------
app.get('/logOtp',authUser.isLogout,userController.logOtp);
app.post('/logOtp',userController.sendOtp);

// --------------------User-Logout---------------------
app.get('/logout',authUser.isLogin,userController.logout);

// --------------------Product-listing------------------
app.get('/shop',authUser.noAuth,productController.shop);

// --------------------------------------Product-Details-----------------------------------
app.get('/shop/productDetails/:productId',authUser.noAuth,productController.productDetails);

// ---------------------------------Add-Product-Cart---------------------------------
app.get('/addProductCart/:productId',authUser.isLogin,cartControllers.addProductCart);

// -------------------view-Cart-page--------------------
app.get('/cart',authUser.isLogin,cartControllers.viewCart);

// -------------------Remove-product--------------------
app.delete('/cart/removeProduct',authUser.isLogin,cartControllers.removeProduct);



module.exports = app;