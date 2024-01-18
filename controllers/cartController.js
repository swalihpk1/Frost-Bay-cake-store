const User = require("../models/usersModel");

const addProductCart = async (req, res) => {
    try {

        const productId = req.body.productId;
        const userId = req.userId;
        const user = await User.findOne({ _id: userId });
        const existingProductIndex = user.cart.findIndex(item => item.productId.equals(productId));

        if (existingProductIndex !== -1) {
            user.cart[existingProductIndex].quantity += 1;
        } else {
            user.cart.push({
                productId: productId,
                quantity: 1,
                price: req.body.price,
                selectedWeight:req.body.selectedWeight
            });

        }

        const productAddedCart = await user.save();
        
        if (productAddedCart) {
            res.json({success:true})
        } else {
            res.json({success:false})
        }
 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

const viewCart = async (req, res) => {
    try {

        const userId = req.userId;
        const user = await User.findOne({ _id: userId });
        const populatedCart = await User.findOne({ _id:userId}).populate({path: 'cart.productId',model: 'products',});
        res.render('cart', { user: populatedCart });

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

const removeProduct = async (req, res) => {
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
        res.json({ status: "success" });

    } catch (error) {
        console.log(error.message);
    }
}

const updateQuantity = async (req, res) => {
    try {

        const userId = req.userId;
        const productId = req.body.productId;
        const quantity = req.body.quantity;

        // Update the quantity in the user's cart
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId, 'cart.productId': productId },
            { $set: { 'cart.$.quantity': quantity } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User or product not found in the cart." });
        }
        res.json({ status: "success" });

    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    addProductCart,
    viewCart,
    removeProduct,
    updateQuantity
};
