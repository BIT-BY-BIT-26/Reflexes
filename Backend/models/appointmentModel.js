const mongoose= require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },
  appointmentType:{
    type:String,
    enum:["online","offline"],
    default:"offline"
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true
  },
  

  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },

  token: {
    type: Number,
    //required: true
    default: null
  },

  status: {
    type: String,
    enum: ["PENDING", "CONFIRMED", "CANCELLED","COMPLETED"],
    default: "PENDING"
  },

  date: {
    type: Date,
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);
