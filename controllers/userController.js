const { name } = require("ejs");
const User = require("../models/usersModel");
const bcrypt = require("bcrypt");
const userOtpVerification = require("../models/userOtpModel")
const nodemailer = require("nodemailer");
const { verify, Verify } = require("crypto");
const { REFUSED } = require("dns");
const { ObjectId } = require("bson");
const { emit } = require("process");
const { statfsSync } = require("fs");


// nodemailer stuffs
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: 'ketl pkrp qftk mqeb'
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

        const { signupEmail } = req.body;
        const userCheck = await User.findOne({ email: signupEmail });
        if (userCheck) {
            return res.render("signup-&-login", {
                message: "User already exist, please login"
            });
        }

        const securepassword = await securePassword(req.body.signupPassword)
        const user = new User({
            name: req.body.name.trim(),
            email: req.body.signupEmail,
            password: securepassword,
            confirmPassword: req.body.confirmPassword,
            phone: req.body.phone,
            location: req.body.location
        });

        const userData = await user.save().then((result) => {
            sendOtpVerification(result, res);

        })
    } catch (error) {
        console.log(error.message);
    }
}

// -------SEND-OTP-FOR-SIGNUP------
const sendOtpVerification = async ({ _id, email }, res) => {

    try {

        const otp = `${100000 + Math.floor(Math.random() * 900000)}`;
        console.log("SendOtp" + otp);
        // Send the OTP to the user's email
        const mailOptions = {
            from: process.env.EMAIL_ADDRESS,
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP is: ${otp}`,
        };

        const hashedOtp = await bcrypt.hash(otp, 10);
        const newUserOtp = new userOtpVerification({
            userId: _id,
            otp: hashedOtp,
            createAt: Date.now(),
            expiresAt: Date.now() + 300000
        });

        await newUserOtp.save();
        await transporter.sendMail(mailOptions);

        const userId = _id
        res.redirect(`/otpVerify?id=${userId}`);


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


// -------Verifying-otp--------
const verifyOtp = async (req, res) => {
    try {

        const userId = req.query.id
        const otp = req.body.a + req.body.b + req.body.c + req.body.d + req.body.e + req.body.f;
        console.log(otp);
        const user = await userOtpVerification.findOne({ userId });
        const otpHash = await bcrypt.compare(otp, user.otp);
        console.log(otpHash);
        if (otpHash == true) {
            req.session.user_id = user._id;
            res.redirect('/home');
        } else {
            res.render('otp', { message: "Enter valid OTP" })
        }


    } catch (error) {
        console.log(error.message);
    }
}

// ------Verify-Login------
const verifyLogin = async (req, res) => {

    try {
        const email = req.body.loginEmail;
        const password = req.body.loginPassword;
        const userData = await User.findOne({ email });
        // console.log(userData);                  /*-------------------*/


        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                req.session.user_id = userData._id;
                res.redirect('/home');

            } else {
                res.render('signup-&-login', { message: "Incorrect username or password" });
            }

        } else {
            res.render('signup-&-login', { message: "Incorrect username or password" });
        }
    } catch (error) {
        console.log(error.message);
    }
}

// ------Resend-Otp-----
const logOtp = async (req, res) => {
    try {
        res.render('logOtp')
    } catch (error) {
        console.log(error.message);
    }
}

//------Send-Otp-From-login-----
const sendOtp = async (req, res) => {
    try {
        const resendEmail = req.body.resendEmail;
        const user = await User.findOne({ email: resendEmail })
        if (user) {
            sendOtpVerification(user, res)
        } else {
            res.render('logOtp', { message: "User not exist, please signup" });
        }
    } catch (error) {
        console.log(error.message);
    }
}

// -----Home------
const home = async (req, res) => {
    try{
        const id = req.session.user_id
        const user = await User.findOne({_id:id});
        res.render('home',{user:user});
    } catch (error) {
        console.log(error.message);
    }
}

// -------Logout-----
const logout = async (req, res) => {
    try {

        req.session.destroy();
        res.redirect(`/`);

    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    authentication,
    home,
    insertUser,
    renderOtp,
    verifyOtp,
    verifyLogin,
    logOtp,
    sendOtp,
    logout

}