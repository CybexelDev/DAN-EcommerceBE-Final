var express = require('express');
const { sendOtp, verifyOtp, sendEmailOtp, verifyEmailOtp } = require('../Controllers/authControllers');
var router = express.Router();


router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

router.post("/sendEmailOtp", sendEmailOtp);
router.post("/verifyEmailOtp", verifyEmailOtp);


module.exports = router;