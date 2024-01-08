const mongoose = require("mongoose");

const  couponSchema = new mongoose.Schema({
    couponId: {
        type: String,
        required: true
    },
    discountPercentage: {
        type: Number,
        required:true
    },
    bgImage: {
        type: String,
        required:true
    },
    description: {
        type: String,
        required:true
    },
    expiryDate: {
        type: String,
        required:true
    },
    minPurcahaseAmount: {
        type: Number,
        required:true
    }
}); 

module.exports = mongoose.model("Coupons",couponSchema);