const User = require("../models/usersModel");
const Products = require("../models/productModel");

const addProductCart = async (req, res) => {
    try {
        const productId = req.params.productId;
        const userId = req.userId;
        const user = await User.findOne({ _id: userId });
        const existingProductIndex = user.cart.findIndex(item => item.productId.equals(productId));

        if (existingProductIndex !== -1) {
            user.cart[existingProductIndex].quantity += 1;
        } else {
            user.cart.push({
                productId: productId,
                quantity: 1
            });
        }

        await user.save();

        const populatedCart = await User.populate(user, { path: 'cart.productId', model: 'products' });
        res.render('cart', { user: populatedCart });

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

const viewCart = async (req, res) => {
    try {

        const userId = req.userId;
        const user = await User.findOne({ _id: userId });
        const populatedCart = await User.populate(user, { path: 'cart.productId', model: 'products' });
        res.render('cart', { user: populatedCart });

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

const removeProduct = async(req,res)=>{
     try {
        const userId = req.userId; 
        const productId = req.body.productId;
    
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $pull: { cart: { productId: productId } } },
          { new: true }
        );
    
        if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
        }
         res.json({status:"success"});
    
     } catch (error) {
        console.log(error.message);
     }
}
module.exports = {
    addProductCart,
    viewCart,
    removeProduct
};
