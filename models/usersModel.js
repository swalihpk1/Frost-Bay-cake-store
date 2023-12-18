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
            }
        }
    ],
    isBlocked: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("User", userSchema);