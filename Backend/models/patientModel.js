// models/patientModel.js
const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      unique: true,        
      sparse: true  //allows multiple nulls
      //required: true,
    },

    age: {
      type: Number
    },
    

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"]
    },

    bloodGroup: {
      type: String
    },
    phone_number:{
      type:Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
