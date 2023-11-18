const { name } = require("ejs");
const User = require("../models/usersModel");
const bcrypt = require("bcrypt");

// ----------Signup-&-Login------------
const authentication = async (req, res) => {
    try {

        res.render('signup-&-login');

    } catch (error) {
        console.log(error.message);
    }
}
// ----------Secure-password(bcrypt)------------
const securePassword = async(password)=>{
    try {
        const passwordHash = await bcrypt.hash(password,10);
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
            password:securepassword,
            confirmPassword: req.body.confirmPassword,
            phone: req.body.phone,
            location: req.body.location
        });
        const userData = await user.save();

        if (userData) {
            res.render('home',{user:userData})
        } else {
            res.render('signup-&-login', { message: "Signup failed" });
        }

    } catch (error) {
        console.log(error.message);
    }
}


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
    insertUser
    // login,
    // verifyLogin,
    // logout,

}