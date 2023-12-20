const User = require("../models/usersModel");
const Address = require("../models/addressModel")
const Order = require("../models/ordersModel")
const Products = require("../models/productModel")


const addOrder = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const user = await User.findOne({ _id: userId });
        const cartUser = await User.populate(user, { path: 'cart.productId', model: 'products' });
        let shipAddress;
        if (req.body.name) {
            shipAddress = new Address({
                user: userId,
                name: req.body.name,
                companyName: req.body.companyName,
                country: req.body.country,
                houseName: req.body.houseName,
                appartmentNumber: req.body.appartment,
                city: req.body.city,
                state: req.body.state,
                zipcode: req.body.postcode,
                phone: req.body.phone,
                email: req.body.email,
                default: false
            });
            await address.save()
        } else {
            const addressId = req.body.selectedAddressId
            shipAddress = await Address.findOne({ _id: addressId })
        }

        let products = cartUser.cart.map(item => ({
            productId: item.productId._id,
            quantity: item.quantity,
            productDetails: {
                name: item.productId.productName,
                price: item.productId.price,
                productImage:item.productId.productImages[0]
            }
        }));
        
        const orders = new Order({
            userId: userId,
            shipAddress: [
                {
                    name: shipAddress.name,
                    companyName: shipAddress.companyName,
                    country: shipAddress.country,
                    houseName: shipAddress.houseName,
                    appartmentNumber: shipAddress.appartmentNumber,
                    city: shipAddress.city,
                    state: shipAddress.state,
                    zipcode: shipAddress.zipcode,
                    phone: shipAddress.phone,
                    email: shipAddress.email
                }
            ],
            orderedProducts:products,
            oderNote: req.body.orderNotes,
            purchaseDate: Date.now(),
            totalAmount:req.body.total,
            status: 'pending',
            paymentMethod: req.body.paymentMethod,
        });

        const newOrders = await orders.save()
          
        if (newOrders) {
            console.log("aayi");
            res.json({ success: true, message: 'Order success' });
        } else {
            res.json({ success: false, message: 'please select address and payment method!' });
        }

    } catch (error) {
        res.json({ success: false, message: 'Select address and payment method..!' });
        console.log(error.message);
    }
}

module.exports = {
    addOrder
}