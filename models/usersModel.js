const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    cart: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId, // Assuming you're storing product IDs
                ref: 'productModel' // Reference to your Product model
            },
            quantity: {
                type: Number,
                default: 1 // Default quantity if not specified
            }
        }
    ],
    isBlocked:{
        type:Number,
        default:0
    }
}); 

module.exports = mongoose.model("User",userSchema);