const session = require("express-session");

const isLogin = async (req, res, next) => {

    try {
        if (req.session.user_id) {
            const userId = req.session.user_id || null;
            req.userId = userId;
            next();
        } else {
            res.redirect(`/authentication?message=${encodeURIComponent("Please Login")}`);
        }
    } catch (error) {
        console.log(error.message);
    }
}
const isLogout = async (req, res, next) => {

    try {
        if (req.session.user_id) {
            return res.redirect('/home');
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
}

const noAuth = async (req, res, next) => {
    try {

        const userId = req.session.user_id || null;
        req.userId = userId;
        next();
    } catch (error) {
        console.log(error.message);
    }
};


module.exports={
    isLogin,
    isLogout,
    noAuth
}