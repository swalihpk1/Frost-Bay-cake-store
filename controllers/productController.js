const User = require("../models/usersModel");
const Products = require("../models/productModel");
const Category = require("../models/categoryModel");
const session = require("express-session");


const shop = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findOne({ _id: userId });
        const currentPage = parseInt(req.query.page) || 1;
        const searchTerm = req.query.q; // Retrieve the search term from the query parameters

        let query = {};

        if (searchTerm) {
            // If there's a search term, add a case-insensitive search to the query
            query = {
                $or: [
                    { productName: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } },
                    // Add more fields as needed for your search
                ],
            };
        }

        const totalProducts = await Products.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / 6);

        const products = await Products.find(query)
            .populate('category')
            .skip((currentPage - 1) * 6)
            .limit(6);

        const category = await Category.find({});
        const userDetails = await User.populate(user, { path: 'cart.productId', model: 'products' });

        res.render('shop', { category: category, products: products, user: userDetails, totalPages, currentPage, searchTerm: req.query.q });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


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