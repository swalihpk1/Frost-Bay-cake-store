const express = require("express");
const app = express();
const adminController = require("../controllers/adminController");


app.use(express.json());
app.use(express.urlencoded({extended:true})); 

app.set('view engine','ejs');
app.set('views','./views/admin');


app.get('/',adminController.dashboard);

app.get('/products',adminController.products);

app.get('/users',adminController.users);



module.exports = app;