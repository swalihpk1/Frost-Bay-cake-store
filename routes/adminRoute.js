const express = require("express");
const app = express();
const adminController = require("../controllers/adminController");


app.use(express.json());
app.use(express.urlencoded({extended:true})); 

app.set('view engine','ejs');
app.set('views','./views/admin');

// Dashboard
app.get('/',adminController.dashboard);

//Products
app.get('/products',adminController.products);

//Users
app.get('/users',adminController.users);

//Block User
app.put('/blockUser',adminController.blockUser);

//Unblock User
app.put('/UnBlockUser',adminController.UnBlockUser);




module.exports = app;