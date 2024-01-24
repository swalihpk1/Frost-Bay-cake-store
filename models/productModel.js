


const mongoose = require("mongoose");

const weightSchema = new mongoose.Schema({
    value: {
      type: String,
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  });
  
const productSchema = new mongoose.Schema({

    productName: {
        type: String,
        required: true
    },
    weights: [weightSchema],
    length: {
        type: String,
        required: true,
    },
    base: {
        type: String,
        required: true,
    },
    height: {
        type: String,
        required: true,
    },
    incredients: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    isShow:{
        type:Number,
        default:0
    },
    totalQuantity:{
        type:Number,
        required:true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categorys',
        required: true
    },
    productImages: {
        type:[String],
        required: true,
    },
    offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offers',
        required: false
    }
});

module.exports = mongoose.model("products", productSchema);