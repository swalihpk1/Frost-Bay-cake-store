const dotenv = require("dotenv");
dotenv.config();

// Database connection
const mongoose  = require("mongoose");
mongoose.connect(process.env.DB_CONNECTION,console.log("DB connected"));

//expess
const express = require("express");
const app = express();

// bodyParser
app.use(express.json());
app.use(express.urlencoded({extended:true}))

// User_Routes
const userRoute = require("./routes/userRoute");
const { urlencoded } = require("body-parser");
const bodyParser = require("body-parser");
app.use('/',userRoute);
 

app.listen(7001,()=>{
    console.log('Server running...')
});