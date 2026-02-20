// const User = require("../model/userModel");
// const Department = require("../model/departmentModel");
// const docterModel = require("../models/docterModel");
// const { ROLE } = require("../config/Role");
// const HospitalModel = require("../models/HospitalModel");
// const Appointment = require("../models/Appointment");

const docterModel = require("../models/docterModel");
const HospitalModel = require("../models/HospitalModel");
const Appointment = require("../models/appointmentModel");
/* ================= GET DOCTORS ================= */

const getDoctorsByDepartment = async (req, res) => {
  try {
    const { hospitalId, departmentId } = req.params;
    const doctors = await docterModel.find({
      hospital: hospitalId,
      department: departmentId,
      isActive: true,
      profileCompleted: true,
    })
      .populate("userId", "name email phone_number")
      .populate("hospital", "name")
      .sort({ experience: -1 });

    res.json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getDoctorByHospital = async(req,res)=>{
  try{
    const hospitalId = req.user.hospitalId;
    if(!hospitalId){
      return res.status(400).json({
        success: false,
        message: "Hospital ID not found in token",
      });
    }
    const hospital = await HospitalModel.findById(hospitalId).select("name");
    if(!hospital){
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }
    const doctors = await docterModel.find({
      hospital:hospitalId,
    }).populate("userId","name email phone_number")
    .populate("department", "_id name")
    .select("phone_number isActive createdAt opd_timing experience specialisation")
    .sort({createdAt:-1});
    res.status(200).json({
      success:true,
      hospital,
      total:doctors.length,
      doctors
    })

  }catch(error){
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/* ================= TOGGLE DOCTOR ================= */

/* ================= SEARCH PATIENT ================= */

const searchPatient = async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await userModel
    .find(keyword)
    .find({ _id: { $ne: req.user._id } });

  res.send(users);
};

/* ================= DOCTOR PROFILE ================= */

const getProfileStatus = async (req, res) => {
  const doctor = await docterModel
    .findOne({ userId: req.user.id })
    .populate("user", "name");

  if (!doctor) {
    return res.json({ exists: false, profileCompleted: false });
  }

  res.json({
    exists: true,
    profileCompleted: doctor.profileCompleted,
    data: doctor,
  });
};
const submitProfile = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    const userId = req.user.id;

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID missing in token"
      });
    }

    const {
      position,
      profile_photo,
      department,
      opd_timing,
      experience,
      specialisation,
      availableDays,
      onlineAvailabitity,
      registrationNumber
    } = req.body;

    // Required validation
    if (!position || !department) {
      return res.status(400).json({
        success: false,
        message: "Position and Department are required"
      });
    }

    // Check doctor already exists
    const existingDoctor = await docterModel.findOne({ userId });

    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor profile already exists"
      });
    }

    const doctor = new docterModel({
      userId,
      hospital: hospitalId,
      position,
      profile_photo,
      department,
      opd_timing,
      experience,
      specialisation,
      availableDays,
      onlineAvailabitity,
      registrationNumber,
      profileCompleted: true
    });

    await doctor.save();

    res.status(201).json({
      success: true,
      message: "Doctor profile created successfully",
      doctor
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Profile submit failed",
      error: error.message
    });
  }
};

const getMyProfile = async (req, res) => {
  try {

    const doctor = await docterModel
      .findOne({ userId: req.user.id })
      .populate("userId","name email")
      .populate("hospital","name")
      .populate("department","name")

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }
    res.json({
      success: true,
      doctor
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch doctor profile",
      error: error.message
    });
  }
};
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const hospitalId = req.user.hospitalId;

    const doctor = await docterModel.findOne({ userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found"
      });
    }

    const {
      position,
      profile_photo,
      department,
      opd_timing,
      experience,
      specialisation,
      availableDays,
      onlineAvailabitity,
      registrationNumber
    } = req.body;

    // Professional safe update
    if (position !== undefined) doctor.position = position;
    if (profile_photo !== undefined) doctor.profile_photo = profile_photo;
    if (department !== undefined) doctor.department = department;
    if (opd_timing !== undefined) doctor.opd_timing = opd_timing;
    if (experience !== undefined) doctor.experience = experience;
    if (specialisation !== undefined) doctor.specialisation = specialisation;
    if (availableDays !== undefined) doctor.availableDays = availableDays;
    if (onlineAvailabitity !== undefined)
      doctor.onlineAvailabitity = onlineAvailabitity;
    if (registrationNumber !== undefined)
      doctor.registrationNumber = registrationNumber;

    // Always sync hospital from token
    doctor.hospital = hospitalId;

    await doctor.save();

    res.json({
      success: true,
      message: "Doctor profile updated successfully",
      doctor
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Profile update failed",
      error: error.message
    });
  }
};

const getCompletedAppointments = async (req, res) => {
  try {

    const doctor = await docterModel.findOne({
      userId: req.user.id
    });

    const appointments = await Appointment.find({
      doctor: doctor._id,
      status: "COMPLETED"
    })
      .populate({
        path: "patient",
        select: "userId",
        populate: {
          path: "userId",
          select: "name email"
        }
      })
      .select("patient token date status")
      .sort({ date: -1 });

    res.json({
      success: true,
      appointments
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch completed appointments"
    });
  }
};

const toggleDoctorOnline = async (req, res) => {
  try {
    const doctor = await docterModel.findOne({
      userId: req.user.id
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    doctor.isOnline = !doctor.isOnline;
    doctor.lastSeen = new Date();

    // If doctor goes offline → OPD auto stop
    if (!doctor.isOnline) {
      doctor.opdStarted = false;
    }

    await doctor.save();

    res.json({
      success: true,
      isOnline: doctor.isOnline
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const toggleOpd = async (req, res) => {
  try {
    const doctor = await docterModel.findOne({
      userId: req.user.id
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    if (!doctor.isOnline) {
      return res.status(400).json({
        success: false,
        message: "Doctor must be online to start OPD"
      });
    }

    doctor.opdStarted = !doctor.opdStarted;
    await doctor.save();

    res.json({
      success: true,
      opdStarted: doctor.opdStarted
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const uploadDoctorPhoto = async (req, res) => {
  try {
    const doctor = await docterModel.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    doctor.profile_photo = req.file.path;

    await doctor.save();   // ⭐ FIXED

    res.json({
      message: "Photo uploaded",
      photo: doctor.profile_photo
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};


module.exports={toggleOpd,toggleDoctorOnline,getProfileStatus,submitProfile, getDoctorByHospital, searchPatient,getDoctorsByDepartment,getMyProfile,getCompletedAppointments,updateProfile,uploadDoctorPhoto};