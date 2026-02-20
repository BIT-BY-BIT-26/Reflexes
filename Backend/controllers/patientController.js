const { ROLE } = require("../config/Role");
const appointmentModel = require("../models/appointmentModel");
const docterModel = require("../models/docterModel");
const patientModel = require("../models/patientModel");
const userModel = require("../models/userModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const getSignedUrl = require("../utils/getSignedUrl");
const reportModel = require("../models/reportModel");

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
// Reception creates walk-in patient
const createWalkInPatient = async (req, res) => {
  try {
    const { age, gender, bloodGroup } = req.body;

    const patient = await patientModel.create({
      userId: null,   // 👈 very important
      age,
      gender,
      bloodGroup
    });

    res.status(201).json({
      message: "Walk-in patient created",
      patient
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


//GET DAILY PATIENTS=============================================
const getDailyPatientsWithDetails = async (req, res) => {
  try {
    const { hospitalId, date } = req.query;

    if (!hospitalId || !date) {
      return res.status(400).json({
        success: false,
        message: "hospitalId and date are required"
      });
    }

    // Day range
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Fetch appointments with patient populated
    const appointments = await appointmentModel.find({
      hospital: hospitalId,
      date: { $gte: startDate, $lte: endDate },
      status: { $ne: "CANCELLED" }
    })
      .populate({
        path: "patient",
        populate: {
          path: "userId",
          select: "name email phone_number"
        }
      });

    // Unique patients (avoid duplicates)
    const uniqueMap = new Map();

    appointments.forEach(app => {
      if (app.patient && app.patient._id) {
        uniqueMap.set(app.patient._id.toString(), app.patient);
      }
    });

    const uniquePatients = Array.from(uniqueMap.values());

    res.status(200).json({
      success: true,
      date,
      totalPatients: uniquePatients.length,
      patients: uniquePatients
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch daily patients",
      error: error.message
    });
  }
};


//patient ko apna reports milega----
const getMyReports = async (req, res) => {
  try {
    const patient = await patientModel.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    const reports = await reportModel.find({
      patient: patient._id
    }).sort({ createdAt: -1 });

    const formatted = reports.map(r => ({
      id: r._id,
      title: r.title,
      type:r.type,
      uploadedAt: r.createdAt,
      filePublicId: getSignedUrl(r.filePublicId),
      fileType: r.fileType
    }));

    res.json({ reports: formatted });
  } catch (e) {
    res.status(500).json({ message: `Failed to fetch reports ${e.message}`});
  }
};


const getPatientAppointments = async(req,res)=>{
  try{
    const doctor =await docterModel.findOne({userId: req.user.id});
    if(!doctor){
      return res.status(400).json({message:"Doctor not found"});
    }
    const appointments = await appointmentModel.find({
      patient:req.params.patientId,
      doctor:doctor._id
    }).sort({date:-1})
    .select("date status token createdAt");

    res.status(200).json({
      appointments
    })

  }catch(error){
    res.status(500).json({message:`Failed to fetch appointments ${error.message}`});
  }
}


//============== UPDATE PATIENT PROFILE====================
const updatePatientProfile = async (req, res) => {
  try {
    const { age, gender, bloodGroup,phone_number } = req.body;

    // logged-in user se patient nikalo
    const patient = await patientModel.findOne({ userId: req.user.id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        msg: "Patient profile not found"
      });
    }

    // update only provided fields
    if (age !== undefined) patient.age = age;
    if (gender) patient.gender = gender;
    if (bloodGroup) patient.bloodGroup = bloodGroup;
    if(phone_number) patient.phone_number = phone_number;

    await patient.save();

    res.status(200).json({
      success: true,
      msg: "Patient profile updated successfully",
      patient
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Error updating patient profile ${err.message}`
    });
  }
};


const getPatientProfile = async(req,res)=>{
  try{
    const patient = await patientModel.findById(req.params.patientId).populate("userId","name email gender");
    if(!patient){
      return res.status(400).json({messgae:"Patient not found"});
    }
    res.json({
      // id:patient._id,
      // name:patient.userId.name,
      // email:patient.userId.email,
      // email:patient.userId.gender,
      patient
    })
  }catch(e){
    res.status(500).json({message:"Failed to fetch patient"});
  }
}

//FOR PATIENTS__
const getMyProfile = async (req, res) => {
  try {
    const patient = await patientModel
      .findOne({ userId: req.user.id })
      .populate("userId", "name email");

    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    res.json({ patient });
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

//doctor sirf whi reports dekhega jo patient ne share ki h
 const getPatientReportForDoctor = async(req,res)=>{
  try{
    const doctor = await docterModel.findOne({userId:req.user.id});
    if(!doctor){
      return res.status(400).json({messgae:"Doctor not found"});

    }
    const reports = await reportModel.find({
      patient:req.params.patientId,
      $or:[
        {doctorId:doctor._id},
        {sharedWithDoctors:doctor._id}
      ]
    }).sort({createdAt:-1});

    const formatted = reports.map(r=>({
      id:r._id,
      title:r.title,
      uploadedAt:r.createdAt,
      file : getSignedUrl(r.filePublicId)
    }))
    res.json({reports:formatted})
  }catch(e){
    res.status(500).json({message:`Failed to fetch patient ${e.message}`});
  }
}



module.exports = { registerPatient,getMyProfile,createWalkInPatient,updatePatientProfile,getPatientAppointments,getPatientProfile ,getPatientReportForDoctor, updatePatientProfile,getMyReports};
