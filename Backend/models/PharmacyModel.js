const mongoose = require("mongoose");

const pharmacySchema = new mongoose.Schema(
  {
    userId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      unique:true,
      sparse:true
    },  
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
      coordinates:{
        type:[Number],

      } , // [longitude, latitude]
      
    },

    isVerified: {
      type: Boolean,
      default: false, // admin approval
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
