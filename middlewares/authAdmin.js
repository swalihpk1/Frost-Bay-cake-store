const session = require("express-session");

const isLogin = async (req, res, next) => {

    try {
        if (req.session.admin) {
            next();
        } else {
            res.redirect('/admin');
        }

    } catch (error) {
        console.log(error.message);
    }
}
const isLogout = async (req, res, next) => {

    try {
        if (req.session.admin) {
            return res.redirect('/admin/dashboard');
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    isLogin,
    isLogout
}