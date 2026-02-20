


const dotenv = require('dotenv');
const userModel = require('../model/userModel');
const crypto = require("crypto");
const bcrypt = require('bcrypt');
const { ROLE } = require('../config/Role');
const nodemailer = require("nodemailer");
const sendEmail = require('../utils/sendEmail');
const docterModel = require('../model/docterModel');
dotenv.config();

const addDoctor = async (req, res) => {
  try {
        const { name, email, phone_number } = req.body;

        // 1️⃣ Check email duplicate
        const existingDoctor = await userModel.findOne({ email });
        if (existingDoctor) {
            return res.status(400).json({ success: false, msg: "Doctor email already exists" });
        }
        const randomPassword = crypto.randomBytes(4).toString("hex");
        const hashedPassword = await bcrypt.hash(randomPassword,10);
         // 3️⃣ Create doctor
        const doctor = await userModel.create({
        name,
        email,
        phone_number,
        password: hashedPassword,
        role: ROLE.doctor,
        hospitalId: req.user.hospitalId
        });

        // await docterModel.create({
        //     userId: doctor._id,
        //     hospital: req.user.hospitalId,
        //     profileCompleted: false,
        //     isActive: true
        // });


        // 4️⃣ Send email with credentials (optional)
        await sendEmail({
            to: email,
            subject: "Welcome to MediReach - Doctor Account",
            text: `Hello ${name}, your account is created.\nEmail: ${email}\nPassword: ${randomPassword}\nLogin here: <frontend-login-url>`
            });
            res.status(201).json({
            success: true,
            msg: "Doctor added successfully",
            data: { id: doctor._id, name: doctor.name, email: doctor.email }
        });
    }catch(error){
        res.status(500).json({ success: false, msg: error.message });
    }
}


module.exports = {
    addDoctor
}