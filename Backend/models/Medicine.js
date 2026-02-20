const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brand: String,
    category: String,   // tablet, syrup, injection
    dosage: String,     // 500mg etc
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medicine", medicineSchema);
