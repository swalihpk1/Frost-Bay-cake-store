const User = require("../models/usersModel");



// -------Dashboards------
const dashboard = async (req, res) => {
    try {

        res.render('dashboard');

    } catch (error) {
        console.log(error.message);
    }
}

// --------Products-------
const products = async (req,res)=>{
    try {

        res.render('products');

    } catch (error) {
        console.log(error.message);
    }
}

// --------Users-------
const users = async (req,res)=>{
    try {
      
        const userData = await User.find({})

        res.render('users',{user:userData});

    } catch (error) {
        console.log(error.message);
    }
}


module.exports ={
    dashboard,
    products,
    users
}