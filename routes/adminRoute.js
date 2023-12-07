const express = require("express");
const app = express();
const adminController = require("../controllers/adminController");
const multer = require("multer");
const path = require("path");
const authAdmin = require("../middlewares/authAdmin");


app.use(express.json());

app.use(
    express.static(path.join(__dirname, '..', 'public', 'assets', 'productImages', 'uploadImages'))
)

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, path.join(__dirname, '..', 'public', 'assets', 'productImages', 'uploadImages'));
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname}`)
    }
});

const upload = multer({ storage: storage, });

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', './views/admin');

// Render Login
app.get('/',authAdmin.isLogout,adminController.login)

// VerifyLogin
app.post('/',adminController.verifyLogin)

// Dashboard
app.get('/dashboard',authAdmin.isLogin,adminController.dashboard);

//Products
app.get('/products',authAdmin.isLogin, adminController.products);

//Users
app.get('/users',authAdmin.isLogin,adminController.users);

//Block User
app.put('/blockUser', adminController.blockUser);

//Unblock User
app.put('/UnBlockUser', adminController.UnBlockUser);

// Add products page
app.get('/products/addProduct', adminController.addProduct);


//Store Products in DB
app.post('/products/addProduct', upload.array("productImages",4),adminController.insertProduct);

//Render 
app.get('/category',authAdmin.isLogin,adminController.category);

//Add Category
app.post('/category', adminController.insertCategory);

//Edit category
app.put('/category/editCategory', adminController.editCategory);

//List Category
app.put('/category/listCategory', adminController.listCatogory);

//Unlist Category
app.put('/category/UnListCategory', adminController.UnListCatogory);


// Render edit products
app.get('/products/editProduct/:productId', adminController.editProduct);

// Inser edited products
app.post('/products/editProduct', upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 }

]), adminController.inserEditedProduct);

//Hide Product
app.put('/products/hideProduct', adminController.hideProduct);

//Show Product
app.put('/products/showProduct', adminController.showProduct);

//Log-Out
app.get('/logout',authAdmin.isLogin,adminController.logout);

module.exports = app;