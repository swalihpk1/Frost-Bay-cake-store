const multer = require("multer");
const path = require("path");

//  Require modules
const express = require("express");
const app = express();


// Require user Controllers
const userController = require("../controllers/userController");
const productController = require("../controllers/productController");
const cartControllers = require("../controllers/cartController");
const orderController = require("../controllers/orderController")

// Static path set
app.use(
    express.static(path.join(__dirname, '..', 'public', 'assets', 'userImages', 'uploadImages'))
)

// Multer Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, path.join(__dirname, '..', 'public', 'assets', 'userImages', 'uploadImages'));
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname}`)
    }
});
const upload = multer({ storage: storage, });




// Require custom middlewares
const authUser = require("../middlewares/AuthUser");


// Set view engine
app.set('view engine','ejs');
app.set('views','./views/users');
app.use(express.static('public'));

// ---------------------Home-----------------------
app.get('/',authUser.isLogout,userController.home);
app.get('/home',authUser.isLogin, userController.home);

// --------------------------------Signup--------------------------------
app.get('/authentication',authUser.isLogout,userController.authentication);
app.post('/authentication',userController.insertUser);

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
app.get('/shop/productDetails/:productId',authUser.noAuth,productController.productDetails);
app.get('/shop/addProductCart/:productId',authUser.isLogin,cartControllers.addProductCart);

// -------------------CART-MANAGEMENT---------------------
app.get('/cart',authUser.isLogin,cartControllers.viewCart);
app.delete('/cart/removeProduct',authUser.isLogin,cartControllers.removeProduct);
app.patch('/cart/updateQuantity',authUser.isLogin,cartControllers.updateQuantity);

// -----------------------CHECKOUT-----------------------------
app.get('/cart/checkout', authUser.isLogin, userController.checkout);
app.post('/cart/placeOrder', authUser.isLogin, orderController.addOrder);
app.post('/cart/verifyPayment', authUser.isLogin, orderController.verifyPayment);


// ---------------------USER-ACCOUNT--------------------------
app.get('/account',authUser.isLogin,userController.userAccount);
app.post('/account/editUser',upload.single('userImage'),authUser.isLogin,userController.editUserData);
app.post('/account/addAddress',authUser.isLogin,userController.addAddress);
app.delete('/account/deleteAddress',authUser.isLogin,userController.deleteAddress);
app.patch('/account/editAddress', authUser.isLogin, userController.editAddress);

// -----------------------------------Orders-----------------------------------------
app.delete('/account/deleteOrderItem', authUser.isLogin, orderController.cancelOrder);



module.exports = app;