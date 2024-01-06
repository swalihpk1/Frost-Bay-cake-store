const User = require("../models/usersModel");
const Address = require("../models/addressModel")
const Order = require("../models/ordersModel")
const Products = require("../models/productModel")
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { products } = require("./adminController");
const Refundrequests = require("../models/refundReqModel")


// ----Razorpay--------
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_ID,
});

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

        } else {
            const addressId = req.body.selectedAddressId
            shipAddress = await Address.findOne({ _id: addressId })
        }

        // --------to Date formating-------------
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        // ----------- to time 12hr formatting----------------
        const formattedTime = currentDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });

        var products = cartUser.cart.map(item => ({
            productId: item.productId._id,
            quantity: item.quantity,
            status: 'Placed',
            stausUpdatedDate: formattedDate,
            productDetails: {
                name: item.productId.productName,
                price: item.productId.price,
                productImage: item.productId.productImages[0],
            }
        }));

        const orders = new Order({
            userId: userId,
            userName: user.name,
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
            orderedProducts: products,
            oderNote: req.body.orderNotes,
            purchaseDate: formattedDate,
            purchaseTime: formattedTime,
            totalAmount: req.body.total,
            paymentMethod: req.body.paymentMethod,
        });
        const newOrders = await orders.save()

        if (req.body.paymentMethod == 'cashOnDelivery') {

            for (const product of products) {
                const productId = product.productId;
                const quantityToDecrease = product.quantity;

                await Products.updateOne(
                    { _id: productId },
                    { $inc: { totalQuantity: -quantityToDecrease } }
                );

                await User.updateOne({ _id: userId }, { $set: { cart: [] } });
            }
            res.json({ success: true, message: 'Order success', });

        } else if (req.body.paymentMethod == 'wallet') {
            for (const product of products) {
                const productId = product.productId;
                const quantityToDecrease = product.quantity;

                await Products.updateOne(
                    { _id: productId },
                    { $inc: { totalQuantity: -quantityToDecrease } }
                );


                await User.updateOne({ _id: userId }, { $set: { cart: [] } });
            }

            const newTransactionHistory = {
                type:"FROST-BAY",
                amount: newOrders.totalAmount,
                direction: 'paid',
                transactionDate: Date.now()
            };

            await User.findOneAndUpdate(
                { _id: userId },
                {
                    $push: {
                        'wallet.transactionHistory': newTransactionHistory
                    },
                    $inc: { 'wallet.balance': -newOrders.totalAmount }
                },
                { upsert: true }
            );

            res.json({ success: true, message: 'Order success' });

        } else if (req.body.paymentMethod == 'razorpay') {
            const options = {
                amount: newOrders.totalAmount * 100,
                currency: 'INR',
                receipt: newOrders._id.toString(),
            };
            razorpayInstance.orders.create(options, (err, razorpayOrder) => {
                if (err) {
                    console.error('Razorpay order creation error:', err);
                    res.json({ success: false, message: 'Error creating Razorpay order.' });
                } else {
                    res.json({
                        success: true,
                        paymentMethod: "razorpay",
                        amount: razorpayOrder.amount,
                        orderId: razorpayOrder.id,
                    });
                }
            });

        } else {
            res.json({ success: false, message: 'Select address and payment method..!' });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const verifyPayment = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const paymentData = req.body;
        const user = await User.findOne({ _id: userId });
        const cartUser = await User.populate(user, { path: 'cart.productId', model: 'products' });

        var products = cartUser.cart.map(item => ({
            productId: item.productId._id,
            quantity: item.quantity,
            productDetails: {
                name: item.productId.productName,
                price: item.productId.price,
                productImage: item.productId.productImages[0]
            }
        }));

        const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_ID);
        hmac.update(paymentData.payment.razorpay_order_id + "|" + paymentData.payment.razorpay_payment_id);
        const hmacValue = hmac.digest("hex");

        if (hmacValue == paymentData.payment.razorpay_signature) {
            for (const product of products) {
                const productId = product.productId;
                const quantityToDecrease = product.quantity;

                await Products.updateOne(
                    { _id: productId },
                    { $inc: { totalQuantity: -quantityToDecrease } }
                );

                await User.updateOne({ _id: userId }, { $set: { cart: [] } });
            }
            res.json({ success: true, message: 'Order success' });
        }

    } catch (error) {
        console.log(error.message);
    }
}

const cancelOrder = async (req, res) => {
    try {
        const orderId = req.body.orderId;
        const productId = req.body.productId
        const cancelledOrder = await Order.findOneAndUpdate(
            {
                _id: orderId, 
                'orderedProducts.productId': productId,
            },
            {
                $set: {
                    'orderedProducts.$.status':"Cancelled",
                    status: "Cancelled",
                },
            },
            { new: true }
        );
        if (cancelledOrder) {
            res.json({ success: true, message: 'Order cancelled successfully.' });
        }

    } catch (error) {
        console.log(error.message);
    }
}

const refundRequest = async (req, res) => {
    try {
        const returnRequest = new Refundrequests({
            orderId: req.body.orderId,
            productId:req.body.productId,
            productImage: req.file.filename,
            reasonNote: req.body.reasonNote.trim()
        })
        await returnRequest.save()

        if (returnRequest) {
            const orderId = req.body.orderId;
            const productId = req.body.productId;
             await Order.findOneAndUpdate(
                {
                    _id: orderId, 
                    'orderedProducts.productId': productId,
                },
                {
                    $set: {
                        'orderedProducts.$.status':"Refund requested",
                        status: "Refund requested",
                    },
                },
                { new: true }
            );
            res.json({ success: true })
        } else {
            res.json({ success: false })
        }
        
    } catch (error) {
        console.log(error.message);
    }

}
module.exports = {
    addOrder,
    cancelOrder,
    verifyPayment,
    refundRequest
}