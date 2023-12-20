const mongoose = require("mongoose");

const ordersSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    shipAddress: [
        {
            name: {
                type: String,
                required: true
            },
            companyName: {
                type: String,
                required: false
            },
            country: {
                type: String,
                required: true
            },
            houseName: {
                type: String,
                required: true
            },
            appartmentNumber: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            zipcode: {
                type: Number,
                required: true
            },
            phone: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
        }
    ],
    orderedProducts: [
        {
            productId: {
                type: mongoose.Types.ObjectId,
                required: true,
                ref: "Product" 
            },
            quantity: {
                type: Number,
                required: true
            },
            productDetails: {
                name: {
                    type: String,
                    required: true
                },
                price: {
                    type: Number,
                    required: true
                },
                productImage: {
                    type: String,
                    required: true
                }
            }
        }
    ],
    oderNote: {
        type: String
    },
    purchaseDate: {
        type: Date,
        required: true
    },
    deliveredDate: {
        type: Date,
    },
    returnedDate: {
        type: Date,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    usedCouponCode: {
        type: String,
    },
    status: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        require: true
    },
});

module.exports = mongoose.model("Orders", ordersSchema);
