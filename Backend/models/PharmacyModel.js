const mongoose = require("mongoose");

const pharmacySchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: true,
      trim: true,
    },

    ownerName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    licenseNumber: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    city: String,
    state: String,
    pincode: String,

    location: {
      type: {
        type: String,
        enum:['Point'],
        default: "Point",
      },
      coordinates: [Number], // [longitude, latitude]
      required:true
    },

    isVerified: {
      type: Boolean,
      default: false, // admin approval
    },

    role: {
      type: String,
      default: "pharmacy",
    },

    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

pharmacySchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Pharmacy", pharmacySchema);
