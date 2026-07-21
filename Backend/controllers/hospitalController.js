const dotenv = require('dotenv');
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const HospitalModel = require('../models/HospitalModel');
dotenv.config();
const fs = require("fs");
const path = require("path");
const { ROLE } = require('../config/role');
const sendEmail = require('../utils/sendEmail');
const docterModel = require('../models/docterModel');
const departmentModel = require('../models/departmentModel');
const appointmentModel = require('../models/appointmentModel');
const patientModel = require('../models/patientModel');

const registerHospital = async (req, res) => {
    try {
        
        const { name, city, email, state, pincode, hospitalLicense,phone_number, lat, lng ,adminName, adminEmail, adminPassword} = req.body;

        const existingHospital = await HospitalModel.findOne({ hospitalLicense });
        if (existingHospital) {
            return res.status(400).json({
                success: false,
                msg: "Hospital already exists"
            });
        }

        const hospital = await HospitalModel.create({
            name,
            city,
            email,
            state,
            pincode,
            hospitalLicense,
            phone_number,
            location: {
                type: 'Point',
                coordinates: [lng, lat]  // MongoDB uses [lng, lat]
            }
        });
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const admin=  await userModel.create({
            name:adminName,
            email:adminEmail,
            password:hashedPassword,
            role:ROLE.admin,
            hospitalId:hospital._id 
        }) 

        const accessToken = jwt.sign({
            id:admin._id,email:admin.email, role:admin.role,hospitalId:hospital
        },process.env.JWT_SECRET,{expiresIn:"1d"});

        res.status(201).json({
            success: true,
            msg: "Hospital & Admin registered successfully",
            data: { hospital, admin },
            accessToken,
            tokenType:"Bearer"
        });

    } catch (e) {
        res.status(500).json({
            success: false,
            message: "Hospital registration failed",
            error: e.message
        });
    }
};

const updateHospitalProfile = async(req,res)=>{
  console.log(req.body);

  console.log("FILES:");
  console.log(req.files);
  try{
    const hospitalId = req.user.hospitalId;

    const updateData = {
      description: req.body.description,
      address:req.body.address,
      facilities:JSON.parse(req.body.facilities || "[]"),
      timings:JSON.parse(req.body.timings || "{}")
    };
    if(req.files?.logo){
      updateData.logo=req.files.logo[0].path;
    }

    if(req.files?.coverImage){
      updateData.coverImage=
      req.files.coverImage[0].path;
    }

    if (req.files?.galleryImages) {
      updateData.galleryImages =
        req.files.galleryImages.map(
          img => img.path
        );
    }
    const isComplete =
      updateData.description &&
      updateData.address &&
      updateData.facilities?.length > 0 &&
      Object.keys(updateData.timings || {}).length > 0 &&
      updateData.logo &&
      updateData.coverImage &&
      updateData.galleryImages?.length > 0;

    updateData.profileCompleted = !!isComplete;
console.log("hospitalId:", hospitalId);
    const hospital =
      await HospitalModel.findByIdAndUpdate(
        hospitalId,
        updateData,
        { new: true }
      );

    res.status(200).json({
      success:true,
      data:hospital,
      profileCompleted:hospital.profileCompleted
    })
  }catch(error){
    res.status(500).json({
      success:false,
      message:error.message
    })
  }
}



const getHospitalProfile = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;

    const hospital = await HospitalModel.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found"
      });
    }

    res.status(200).json({
      success: true,
      data: hospital
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getHospitalById = async (req, res) => {
  try {
    const { id } = req.params;

    const hospital = await HospitalModel.findById(id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    res.status(200).json({
      success: true,
      data: hospital,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getStats = async(req,res)=>{
  console.log("entered");
  try{
    const hospitalId = req.user.hospitalId;
    const countDoctor = await userModel.countDocuments({
      hospitalId:hospitalId,
      role:"DOCTOR"
    });
    const countDepartment = await departmentModel.countDocuments({
      hospital:hospitalId,
    })
    const countAppointment= await appointmentModel.countDocuments({
      hospitalId:hospitalId,
    })
    const countPatient = await patientModel.countDocuments({
      hospitalId:hospitalId
    })
    res.status(200).json({
      success:true,
      countDoctor,
      countDepartment,
      countAppointment,
      countPatient
    });
    console.log("left")
  }catch(error){
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

const approveHospital = async (req, res) => {
    try {
        const hospitalId = req.params.id;

        const hospital = await HospitalModel.findById(hospitalId);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found"
            });
        }

        // check duplicate user
        const existingUser = await userModel.findOne({ email: hospital.email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Admin already exists for this hospital"
            });
        }

        // approve hospital
        hospital.status = "approved";
        hospital.isActive = true;
        await hospital.save();

        // create admin
        await userModel.create({
            name: `${hospital.name} Admin`,
            email: hospital.email,
            role: ROLE.admin,
            hospitalId: hospital._id,
            isActive: true
        });

        // send email
        await sendEmail({
            to: hospital.email,
            subject: "Medireach Account Approved 🎉",
            text: `
Your hospital has been approved.

Login here:
http://localhost:3000/login
            `
        });

        res.status(200).json({
            success: true,
            message: "Hospital approved successfully",

        });

    } catch (e) {
        res.status(500).json({
            success: false,
            message: "Approval failed",
            error: e.message
        });
    }
};

const getAllHospitals = async(req,res)=>{
  try{
    const hospitals = await HospitalModel.find();
    res.status(200).json({
            success: true,
            data: hospitals
        });
  }catch(e){
     res.status(500).json({
            success: false,
            message: "Failed to fetch hospitals",
            error: e.message
        });
  }
}

const getHospitalsQuery = async (req, res) => {
    try {
        const { status } = req.query;
        console.log("REQ QUERY:", req.query);
        let filter = {};

        if (status) {
            filter.status = status;
        }
console.log("FILTER:", filter);
        const hospitals = await HospitalModel.find(filter);
        res.status(200).json({
            success: true,
            data: hospitals
        });

    } catch (e) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch hospitals",
            error: e.message
        });
    }
};

const getHospitals = async (req, res) => {
  try {
    const { state, city, lat, lng, radius = 10 } = req.query;

    // normal filter
    let matchStage = {};

    if (state) {
//         regex → case insensitive match
// "bhagalpur" == "Bhagalpur"
      matchStage.state = { $regex: `^${state}$`, $options: "i" };
    }

    if (city) {
      matchStage.city = { $regex: `^${city}$`, $options: "i" };
    }

    // ✅ If location provided → use geoNear
    if (lat && lng) {
      const hospitals = await HospitalModel.aggregate([//aggregate :-MongoDB ka advanced processing mode
        {
          $geoNear: {//Is coordinate ke paas jo documents hain, unko find karo + distance calculate karo
            near: {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            distanceField: "distanceMeters",
            maxDistance: parseFloat(radius) * 1000,//Radius km me aaya → Mongo meters me kaam karta hai
            spherical: true,//spherical distance formula use karega (Haversine)
            query: matchStage//geosearch ke sath city, state filter bhi lag jayega
          }
        },

        // meters → km convert
        {
          $addFields: {
            distanceKm: {
              $round: [
                { $divide: ["$distanceMeters", 1000] },
                2
              ]
            }
          }
        },

        { $sort: { distanceMeters: 1 } }//ascending order
      ]);

      return res.status(200).json({
        success: true,
        msg: "Nearby hospitals with distance",
        count: hospitals.length,
        data: hospitals
      });
    }

    // ✅ If no lat/lng → normal search
    const hospitals = await HospitalModel.find(matchStage)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      msg: "Hospitals list",
      count: hospitals.length,
      data: hospitals
    });

  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch hospitals",
      error: e.message
    });
  }
};


const getHospitalStates = async (req, res) => {
  try {
    const states = await HospitalModel.distinct("state");

    res.status(200).json({
      success: true,
      data: states
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch states"
    });
  }
};

const getHospitalCities = async (req, res) => {
  try {
    const { state } = req.query;

    if (!state) {
      return res.status(400).json({ message: "State required" });
    }

    const cities = await HospitalModel.distinct("city", {
      state: { $regex: `^${state}$`, $options: "i" }
    });

    res.status(200).json({
      success: true,
      data: cities
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch cities"
    });
  }
};

module.exports= { registerHospital,getHospitalById,updateHospitalProfile,getHospitalProfile, getStats, approveHospital,getAllHospitals,getHospitalsQuery, getHospitals, getHospitalCities, getHospitalStates};
