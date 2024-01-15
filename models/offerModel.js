const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
    offerName:{
        type:String,
        required:true
    },
    description: {
        type: String,
        required: true
    },
    offPercentage: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required:true
    }
});
module.exports = mongoose.model("Offers", offerSchema);