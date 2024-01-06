// Require modules
const express = require("express");
const app = express();
const multer = require("multer");
const path = require("path");
const { defaultConfiguration } = require("./userRoute");


// Require custom middlewares
const authAdmin = require("../middlewares/authAdmin");

// Require admin Controllers
const adminController = require("../controllers/adminController");
const couponController = require("../controllers/couponController");


// Multer Configuration for  add productImgaes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, path.join(__dirname, '..', 'public', 'assets', 'productImages', 'uploadImages'));
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname}`)
    }
});
const upload = multer({ storage: storage, });

/// Multer Configuration for Coupon background
const couponStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'public', 'assets', 'couponBgImages'));
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const couponBgImageUpload = multer({ storage: couponStorage });


// set middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Set view engine
app.set('view engine', 'ejs');
app.set('views', './views/admin');



// -------------------------login----------------------
app.get('/', authAdmin.isLogout, adminController.login)
app.post('/', adminController.verifyLogin)

// ---------------------------Dashboard----------------------------
app.get('/dashboard', authAdmin.isLogin, adminController.dashboard);

// --------------------------Product-----------------------------
app.get('/products', authAdmin.isLogin, adminController.products);
app.get('/products/addProduct', authAdmin.isLogin, adminController.addProduct);
app.post('/products/addProduct', authAdmin.isLogin, upload.array("productImages", 4), adminController.insertProduct);
app.get('/products/editProduct/:productId', adminController.editProduct);
app.post('/products/editProduct', authAdmin.isLogin, upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 }

]), adminController.inserEditedProduct);
app.put('/products/hideProduct', authAdmin.isLogin, adminController.hideProduct);
app.put('/products/showProduct', authAdmin.isLogin, adminController.showProduct);

// ---------------------------User-------------------------
app.get('/users', authAdmin.isLogin, adminController.users);
app.put('/blockUser', authAdmin.isLogin, adminController.blockUser);
app.put('/UnBlockUser', authAdmin.isLogin, adminController.UnBlockUser);

// ---------------------------Category---------------------------
app.get('/category', authAdmin.isLogin, adminController.category);
app.post('/category', authAdmin.isLogin, adminController.insertCategory);
app.put('/category/editCategory', authAdmin.isLogin, adminController.editCategory);
app.put('/category/listCategory', authAdmin.isLogin, adminController.listCatogory);
app.put('/category/UnListCategory', authAdmin.isLogin, adminController.UnListCatogory);

// --------------------------Users Orders--------------------
app.get('/orders', authAdmin.isLogin, adminController.userOrders);
app.patch('/orders/changeStatus', authAdmin.isLogin, adminController.changeStatus);
app.put('/orders/requestAction', authAdmin.isLogin, adminController.requestAction);

//------------------------------Coupons-----------------------------
app.get('/coupons', authAdmin.isLogin, couponController.renderCoupon);
app.post('/addCoupon', authAdmin.isLogin, couponBgImageUpload.single('couponImage'), couponController.couponDetails);

// ---------------------------Logout-admin--------------------
app.get('/logout', authAdmin.isLogin, adminController.logout);

module.exports = app;