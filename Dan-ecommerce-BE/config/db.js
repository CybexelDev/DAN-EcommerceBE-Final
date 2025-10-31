const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://developersnme:JZ6HZhxIE9a7wV32@cluster0.clty8tf.mongodb.net/"
    );
    console.log("✅ MongoDB Atlas connected!");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
};

module.exports = connectDb;
