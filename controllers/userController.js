const { name } = require("ejs");
const User = require("../models/usersModel");
const bcrypt = require("bcrypt");
const userOtpVerification = require("../models/userOtpModel")
const nodemailer = require("nodemailer");
const { verify, Verify } = require("crypto");
const { REFUSED } = require("dns");

// nodemailer stuffs
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_ADDRESS, 
        pass:'ketl pkrp qftk mqeb' 
    },
});



// ----------Signup-&-Login------------
const authentication = async (req, res) => {
    try {

        res.render('signup-&-login');

    } catch (error) {
        console.log(error.message);
    }
}
// ----------Secure-password(bcrypt)------------
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;

    } catch (error) {
        console.log(error.message);
    }
}


// ----------Insert-Userdata------------
const insertUser = async (req, res) => {
    try {

        const securepassword = await securePassword(req.body.signupPassword)
        const user = new User({
            name: req.body.name,
            email: req.body.signupEmail,
            password: securepassword,
            confirmPassword: req.body.confirmPassword,
            phone: req.body.phone,
            location: req.body.location
        });
        
        const userData = await user.save().then((result)=>{
            sendOtpVerification(result,res);
            
        })
    } catch (error) {
        console.log(error.message);
    }
}

// -------SEND-OTP------
const sendOtpVerification = async ({_id,email},res) => {
   
    try {
    
        const otp = `${100000 + Math.floor(Math.random() * 900000)}`;
        // Send the OTP to the user's email
        const mailOptions = {
            from: process.env.EMAIL_ADDRESS,
            to: 'nisunasih135@gmail.com',
            subject: 'OTP Verification',
            text: `Your OTP is: ${otp}`,
        };
        

        const saltRound = 10;
        const hashedOtp = await bcrypt.hash(otp,saltRound);
        const newUserOtp = new userOtpVerification({
            userId:_id,
            otp:hashedOtp,
            createAt:Date.now(),
            expiresAt:Date.now()+300000  
        });

        await newUserOtp.save();
        await transporter.sendMail(mailOptions);

        res.redirect('/otpVerify');
        
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}

//------Render-OTP-------
const renderOtp = async (req, res) => {
    try {
        res.render('otp');
    } catch (error) {
        console.log(error.message);
    }
}

// -------Verifying-otp-------
const verifyOtp = async(req,res)=>{
    try {
        console.log(req.body);
        const otp = req.body.a+req.body.b+req.body.c+req.body.d+req.body.e
        const sendOtp = User.db.findById()

    } catch (error) {
        console.log(error.message);
    }
}

// -----Home------
const home = async (req, res) => {
    try {
        res.render('home');

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    authentication,
    home,
    insertUser,
    renderOtp,
    verifyOtp
    // login,
    // verifyLogin,
    // logout,

}