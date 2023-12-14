const User = require("../models/usersModel");
const Products = require("../models/productModel");
const Category = require("../models/categoryModel");
const session = require("express-session");



const shop = async(req,res)=>{
    try {
     
        const userId = req.userId;
        const user = await User.findOne({_id:userId})
        const products = await Products.find({})
        const category = await Category.find({});
        const userDetails = await User.populate(user, { path: 'cart.productId', model: 'products' });
        res.render('shop',{category:category,products:products,user:userDetails})
    } catch (error) {
        console.log(error.message);
    }
}

const productDetails = async(req,res)=>{
    try {
        const userId = req.userId;
        const user = await User.findOne({_id:userId})
        const productId = req.params.productId
        const product =  await Products.findOne({_id:productId})
        const userDetails = await User.populate(user, { path: 'cart.productId', model: 'products' });
        res.render('productDetails',{product:product,user:userDetails})
    } catch (error) {
        console.log(error.message);
    }
}



module.exports={
    shop,
    productDetails,
  
}