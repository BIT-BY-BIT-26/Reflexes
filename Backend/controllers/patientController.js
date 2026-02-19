const { ROLE } = require("../config/Role");
const patientModel = require("../models/patientModel");
const userModel = require("../models/userModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerPatient = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Name, email and password are required"
      })
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        msg: "User already exists with this email"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create patient 
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role: ROLE.patient,
      isActive: true
    });

    const patient = await patientModel.create({
      userId: user._id
    });

    //token generate--
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d" 
      }
    );


    // Response
    return res.status(201).json({
      success: true,
      msg: "Patient registered successfully",
      role:user.role,
      token,
      user: {
        id: user._id,
        patientId:patient._id,
        name: user.name,
        email: user.email,
        //role: user.role
      }
    });

  } catch (error) {
    console.error("Register Patient Error:", error);
    return res.status(500).json({
      success: false,
      msg: "Internal server error"
    });
  }
};


module.exports = { registerPatient};
