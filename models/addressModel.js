const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required:false
    },
    country: {
        type: String,
        required:true
    },
    houseName: {
        type: String,
        required:true
    },
    appartmentNumber: {
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
    default: {
        type: Boolean,
        required:true
    }
    
});
module.exports = mongoose.model("Address", addressSchema);