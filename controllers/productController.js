const User = require("../models/usersModel");
const Products = require("../models/productModel");
const Category = require("../models/categoryModel");



const shop = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findOne({ _id: userId });

        // Proceed with filter-related logic even if the user doesn't exist
        const currentPage = parseInt(req.query.page) || 1;
        const searchTerm = req.query.q;
        const selectedCategories = req.query.category || [];
        const sortOption = req.query.sort || 'popularity';
        const selectedKilograms = req.query.kilogram || [];

        let query = {};

        if (selectedKilograms.length > 0) {
            query['weights.value'] = { $in: selectedKilograms };
        }

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

        let sortCriteria = {};
        if (sortOption === 'lowToHigh') {
            sortCriteria = { price: 1 };
        } else if (sortOption === 'highToLow') {
            sortCriteria = { price: -1 };
        }

        const totalProducts = await Products.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / 6);

        const products = await Products.find(query)
            .populate({ path: 'category', model: 'Categorys', select: 'categoryName' })
            .populate('offer')
            .sort(sortCriteria)
            .skip((currentPage - 1) * 6)
            .limit(6);

        const categoryProductCount = await Products.aggregate([
            { $match: query },
            { $group: { _id: '$category', count: { $sum: 1 } } },
        ]);

        const categoryProductCountMap = {};
        categoryProductCount.forEach(({ _id, count }) => {
            categoryProductCountMap[_id.toString()] = count;
        });

        const category = await Category.find({});

        // Only calculate cart-related values if the user object exists
        let cartSum = 0;
        let totalProductsCart = 0;

        if (user && user.cart) {
            cartSum = user.cart.reduce((total, cartItem) => total + (cartItem.price * cartItem.quantity), 0);
            totalProductsCart = user.cart.reduce((total, cartItem) => total + cartItem.quantity, 0);
        }

        const response = {
            category: category,
            products: products,
            user: user,
            totalPages,
            currentPage,
            searchTerm: searchTerm,
            selectedCategories: selectedCategories,
            categoryProductCount: categoryProductCountMap,
            selectedKilograms: selectedKilograms,
            currentPath: '/shop',
            cartSum,
            totalProductsCart
        };

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json(response);
        }

        res.render('shop', response);
    } catch (error) {
        console.log(error.message);
        res.render('404');
    }
};




const productDetails = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findOne({ _id: userId })
        const productId = req.params.productId
        const product = await Products.findOne({ _id: productId }).populate('offer').populate('category')
        const userDetails = await User.populate(user, { path: 'cart.productId', model: 'products' });
        const cartSum = user.cart.reduce((total, cartItem) => total + (cartItem.price * cartItem.quantity), 0);
        const totalProductsCart = user.cart.reduce((total, cartItem) => total + cartItem.quantity, 0);
        res.render('productDetails', { product: product, user: userDetails,cartSum,totalProductsCart})
    } catch (error) {
        console.log(error.message);
        res.render('404');
    }
}


module.exports = {
    shop,
    productDetails,

}