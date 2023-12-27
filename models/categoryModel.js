const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    categoryName:{
        type:String,
        required:true
    },
    isListed:{
        type:Number,
        default:0
    }
});
module.exports = mongoose.model("Categorys", categorySchema);