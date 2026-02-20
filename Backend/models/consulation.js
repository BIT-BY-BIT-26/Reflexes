const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    roomId: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "ONGOING", "COMPLETED", "CANCELLED"],
      default: "ACTIVE",
    },

    startedAt: Date,
    endedAt: Date,

    duration: Number, // minutes

    notes: String, // doctor notes optional

  },
  { timestamps: true }
);

module.exports = mongoose.model("Consultation", consultationSchema);
