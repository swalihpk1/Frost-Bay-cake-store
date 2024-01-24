const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    categoryName:{
        type:String,
        required:true
    },
    isListed:{
        type:Number,
        default:0
    },
    offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offers',
        required: false
    }
});
module.exports = mongoose.model("Categorys", categorySchema);