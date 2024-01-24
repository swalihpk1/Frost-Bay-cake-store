
const User = require("../models/usersModel");
const bcrypt = require("bcrypt");
const userOtpVerification = require("../models/userOtpModel")
const nodemailer = require("nodemailer");
const path = require("path");
const Sharp = require("sharp");
const Address = require("../models/addressModel")
const Orders = require("../models/ordersModel")
const Coupons = require("../models/couponModel")




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
        res.render('404');
    }
}

// ----------Secure-password(bcrypt)------------
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;

    } catch (error) {
        res.render('404');
    }
}

// ----------Insert-Userdata------------
const insertUser = async (req, res) => {
    try {

        const { signupEmail } = req.body;
        const userCheck = await User.findOne({ email: signupEmail });
        if (userCheck) {
            return res.render("signup-&-login", {
                signMessage: "User already exist, please login"
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
        res.render('404');
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
        res.render('404');
        res.status(500).send('Internal Server Error');
    }
}

//------Render-OTP-Page------
const renderOtp = async (req, res) => {
    try {
        res.render('otp');
    } catch (error) {
        res.render('404');
    }
}


// -------Verifying-otp--------
const verifyOtp = async (req, res) => {
    try {
        const userId = req.query.id;
        const otp = req.body.a + req.body.b + req.body.c + req.body.d + req.body.e + req.body.f;

        console.log('Entered OTP:', otp);

        const user = await userOtpVerification.findOne({ userId });
        const otpHash = await bcrypt.compare(otp, user.otp);

        console.log('OTP Hash:', otpHash);

        if (otpHash === true) {
            req.session.user_id = userId;

            console.log('Session data after setting user_id:', req.session);

            res.redirect('/home');
        } else {
            res.render('otp', { message: 'Enter valid OTP' });
        }
    } catch (error) {
        console.log(error.message);
        res.render('404');
    }
};


// ------Verify-Login------
const verifyLogin = async (req, res) => {

    try {
        const email = req.body.loginEmail;
        const password = req.body.loginPassword;
        const userData = await User.findOne({ email });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                req.session.user_id = userData._id;
                res.redirect('/home');

            } else {
                res.render('signup-&-login', { logMessage: "Incorrect username or password" });
            }

        } else {
            res.render('signup-&-login', { logMessage: "Incorrect username or password" });
        }
    } catch (error) {
        res.render('404');
    }
}

// ------Resend-Otp-----
const logOtp = async (req, res) => {
    try {
        res.render('logOtp')
    } catch (error) {
        res.render('404');
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
        res.render('404');
    }
}

// -----Render-Home------
const home = async (req, res) => {
    try {
        const message = req.query.message;
        const userId = req.session.user_id;

        const user = await User.findOne({ _id: userId })
        if (user) {
            const userWithcart = await User.findOne({ _id: userId }).populate({ path: 'cart.productId', model: 'products' });
            const cartSum = user.cart.reduce((total, cartItem) => total + (cartItem.price * cartItem.quantity), 0);
            const totalProductsInCart = user.cart.reduce((total, cartItem) => total + cartItem.quantity, 0);

            res.render('home', {
                user: userWithcart,
                message: message,
                currentPath: "/home",
                cartSum: cartSum,
                totalProductsCart: totalProductsInCart
            });
        } else {

            res.render('home', {
                user: null,
                message: message,
                currentPath: "/home",
                cartSum: 0,
                totalProductsCart: 0
            });
        }
    } catch (error) {
        console.log(error.message);
        res.render('404');
    }
};



//  ----------Render-User-Account-----
const userAccount = async (req, res) => {
    try {

        const userId = req.session.user_id;
        const coupons =  await Coupons.find({})
        const orders = await Orders.find({ userId: userId }).sort({ createdAt: -1 });
        const user = await User.findOne({ _id: userId })
        const address = await Address.find({ user: userId })
        const userDetails = await User.populate(user, { path: 'cart.productId', model: 'products' });
        const cartSum = user.cart.reduce((total, cartItem) => total + (cartItem.price * cartItem.quantity), 0);
        const totalProductsCart = user.cart.reduce((total, cartItem) => total + cartItem.quantity, 0);
        res.render('userAccount', { user: userDetails,address,orders,coupons,cartSum,totalProductsCart});
    } catch (error) {
          console.log(error.message);
        res.render('404');
    }
}

//  -------Edit-User-Data--------
const editUserData = async (req, res) => {
    try {
        let imageName;

        const file = req.file;

        if (file) {
            const imagePath = path.join(__dirname, '..', 'public', 'assets', 'userImages', 'uploadImages', file.filename);
            const resizedImagePath = path.join(__dirname, '..', 'public', 'assets', 'userImages', 'croppedImages', file.filename);

            await Sharp(imagePath)
                .resize({ width: 100, height: 100 })
                .toFile(resizedImagePath);

            imageName = path.basename(file.filename);
        } else {
            const userId = req.session.user_id;
            const existingUser = await User.findById(userId);
            imageName = existingUser.userImage;
        }

        const userId = req.session.user_id;

        const updatedUser = await User.findByIdAndUpdate(userId, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            userImage: imageName,
            location: req.body.location
        });

        if (updatedUser) {
            res.json({ success: true, message: 'Update successful!' });
        }
        res.json({ success: false, message: 'Update failed!' });
    } catch (error) {
          console.log(error.message);
        res.render('404');
    }
};

// --------------Add-ddress------------
const addAddress = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const address = new Address({
            user: userId,
            name: req.body.name,
            companyName: req.body.companyName,
            country: req.body.country,
            houseName: req.body.houseName,
            appartmentNumber: req.body.appartment,
            city: req.body.city,
            state: req.body.state,
            zipcode: req.body.postcode,
            phone: req.body.phone,
            email: req.body.email,
            default: req.body.isDefault
        });


        if (address.default == true) {
            await Address.updateMany(
                { user: userId, _id: { $ne: address._id } },
                { $set: { default: false } }
            );
        }

        const newAddress = await address.save()

        if (newAddress) {
            res.json({ success: true, message: 'Address addedd!' });
            return;
        }

        res.json({ success: false, message: ' something went wrong' });
        return;

    } catch (error) {
          console.log(error.message);
        res.render('404');
        
    }
}

const deleteAddress = async (req, res) => {
    try {
        const addressId = req.body.addressId;
        const deleteAddress = await Address.findByIdAndDelete({ _id: addressId });

        if (deleteAddress) {
            res.json({ success: true, message: 'Address deleted!' });
        }
        res.json({ success: false, message: 'Deletion failed!' });

    } catch (error) {
          console.log(error.message);
        res.render('404');

    }
}

const editAddress = async (req, res) => {
    try {
        const userId = req.session.user_id;
        console.log(req.body);
        const addressId = req.body.addressId;
        await Address.updateMany(
            { user: userId },
            { $set: { default: false } }
        );
        const updateAddress = await Address.findByIdAndUpdate(addressId, {
            name: req.body.name,
            companyName: req.body.companyName,
            country: req.body.country,
            houseName: req.body.houseName,
            appartmentNumber: req.body.appartment,
            city: req.body.city,
            state: req.body.state,
            zipcode: req.body.postcode,
            phone: req.body.phone,
            email: req.body.email,
            default: Boolean(req.body.isDefault)
        });
        if (updateAddress) {
            res.json({ success: true, message: 'Address edited !' });
        } else {
            res.json({ success: false, message: 'Editing failed!' });
        }
    } catch (error) {
          console.log(error.message);
        res.render('404');

    }
}

// -----------CheckOut--------------
const checkout = async (req, res) => {
    try {

        const userId = req.session.user_id
        const user = await User.findOne({ _id: userId })
        const address = await Address.find({ user: userId })
        const populatedCart = await User.populate(user, { path: 'cart.productId', model: 'products' });
        const userDetails = await User.populate(user, { path: 'cart.productId', model: 'products' });
        const cartSum = user.cart.reduce((total, cartItem) => total + (cartItem.price * cartItem.quantity), 0);
        const totalProductsCart = user.cart.reduce((total, cartItem) => total + cartItem.quantity, 0);
        res.render('checkout', { user: userDetails, address: address, products: populatedCart,cartSum,totalProductsCart})
    } catch (error) {
          console.log(error.message);
        res.render('404');
    }
}


// -------Logout-----
const logout = async (req, res) => {
    try {
        console.log("ayi");
        req.session.destroy();
        res.redirect(`/`);

    } catch (error) {
          console.log(error.message);
        res.render('404');
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
    checkout,
    userAccount,
    editUserData,
    addAddress,
    deleteAddress,
    editAddress,
    logout
}