
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const PharmacyModel = require("../models/PharmacyModel");
const MedicineModel = require("../models/Medicine");
const userModel = require("../models/userModel");
const { ROLE } = require("../config/role");


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
      lat,
      lng
    } = req.body;

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        msg: "Email already registered"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create login account
    const user = await userModel.create({
      name: ownerName,
      email,
      password: hashedPassword,
      role: ROLE.pharmacy,
      isActive: false
    });

    // Create pharmacy profile
    const pharmacy = await PharmacyModel.create({
      userId: user._id,
      shopName,
      ownerName,
      phone,
      licenseNumber,
      address,
      city,
      state,
      pincode,
      location: {
        type: "Point",
        coordinates: [lng, lat]
      },
      approvalStatus: "PENDING",
      isActive: false
    });

    return res.status(201).json({
      msg: "Pharmacy registered successfully. Waiting for admin approval.",
      pharmacyId: pharmacy._id
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      msg: `Server error: ${err.message}`
    });
  }
};

exports.loginPharmacy = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({
      email,
      role: ROLE.pharmacy
    });

    if (!user) {
      return res.status(401).json({
        msg: "Invalid email or password"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        msg: "Your pharmacy account is not approved yet"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        msg: "Invalid email or password"
      });
    }

    const pharmacy = await PharmacyModel.findOne({
      userId: user._id
    });

    if (!pharmacy) {
      return res.status(404).json({
        msg: "Pharmacy profile not found"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    return res.status(200).json({
      msg: "Pharmacy login successful",
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      pharmacy: {
        id: pharmacy._id,
        shopName: pharmacy.shopName,
        ownerName: pharmacy.ownerName,
        phone: pharmacy.phone,
        licenseNumber: pharmacy.licenseNumber,
        address: pharmacy.address,
        city: pharmacy.city,
        state: pharmacy.state,
        pincode: pharmacy.pincode,
        location: pharmacy.location
      }
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      msg: `Server error: ${err.message}`
    });
  }
};

const parseMonthYear = (value) => {
  if (!value) return null;

  const match = value.match(/^(\d{1,2})[\/.-](\d{4})$/);

  if (!match) return null;

  const month = Number(match[1]);
  const year = Number(match[2]);

  if (month < 1 || month > 12) return null;

  return new Date(year, month - 1, 1);
};

exports.addMedicine = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      medicineName,
      strength,
      batchNumber,
      manufacturingDate,
      expiryDate,
      price,
      stock,
      category,
      manufacturer,
      description,
      addedVia,
    } = req.body;

    if (
      !medicineName ||
      !batchNumber ||
      !manufacturingDate ||
      !expiryDate ||
      price === undefined ||
      stock === undefined
    ) {
      return res.status(400).json({
        success: false,
        msg: "Required medicine details are missing",
      });
    }

    const manufacturing = parseMonthYear(manufacturingDate);
    const expiry = parseMonthYear(expiryDate);

    if (!manufacturing || !expiry) {
      return res.status(400).json({
        success: false,
        msg: "Dates must be in MM/YYYY format",
      });
    }

    const pharmacy = await PharmacyModel.findOne({ userId });

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        msg: "Pharmacy not found",
      });
    }

    const existingMedicine = await MedicineModel.findOne({
      pharmacyId: pharmacy._id,
      batchNumber: batchNumber.trim(),
    });

    if (existingMedicine) {
      return res.status(400).json({
        success: false,
        msg: "Medicine with this batch number already exists",
      });
    }

    const medicine = await MedicineModel.create({
      pharmacyId: pharmacy._id,
      medicineName: medicineName.trim(),
      strength: strength?.trim() || "",
      batchNumber: batchNumber.trim(),
      manufacturingDate: manufacturing,
      expiryDate: expiry,
      price: Number(price),
      stock: Number(stock),
      category: category?.trim() || "",
      manufacturer: manufacturer?.trim() || "",
      description: description?.trim() || "",
      addedVia: addedVia === "OCR" ? "OCR" : "MANUAL",
    });

    return res.status(201).json({
      success: true,
      msg: "Medicine added successfully",
      medicine,
    });
  } catch (error) {
    console.error("Add medicine error:", error);

    return res.status(500).json({
      success: false,
      msg: "Failed to add medicine",
      error: error.message,
    });
  }
};

// Inventory for the logged-in pharmacy only.
// medicineController.getAllMedicine returns every pharmacy's batches and has no
// auth, so the pharmacy dashboard reads this instead.
exports.getMyInventory = async (req, res) => {
  try {
    const pharmacy = await PharmacyModel.findOne({ userId: req.user.id })
      .select("shopName ownerName phone address city state pincode licenseNumber approvalStatus isActive")
      .lean();

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        msg: "Pharmacy not found",
      });
    }

    // Batch documents - the same medicine appears once per batchNumber.
    const medicines = await MedicineModel.find({ pharmacyId: pharmacy._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: medicines.length,
      pharmacy,
      medicines,
    });
  } catch (error) {
    console.error("Get pharmacy inventory error:", error);

    return res.status(500).json({
      success: false,
      msg: "Failed to fetch inventory",
      error: error.message,
    });
  }
};
