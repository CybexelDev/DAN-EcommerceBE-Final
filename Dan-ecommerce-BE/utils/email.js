const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // or your SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
  await transporter.sendMail({
    from: `"dardarTrading" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};

module.exports = sendEmail;



// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   host: "mail.daralnahdatrading.com",   // ⬅ replace with your domain
//   port: 465,                     // 465 = SSL (recommended)
//   secure: true,
//   auth: {
//     user: process.env.EMAIL_USER,     // ⬅ your Bluehost email
//     pass: process.env.EMAIL_PASS,          // ⬅ password of that email account
//   },
// });

// const sendEmail = async (to, subject, text) => {
//   await transporter.sendMail({
//     from: `"MyApp" <${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     text,
//   });
// };

// module.exports = sendEmail;
