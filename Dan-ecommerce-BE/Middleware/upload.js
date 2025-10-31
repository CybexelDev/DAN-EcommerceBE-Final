const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// configure cloudinary
cloudinary.config({
  cloud_name: "djedeaw0l",
  api_key: "332145637315313",
  api_secret: "QGzj970zckzTxSBl3t6Lzpwgmx0"
});

// use Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
  folder: "daralnahdatrading",   // this is your Cloudinary folder
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ quality: "auto", fetch_format: "auto" }]
  }
});

const upload = multer({ storage });

module.exports = upload;

