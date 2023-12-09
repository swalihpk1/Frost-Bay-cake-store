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


// Static path set
app.use(
    express.static(path.join(__dirname, '..', 'public', 'assets', 'productImages', 'uploadImages'))
)


// Multer Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, path.join(__dirname, '..', 'public', 'assets', 'productImages', 'uploadImages'));
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname}`)
    }
});
const upload = multer({ storage: storage, });


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
app.post('/products/addProduct', upload.array("productImages", 4), adminController.insertProduct);
app.get('/products/editProduct/:productId', adminController.editProduct);
app.post('/products/editProduct', upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 }

]), adminController.inserEditedProduct);
app.put('/products/hideProduct', adminController.hideProduct);
app.put('/products/showProduct', adminController.showProduct);

// ---------------------------User-------------------------
app.get('/users', authAdmin.isLogin, adminController.users);
app.put('/blockUser', adminController.blockUser);
app.put('/UnBlockUser', adminController.UnBlockUser);

// ---------------------------Category---------------------------
app.get('/category', authAdmin.isLogin, adminController.category);
app.post('/category', adminController.insertCategory);
app.put('/category/editCategory', adminController.editCategory);
app.put('/category/listCategory', adminController.listCatogory);
app.put('/category/UnListCategory', adminController.UnListCatogory);

// ---------------------------Logout-admin-------------------------
app.get('/logout', authAdmin.isLogin, adminController.logout);

module.exports = app;