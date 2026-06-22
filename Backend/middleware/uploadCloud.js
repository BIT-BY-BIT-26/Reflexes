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

const hospitalStorage = new CloudinaryStorage({
  cloudinary,
  params:{
    folder:"medireach/hospitals"
  }
});


const upload = multer({ storage });
const hospitalUpload = multer({
  storage:hospitalStorage
})
module.exports = {upload,hospitalUpload};
