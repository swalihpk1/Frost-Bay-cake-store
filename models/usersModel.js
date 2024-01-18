const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    userImage: {
        type: String,
        default:null
    },
    location: {
        type: String,
        required: true
    },
    cart: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Products' 
            },
            quantity: {
                type: Number,
                default: 1 
            },
            selectedWeight: {
                type: Number,
                required:true
            },
            price: {
                type: Number,
                required:true
            }
        }
    ],
    wallet: {
        balance: {
            type: Number,
            default: 0.0,
        },
        transactionHistory: [{
            type: {
                type: String,
            },
            amount: {
                type: Number,
                require: true
            },
            direction: {
                type: String,
                require: true
            },
            transactionDate: {
                type: Date,
                require: true
            },
        }]
    },
    isBlocked: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("User", userSchema);