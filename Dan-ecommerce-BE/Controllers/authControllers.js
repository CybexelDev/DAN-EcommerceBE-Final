// const USER = require('../Models/userModel')
// const otpGenerator = require("otp-generator");
// const twilio = require("twilio");
// const jwt = require("jsonwebtoken");

// const crypto = require("crypto");
// const sendEmail = require("../utils/email");


// const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

// console.log("SID:", process.env.TWILIO_PHONE);

// const sendOtp = async (req, res) => {
//   try {
//     const { phone } = req.body;

//     // Generate 6 digit OTP
//     const otp = otpGenerator.generate(6, {digits: true,  lowerCaseAlphabets: false, upperCaseAlphabets: false,  specialChars: false });

//     // Save OTP to DB (expire in 5 mins)
//     const user = await USER.findOneAndUpdate(
//       { phone },
//       { otp, otpExpire: Date.now() + 5 * 60 * 1000 },
//       { upsert: true, new: true }
//     );

//     // Send OTP via Twilio
//     await client.messages.create({
//       body: `Your OTP is ${otp}`,
//       from: process.env.TWILIO_PHONE, // Twilio phone number
//       to: phone
//     });

//     res.status(200).json({ message: "OTP sent successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };



// const verifyOtp = async (req, res) => {
//   try {
//     const { phone, otp } = req.body;

//     const user = await USER.findOne({ phone });
//     if (!user) {
//       return res.status(400).json({ error: "User not found" });
//     }

//     if (!user.otp || !user.otpExpire || user.otpExpire < Date.now()) {
//       return res.status(400).json({ error: "OTP expired or not valid" });
//     }

//     if (user.otp !== otp) {
//       return res.status(400).json({ error: "Invalid OTP" });
//     }

//     // ✅ Clear OTP once verified
//     user.otp = null;
//     user.otpExpire = null;
//     await user.save();

//     // ✅ Generate JWT
//     const token = jwt.sign(
//       { id: user._id, phone: user.phone },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRE || "7d" }
//     );

//     res.json({
//       message: "Login successful",
//       token, // send token
//       user: {
//         _id: user._id,
//         phone: user.phone,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };




// const sendEmailOtp = async (req, res) => {
//   try {
//     const { email } = req.body;

//     let user = await USER.findOne({ email });
//     if (!user) {
//       user = new USER({ email });
//     }

//     const otp = crypto.randomInt(100000, 999999).toString();
//     user.emailOtp = otp;
//     user.emailOtpExpire = Date.now() + 5 * 60 * 1000; // 5 mins
//     await user.save();

//     await sendEmail(email, "Email Verification OTP", `Your OTP is: ${otp}`);

//     res.status(200).json({ message: "OTP sent to email" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


// const verifyEmailOtp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     const user = await USER.findOne({ email });

//     if (!user) return res.status(404).json({ error: "User not found" });
    
//     if (user.emailOtp !== otp || user.emailOtpExpire < Date.now()) {
//       return res.status(400).json({ error: "Invalid or expired OTP" });
//     }

//     // Clear OTP after verification
//     user.otp = null;
//     user.otpExpire = null;
//     await user.save();

//     // Generate JWT with id + email
//     const token = jwt.sign(
//       { id: user._id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       user: { id: user._id, email: user.email },
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };









// module.exports = {sendOtp, verifyOtp, sendEmailOtp, verifyEmailOtp}




const USER = require('../Models/userModel');
const otpGenerator = require("otp-generator");
const twilio = require("twilio");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/email");

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

console.log("Twilio Phone:", process.env.TWILIO_PHONE);


const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone is required" });

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });

    const otpExpire = Date.now() + 5 * 60 * 1000;

    // Check if user exists
    let user = await USER.findOne({ phone });

    let mode = "signup"; // default mode

    if (user) {
      // Existing user → LOGIN
      mode = "login";
      user.otp = otp;
      user.otpExpire = otpExpire;
      await user.save();
    } else {
      // New user → SIGNUP
      user = new USER({
        phone,
        otp,
        otpExpire
      });
      await user.save();
    }

    // Send OTP via Twilio
    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: phone
    });

    res.status(200).json({
      message: "OTP sent successfully",
      mode
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const user = await USER.findOne({ phone });
    if (!user) return res.status(400).json({ error: "User not found" });

    if (!user.otp || user.otpExpire < Date.now())
      return res.status(400).json({ error: "OTP expired or invalid" });

    if (user.otp !== otp)
      return res.status(400).json({ error: "Incorrect OTP" });

    // Clear OTP
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    // Create token
    const token = jwt.sign(
      { id: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "OTP verified successfully",
      token,
      user,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};





// const sendEmailOtp = async (req, res) => {
//   try {
//     const { email } = req.body;

//     let user = await USER.findOne({ email });
//     if (!user) {
//       user = new USER({ email });
//     }

//     const otp = crypto.randomInt(100000, 999999).toString();
//     user.emailOtp = otp;
//     user.emailOtpExpire = Date.now() + 5 * 60 * 1000; // 5 mins
//     await user.save();

//     await sendEmail(email, "Email Verification OTP", `Your OTP is: ${otp}`);

//     res.status(200).json({ message: "OTP sent to email" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };



































// const sendEmailOtp = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ error: "Email is required" });
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ error: "Invalid email format" });
//     }

//     // Try to find user by email
//     let user = await USER.findOne({ email });

//     if (user) {
//       // USER EXISTS: Login flow
//       const otp = crypto.randomInt(100000, 999999).toString();
//       user.emailOtp = otp;
//       user.emailOtpExpire = Date.now() + 5 * 60 * 1000;
//       await user.save();

//       await sendEmail(email, "Login OTP", `Your OTP is: ${otp}`);

//       return res.status(200).json({ 
//         success: true,
//         message: "OTP sent to your email for login",
//         userId: user._id,
//         isNewUser: false
//       });
//     } else {
//       // USER DOESN'T EXIST: Signup flow
//       // First, check again to avoid race conditions
//       user = await USER.findOne({ email });
//       if (user) {
//         // User was created between our two checks (race condition)
//         // Send OTP for login instead
//         const otp = crypto.randomInt(100000, 999999).toString();
//         user.emailOtp = otp;
//         user.emailOtpExpire = Date.now() + 5 * 60 * 1000;
//         await user.save();

//         await sendEmail(email, "Login OTP", `Your OTP is: ${otp}`);

//         return res.status(200).json({ 
//           success: true,
//           message: "OTP sent to your email for login",
//           userId: user._id,
//           isNewUser: false
//         });
//       }

//       // Create new user without phone field
//       const newUser = new USER({ 
//         email,
//         isEmailVerified: false
//         // Don't set phone field at all
//       });

//       const otp = crypto.randomInt(100000, 999999).toString();
//       newUser.emailOtp = otp;
//       newUser.emailOtpExpire = Date.now() + 5 * 60 * 1000;
      
//       try {
//         await newUser.save();
//       } catch (saveError) {
//         // If we get a duplicate key error for email, it means someone else just registered
//         if (saveError.code === 11000 && saveError.keyPattern && saveError.keyPattern.email) {
//           // Find the newly created user and send OTP for login
//           const existingUser = await USER.findOne({ email });
//           if (existingUser) {
//             existingUser.emailOtp = otp;
//             existingUser.emailOtpExpire = Date.now() + 5 * 60 * 1000;
//             await existingUser.save();

//             await sendEmail(email, "Login OTP", `Your OTP is: ${otp}`);

//             return res.status(200).json({ 
//               success: true,
//               message: "OTP sent to your email for login",
//               userId: existingUser._id,
//               isNewUser: false
//             });
//           }
//         }
        
//         // If duplicate key error for phone, use workaround
//         if (saveError.code === 11000 && saveError.keyPattern && saveError.keyPattern.phone) {
//           // Use a unique placeholder phone number
//           const uniquePhone = `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
//           const userWithPhone = new USER({ 
//             email,
//             phone: uniquePhone,
//             isEmailVerified: false
//           });
          
//           userWithPhone.emailOtp = otp;
//           userWithPhone.emailOtpExpire = Date.now() + 5 * 60 * 1000;
//           await userWithPhone.save();

//           await sendEmail(email, "Signup Verification OTP", `Your OTP is: ${otp}`);

//           return res.status(200).json({ 
//             success: true,
//             message: "OTP sent to your email for signup",
//             userId: userWithPhone._id,
//             isNewUser: true
//           });
//         }
        
//         // Re-throw other errors
//         throw saveError;
//       }

//       await sendEmail(email, "Signup Verification OTP", `Your OTP is: ${otp}`);

//       return res.status(200).json({ 
//         success: true,
//         message: "OTP sent to your email for signup",
//         userId: newUser._id,
//         isNewUser: true
//       });
//     }

//   } catch (error) {
//     console.error("Email OTP error:", error);
    
//     // User-friendly error messages
//     if (error.code === 11000) {
//       if (error.keyPattern && error.keyPattern.email) {
//         return res.status(400).json({ 
//           success: false,
//           error: "This email is already registered. Please try logging in." 
//         });
//       }
      
//       if (error.keyPattern && error.keyPattern.phone) {
//         // This is a database schema issue - try one more time with a different approach
//         return res.status(400).json({ 
//           success: false,
//           error: "Unable to process request. Please try again in a moment." 
//         });
//       }
//     }
    
//     // Generic error
//     res.status(500).json({ 
//       success: false,
//       error: "Unable to send OTP. Please try again later." 
//     });
//   }
// };































// const sendEmailOtp = async (req, res) => {
//   try {
//     const { email } = req.body;

//     console.log("📧 OTP request started for:", email);

//     if (!email) {
//       return res.status(400).json({ 
//         success: false,
//         error: "Email is required" 
//       });
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ 
//         success: false,
//         error: "Please enter a valid email address" 
//       });
//     }

//     // IMMEDIATELY send response - don't wait for email
//     res.status(200).json({
//       success: true,
//       message: "OTP is being sent to your email. Please check your inbox.",
//       processing: true
//     });

//     // Now process in background (async)
//     processOtpRequest(email).catch(err => {
//       console.error("Background OTP processing error:", err);
//     });

//   } catch (error) {
//     console.error("Initial request error:", error);
//     res.status(500).json({
//       success: false,
//       error: "Unable to process request"
//     });
//   }
// };

// // Separate async function for processing
// const processOtpRequest = async (email) => {
//   try {
//     console.log("🔄 Background processing OTP for:", email);
    
//     // Find or create user
//     let user = await USER.findOne({ email });
//     const otp = crypto.randomInt(100000, 999999).toString();
//     console.log("Generated OTP:", otp);

//     if (user) {
//       // Login flow
//       console.log("User exists, updating OTP");
//       user.emailOtp = otp;
//       user.emailOtpExpire = Date.now() + 5 * 60 * 1000;
//       await user.save();
//     } else {
//       // Signup flow
//       console.log("Creating new user");
//       const uniquePhone = `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
//       user = new USER({
//         email,
//         phone: uniquePhone,
//         isEmailVerified: false,
//         emailOtp: otp,
//         emailOtpExpire: Date.now() + 5 * 60 * 1000
//       });
      
//       await user.save();
//     }

//     console.log("📤 Sending email to:", email);
    
//     // Send email (with timeout)
//     await sendEmailWithTimeout(email, "Your Verification Code", otp);
    
//     console.log("✅ OTP processing completed for:", email);

//   } catch (error) {
//     console.error("❌ Background processing failed:", error);
//     // Log error but don't affect user - they already got response
//   }
// };

// // Email function with timeout
// const sendEmailWithTimeout = (to, subject, otp) => {
//   return new Promise((resolve, reject) => {
//     // Set timeout of 10 seconds for email sending
//     const timeout = setTimeout(() => {
//       console.log("Email sending timeout for:", to);
//       resolve(); // Don't reject, just log timeout
//     }, 10000);

//     sendEmail(to, subject, `Your OTP is: ${otp}`)
//       .then(() => {
//         clearTimeout(timeout);
//         console.log("Email sent successfully to:", to);
//         resolve();
//       })
//       .catch(err => {
//         clearTimeout(timeout);
//         console.error("Email sending error for:", to, err);
//         resolve(); // Still resolve to not break the flow
//       });
//   });
// };












const sendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;

    console.log("📧 OTP request for:", email);

    if (!email) {
      return res.status(400).json({ 
        success: false,
        error: "Email is required" 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        error: "Please enter a valid email address" 
      });
    }

    // 1. Generate OTP first (fast)
    const otp = crypto.randomInt(100000, 999999).toString();
    console.log("Generated OTP:", otp);

    // 2. Find or create user (optimized)
    let user = await USER.findOne({ email });
    
    if (user) {
      // Update existing user
      await USER.updateOne(
        { _id: user._id },
        { 
          emailOtp: otp,
          emailOtpExpire: Date.now() + 5 * 60 * 1000 
        }
      );
    } else {
      // Create new user with unique phone
      const uniquePhone = `email-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      user = await USER.create({
        email,
        phone: uniquePhone,
        isEmailVerified: false,
        emailOtp: otp,
        emailOtpExpire: Date.now() + 5 * 60 * 1000
      });
    }

    // 3. Send email WITH TIMEOUT
    console.log("Attempting to send email...");
    
    // Use Promise.race to timeout email sending after 10 seconds
    const emailPromise = sendEmail(email, "Your Verification Code", `Your OTP is: ${otp}`);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email timeout')), 10000)
    );

    try {
      await Promise.race([emailPromise, timeoutPromise]);
      console.log("✅ Email sent successfully");
      
      res.status(200).json({
        success: true,
        message: "OTP sent to your email successfully",
        userId: user._id
      });
      
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError.message);
      
      // Still respond success if email fails (OTP is saved in DB)
      res.status(200).json({
        success: true,
        message: "OTP generated successfully. Please check spam folder.",
        userId: user._id,
        otp: process.env.NODE_ENV === 'development' ? otp : undefined // Return OTP only in dev
      });
    }

  } catch (error) {
    console.error("❌ Full error:", error);
    
    res.status(500).json({
      success: false,
      error: "Unable to process request. Please try again."
    });
  }
};
























const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await USER.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.emailOtp || user.emailOtpExpire < Date.now())
      return res.status(400).json({ error: "OTP expired or invalid" });

    if (user.emailOtp !== otp)
      return res.status(400).json({ error: "Incorrect OTP" });

    // Clear email OTP (FIXED)
    user.emailOtp = null;
    user.emailOtpExpire = null;
    user.isEmailVerified = true;
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Email verified successfully",
      token,
      user,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};





module.exports = {
  sendOtp,
  verifyOtp,
  sendEmailOtp,
  verifyEmailOtp
};
