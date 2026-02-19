
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const PharmacyModel = require("../models/PharmacyModel");


// ✅ REGISTER PHARMACY
exports.registerPharmacy = async (req, res) => {
  try {
    const {
      shopName,
      ownerName,
      email,
      phone,
      password,
      licenseNumber,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
    } = req.body;

    // check existing
    const existing = await PharmacyModel.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "Pharmacy already registered" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const pharmacy = await PharmacyModel.create({
      shopName,
      ownerName,
      email,
      phone,
      password: hashedPassword,
      licenseNumber,
      address,
      city,
      state,
      pincode,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    });

    res.status(201).json({
      msg: "Pharmacy registered successfully. Waiting for admin approval.",
      pharmacyId: pharmacy._id,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};



// ✅ LOGIN PHARMACY
exports.loginPharmacy = async (req, res) => {
  try {
    const { email, password } = req.body;

    const pharmacy = await PharmacyModel.findOne({ email });
    if (!pharmacy) {
      return res.status(404).json({ msg: "Pharmacy not found" });
    }

    const isMatch = await bcrypt.compare(password, pharmacy.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    if (!pharmacy.isVerified) {
      return res.status(403).json({
        msg: "Waiting for admin approval",
      });
    }

    const token = jwt.sign(
      {
        id: pharmacy._id,
        role: pharmacy.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      role: pharmacy.role,
      pharmacy,
    });

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
