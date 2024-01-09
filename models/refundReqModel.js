const mongoose = require("mongoose");

const refundReqSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Orders',
        required: true
    },
    productId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Product"
    },
    productImage: {
        type: String,
        required: true
    },
    reasonNote: {
        type: String,
        required: true
    },
    cakeAmount: {
        type: Number,
        required:true
    } 
});

module.exports = mongoose.model("Refund requests", refundReqSchema);