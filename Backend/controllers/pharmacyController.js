
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const PharmacyModel = require("../models/PharmacyModel");
const userModel = require("../models/userModel");
const { ROLE } = require("../config/role");


// ✅ REGISTER PHARMACY
exports.registerPharmacy = async (req, res) => {
  try {
    console.log(req.body);

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
      lat,
      lng,
    } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "Email already registered" });

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await userModel.create({
    name: ownerName, 
    email,
    password: hashedPassword,
    role: ROLE.pharmacy,
    isActive: true
  });
    const pharmacy = await PharmacyModel.create({
      userId: user._id,
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
        coordinates: [lng, lat],
      }
    });

    

    res.status(201).json({
      pharmacy,
      msg: "Pharmacy registered successfully. Waiting for admin approval.",
      pharmacyId: pharmacy._id,
    });

  } catch (err) {
    res.status(500).json({ msg: `Server error ${err.message}` });
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
