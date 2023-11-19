const mongoose = require("mongoose");

const  userOtpSchema = new mongoose.Schema({
   userId:String,
   otp:String,
   createAt:Date,
   expiresAt:Date
    
}); 

module.exports = mongoose.model("user_otp",userOtpSchema);