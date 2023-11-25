const session = require("express-session");

const isLogin = async (req, res, next) => {

    try {
        if (req.session.user_id) {
            next();
        } else {
            res.redirect('/authentication');
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

module.exports={
    isLogin,
    isLogout,
}