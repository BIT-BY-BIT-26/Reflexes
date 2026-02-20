const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "medireach_reports", // Cloudinary folder
    resource_type: "auto" // image/pdf sab allow
  }
});

const upload = multer({ storage });

module.exports = upload;
