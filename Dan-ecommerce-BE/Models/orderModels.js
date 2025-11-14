const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
     address: [
      {
        addressType: { type: String, required: true },
        fullName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        houseNo: { type: String },
        area: { type: String },
        landmark: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
      orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered"],
      default: "pending",
    },
    paymentIntentId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
