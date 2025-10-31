const USER = require('../Models/userModel')
const otpGenerator = require("otp-generator");
const twilio = require("twilio");
const jwt = require("jsonwebtoken");

const crypto = require("crypto");
const sendEmail = require("../utils/email");


const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

console.log("SID:", process.env.TWILIO_PHONE);

const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    // Generate 6 digit OTP
    const otp = otpGenerator.generate(6, {digits: true,  lowerCaseAlphabets: false, upperCaseAlphabets: false,  specialChars: false });

    // Save OTP to DB (expire in 5 mins)
    const user = await USER.findOneAndUpdate(
      { phone },
      { otp, otpExpire: Date.now() + 5 * 60 * 1000 },
      { upsert: true, new: true }
    );

    // Send OTP via Twilio
    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE, // Twilio phone number
      to: phone
    });

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const user = await USER.findOne({ phone });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (!user.otp || !user.otpExpire || user.otpExpire < Date.now()) {
      return res.status(400).json({ error: "OTP expired or not valid" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // ✅ Clear OTP once verified
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    // ✅ Generate JWT
    const token = jwt.sign(
      { id: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    res.json({
      message: "Login successful",
      token, // send token
      user: {
        _id: user._id,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




const sendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await USER.findOne({ email });
    if (!user) {
      user = new USER({ email });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.emailOtp = otp;
    user.emailOtpExpire = Date.now() + 5 * 60 * 1000; // 5 mins
    await user.save();

    await sendEmail(email, "Email Verification OTP", `Your OTP is: ${otp}`);

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await USER.findOne({ email });

    if (!user) return res.status(404).json({ error: "User not found" });
    
    if (user.emailOtp !== otp || user.emailOtpExpire < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Clear OTP after verification
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    // Generate JWT with id + email
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};





module.exports = {sendOtp, verifyOtp, sendEmailOtp, verifyEmailOtp}