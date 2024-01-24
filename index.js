const dotenv = require("dotenv");
dotenv.config();
// ----------------------------

// Database connection
const mongoose  = require("mongoose");
mongoose.connect(process.env.DB_CONNECTION,console.log("db connected")).then("mongo sussess").catch("somrthing wrong");
// ----------------------------

//expess
const express = require("express");
const app = express();
const nocache = require("nocache");
const session = require("express-session")

// Session stuffs
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true 
}));

app.use(nocache());

// bodyParser
app.use(express.urlencoded({extended:true}))
app.use(express.json());


// User_Routes
const userRoute = require("./routes/userRoute");
app.use('/',userRoute);
 
// Admin_Routes
const adminRoute = require("./routes/adminRoute");
app.use('/admin',adminRoute);

app.listen(3000,()=>{
    console.log('Server running...')
});