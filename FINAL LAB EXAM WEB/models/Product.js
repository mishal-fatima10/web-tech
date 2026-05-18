const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ["Unstitched Lawn", "Luxe Pret", "Formals", "Bridals"]
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  description: {
    type: String,
    default: ""
  },
  image: {
    type: String,
    default: "/images/placeholder.svg"
  },
  isOnSale: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
