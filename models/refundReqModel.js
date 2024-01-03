const mongoose = require("mongoose");

const refundReqSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Orders',
        required: true
    },
    productImage: {
        type: String,
        required:true
    },
    reasonNote: {
        type: String,
        required:true
    }
});

module.exports = mongoose.model("Refund requests", refundReqSchema);