const multer = require("multer");
const path = require("path");

//  Require modules
const express = require("express");
const app = express();


// Require user Controllers
const userController = require("../controllers/userController");
const productController = require("../controllers/productController");
const cartControllers = require("../controllers/cartController");
const orderController = require("../controllers/orderController");
const couponController = require("../controllers/couponController");

// Static path set
app.use(
  express.static(path.join(__dirname, '..', 'public', 'assets', 'userImages', 'uploadImages'))
)

// Multer Configuration for user image 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, path.join(__dirname, '..', 'public', 'assets', 'userImages', 'uploadImages'));
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`)
  }
});
const upload = multer({ storage: storage, });


// Multer Configuration for Redund Request Images
const refundImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'assets', 'returnReasonImages'));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
});

const refundImageUpload = multer({ storage: refundImageStorage });

// Require custom middlewares
const authUser = require("../middlewares/AuthUser");

// Set view engine
app.set('view engine', 'ejs');
app.set('views', './views/users');
app.use(express.static('public'));

// ---------------------Home-----------------------
app.get('/', authUser.isLogout, userController.home);
app.get('/home', authUser.isLogin, userController.home);

// --------------------------------Signup--------------------------------
app.get('/authentication', authUser.isLogout, userController.authentication);
app.post('/authentication', userController.insertUser);

// --------------------------OTP-verification-------------------
app.get('/otpVerify', authUser.isLogout, userController.renderOtp);
app.post('/otpVerify', userController.verifyOtp);

// --------------------Login----------------
app.post('/login', userController.verifyLogin);

// ---------------------Login with OTP--------------------
app.get('/logOtp', authUser.isLogout, userController.logOtp);
app.post('/logOtp', userController.sendOtp);

// --------------------Product-listing------------------
app.get('/shop', authUser.noAuth, productController.shop);
app.get('/shop/productDetails/:productId', authUser.noAuth, productController.productDetails);

// -------------------CART-MANAGEMENT---------------------
app.get('/cart', authUser.isLogin, cartControllers.viewCart);
app.post('/shop/addProductCart', authUser.isLogin, cartControllers.addProductCart);
app.delete('/cart/removeProduct', authUser.isLogin, cartControllers.removeProduct);
app.patch('/cart/updateQuantity', authUser.isLogin, cartControllers.updateQuantity);

// -----------------------CHECKOUT-----------------------------
app.get('/cart/checkout', authUser.isLogin, userController.checkout);
app.post('/cart/placeOrder', authUser.isLogin, orderController.addOrder);
app.post('/cart/verifyPayment', authUser.isLogin, orderController.verifyPayment);


// ---------------------USER-ACCOUNT--------------------------
app.get('/account', authUser.isLogin, userController.userAccount);
app.post('/account/editUser', upload.single('userImage'), authUser.isLogin, userController.editUserData);
app.post('/account/addAddress', authUser.isLogin, userController.addAddress);
app.delete('/account/deleteAddress', authUser.isLogin, userController.deleteAddress);
app.patch('/account/editAddress', authUser.isLogin, userController.editAddress);

// ----------------------------------COUPONS-----------------------------------
app.post('/checkout/applyCoupon', authUser.isLogin, couponController.applyCoupon);
app.post('/checkout/cancelCoupon', authUser.isLogin, couponController.cancelCoupon);

// -----------------------------------Orders-----------------------------------------
app.delete('/account/cancelOrderItem', authUser.isLogin, orderController.cancelOrder);
app.post('/account/refundRequest', refundImageUpload.single('damageCakeImage'), authUser.isLogin, orderController.refundRequest);

// --------------------User-Logout---------------------
app.get('/logout', authUser.isLogin, userController.logout);

module.exports = app;