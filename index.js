const mongoose  = require("mongoose");
mongoose.connect("mongodb://localhost:27017/Frost-Bay");

const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}))

// User_Routes
const userRoute = require("./routes/userRoute");
const { urlencoded } = require("body-parser");
app.use('/',userRoute);
 

app.listen(7001,()=>{
    console.log('Server running...')
});