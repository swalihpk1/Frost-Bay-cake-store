const User = require("../models/usersModel");
const Products = require("../models/productModel");
const Category = require("../models/categoryModel");
const session = require("express-session");


const shop = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findOne({ _id: userId });
        const currentPage = parseInt(req.query.page) || 1;
        const searchTerm = req.query.q;
        const selectedCategories = req.query.category || [];
        const sortOption = req.query.sort || 'popularity'; // Default sorting option

        let query = {};

        if (searchTerm) {
            query = {
                $or: [
                    { productName: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } },
                ],
            };
        }

        if (selectedCategories.length > 0) {
            query.category = { $in: selectedCategories };
        }

        // Add sorting logic based on the selected sort option
        let sortCriteria = {};
        if (sortOption === 'lowToHigh') {
            sortCriteria = { price: 1 }; // Sort low to high by price
        } else if (sortOption === 'highToLow') {
            sortCriteria = { price: -1 }; // Sort high to low by price
        }

        const totalProducts = await Products.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / 6);

        const products = await Products.find(query)
            .populate({ path: 'category', model: 'Categorys', select: 'categoryName' })
            .sort(sortCriteria) // Apply sorting
            .skip((currentPage - 1) * 6)
            .limit(6);

        const category = await Category.find({});
        const userDetails = await User.populate(user, { path: 'cart.productId', model: 'products' });

        // Create a response object
        const response = {
            category: category,
            products: products,
            user: userDetails,
            totalPages,
            currentPage,
            searchTerm: searchTerm,
            selectedCategories: selectedCategories,
        };

        // checking the client accept JSON responses
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json(response);
        }

        res.render('shop', response);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



const productDetails = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findOne({ _id: userId })
        const productId = req.params.productId
        const product = await Products.findOne({ _id: productId })
        const userDetails = await User.populate(user, { path: 'cart.productId', model: 'products' });
        res.render('productDetails', { product: product, user: userDetails })
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    shop,
    productDetails,

}