const mongoose = require("mongoose");


const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  pincode: { type: String, required: true },
  houseNo: { type: String, required: true },
  area: { type: String, required: true },
  landmark: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  addressType: { type: String, enum: ["Home", "Work", "Other"], default: "Home" },
});


const userSchema = new mongoose.Schema({
  phone: { type: String, unique: true, parse: true },
  otp: String,
  otpExpire: Date,

  email: { type: String, unique: true, sparse: true },
  emailOtp: String,
  emailOtpExpire: Date,
  isEmailVerified: { type: Boolean, default: false },

  addresses: [addressSchema],
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
