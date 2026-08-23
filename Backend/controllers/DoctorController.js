

const docterModel = require("../models/docterModel");
const HospitalModel = require("../models/HospitalModel");
const Appointment = require("../models/appointmentModel");
const patientModel = require("../models/patientModel");
const { redisClient } = require("../config/redisClient");
const departmentModel = require("../models/departmentModel");
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
    .select("phone_number isActive createdAt opd_timing experience registrationNumber  availableDays consultationFee specialisation")
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


const getDoctorById = async(req,res)=>{
  try{
    const {id} = req.params;
    const doctor = await doctorModel.findById(id)
    .populate("userId","name email phone_number")
    .populate("hospital","name")
    .populate("department","name");

    if(!doctor){
      return res.status(404).json({
        success:false,
        message:"Doctor not found"
      })
    }
    res.json({
      success:true,
      doctor
    })
  }catch(error){
    res.status(500).json({
      success:false,
      message:"Failed to fetch doctor profile",
      error:error.message
    })
  }
}


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
// const users = await userModel.find({
//   ...keyword,
//   _id: { $ne: req.user._id },
// });
  res.send(users);
};


const getProfileStatus = async (req, res) => {
  const doctor = await docterModel
    .findOne({ userId: req.user.id })

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
      experience,
      specialisations,
      onlineAvailabitity,
      registrationNumber,
      consultationFee,
      languages
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
        message: "Doctor profile already exists",
        existingDoctor
      });
    }

    const departmentExists = await departmentModel.findOne({
        _id: department,
        hospital: hospitalId
      });

      if (!departmentExists) {
        return res.status(404).json({
          success: false,
          message: "Department not found in this hospital"
        });
      }

    if (registrationNumber) {
      const existingRegistration = await docterModel.findOne({
        registrationNumber
      });

      if (existingRegistration) {
        return res.status(400).json({
          success: false,
          message: "Registration number already exists"
        });
      }
    }

    const doctor = new docterModel({
      userId,
      hospital: hospitalId,
      position,
      profile_photo:profile_photo || "",
      department,
      experience:experience || 0,
      specialisations : specialisations || [],
      onlineAvailabitity : onlineAvailabitity || {},
      registrationNumber,
      consultationFee:consultationFee || 0,
      languages:languages || [],
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
      specialisations,
      availableDays,
      onlineAvailabitity,
      registrationNumber,
      consultationFee
    } = req.body;

    // Professional safe update
    if (position !== undefined) doctor.position = position;
    if (profile_photo !== undefined) doctor.profile_photo = profile_photo;
    if (department !== undefined) doctor.department = department;
    if (opd_timing !== undefined) doctor.opd_timing = opd_timing;
    if (experience !== undefined) doctor.experience = experience;
    if (specialisation !== undefined) doctor.specialisation = specialisation;
    if (availableDays !== undefined) doctor.availableDays = availableDays;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
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

const getUniquePatients = async (req, res) => {
  try {
    const doctor = await docterModel.findOne({
      userId: req.user.id,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Unique patient IDs
    const patientIds = await Appointment.distinct("patient", {
      doctor: doctor._id,
      status: "COMPLETED",
    });

    // Patient details
    const patients = await patientModel.find({
      _id: { $in: patientIds },
    }).populate({
      path: "userId",
      select: "name email gender phone",
    });

    return res.status(200).json({
      success: true,
      total: patients.length,
      patients,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getDoctorDashboard = async (req, res) => {
  try {
    // Find logged-in doctor
    const doctor = await docterModel.findOne({
      userId: req.user.id,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Redis cache key
    const cacheKey = `doctor:dashboard:${doctor._id}`;

    // 1. Check Redis first
    const cachedDashboard = await redisClient.get(cacheKey);

    if (cachedDashboard) {
      return res.status(200).json({
        success: true,
        dashboard: JSON.parse(cachedDashboard),
        source: "redis",
      });
    }

    // Today's date range
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    // 2. Run all queries in parallel
    const [
      totalAppointments,
      completedAppointments,
      confirmedAppointments,
      pendingAppointments,
      uniquePatients,
      todayCompletedAppointments,
      todayNewPatients,
    ] = await Promise.all([
      // Total appointments
      Appointment.countDocuments({
        doctor: doctor._id,
        date: {
          $gte: start,
          $lte: end,
        },
      }),

      // Completed
      Appointment.countDocuments({
        doctor: doctor._id,
        status: "COMPLETED",
      }),

      // Confirmed
      Appointment.countDocuments({
        doctor: doctor._id,
        date: {
          $gte: start,
          $lte: end,
        },
        status: "CONFIRMED",
      }),

      // Pending
      Appointment.countDocuments({
        doctor: doctor._id,
        date: {
          $gte: start,
          $lte: end,
        },
        status: "PENDING",
      }),

      // Unique completed patients
      Appointment.distinct("patient", {
        doctor: doctor._id,
        status: "COMPLETED",
      }),

      // Today's completed appointments
      Appointment.countDocuments({
        doctor: doctor._id,
        status: "COMPLETED",
        date: {
          $gte: start,
          $lte: end,
        },
      }),

      // Today's new patients
      Appointment.aggregate([
        {
          $match: {
            doctor: doctor._id,
            status: {
              $in: ["PENDING", "CONFIRMED", "COMPLETED"],
            },
          },
        },
        {
          $sort: {
            date: 1,
          },
        },
        {
          $group: {
            _id: "$patient",
            firstVisit: {
              $first: "$date",
            },
          },
        },
        {
          $match: {
            firstVisit: {
              $gte: start,
              $lte: end,
            },
          },
        },
        {
          $count: "count",
        },
      ]),
    ]);

    // 3. Build dashboard object
    const dashboard = {
      totalPatients: uniquePatients.length,
      todayNewPatients:
        todayNewPatients.length > 0 ? todayNewPatients[0].count : 0,

      totalAppointments,
      completedAppointments,
      confirmedAppointments,
      pendingAppointments,

      todayCompletedAppointments,
    };

    // 4. Save in Redis for 60 seconds
    await redisClient.set(
      cacheKey,
      JSON.stringify(dashboard),
      "EX",
      60
    );

    // 5. Return response
    return res.status(200).json({
      success: true,
      dashboard,
      source: "mongodb",
    });

  } catch (error) {
    console.error("Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard",
      error: error.message,
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

const getCurrentPatient = async (req, res) => {
  try {
    const doctor = await docterModel.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    if (!doctor.opdStarted) {
      return res.status(400).json({
        success: false,
        message: "OPD not started"
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const currentAppointment = await Appointment.findOne({
      doctor: doctor.id,
      status: "CURRENT",
      date: { $gte: today, $lt: tomorrow }
    }).populate("patient"); // agar patient details bhi chahiye toh

    if (!currentAppointment) {
      return res.status(200).json({
        success: true,
        message: "No current patient",
        currentAppointment: null,
        opdPaused: doctor.opdPaused
      });
    }

    return res.status(200).json({
      success: true,
      message: "Current patient fetched",
      currentAppointment,
      opdPaused: doctor.opdPaused
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const startConsultation = async (req, res) => {
  try {
    const io = req.app.get("io");

    const doctor = await docterModel.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    if (!doctor.opdStarted) {
      return res.status(400).json({
        success: false,
        message: "OPD not started"
      });
    }

    if (doctor.opdPaused) {
      return res.status(400).json({
        success: false,
        message: "OPD is paused"
      });
    }

    const alreadyRunning = await Appointment.findOne({
      doctor: doctor.id,
      status: "CURRENT"
    });

    if (alreadyRunning) {
      return res.status(400).json({
        success: false,
        message: "Consultation already started"
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const firstAppointment = await Appointment.findOne({
      doctor: doctor.id,
      status: "CONFIRMED",
      date: { $gte: today, $lt: tomorrow }
    }).sort({ token: 1 });

    if (!firstAppointment) {
      return res.status(400).json({
        success: false,
        message: "No patients in queue"
      });
    }

    firstAppointment.status = "CURRENT";
    firstAppointment.consultationStartedAt = new Date();
    await firstAppointment.save();

    io.to(`doctor_${doctor.id}`).emit("queueUpdated", {
      currentToken: firstAppointment.token,
      status: "RUNNING"
    });

    return res.status(200).json({
      success: true,
      message: "Consultation started",
      currentAppointment: firstAppointment
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const stopConsultation = async (req, res) => {
  try {
    const io = req.app.get("io");

    const doctor = await docterModel.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    if (!doctor.opdStarted) {
      return res.status(400).json({
        success: false,
        message: "Consultation not started"
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Complete current patient if any
    const currentAppointment = await Appointment.findOne({
      doctor: doctor.id,
      status: "CURRENT",
      date: { $gte: today, $lt: tomorrow }
    });

    if (currentAppointment) {
      currentAppointment.status = "COMPLETED";
      currentAppointment.consultationEndedAt = new Date();
      await currentAppointment.save();
    }

    // End OPD
    doctor.opdStarted = false;
    doctor.opdPaused = false;
    await doctor.save();

    // Notify patients
    io.to(`doctor_${doctor.id}`).emit("opdStopped", {
      message: "OPD Stopped",
      status: "STOPPED"
    });

    return res.status(200).json({
      success: true,
      message: "Consultation stopped successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const pauseConsultation = async (req, res) => {
  try {
    const io = req.app.get("io");


    const doctor = await docterModel.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    if (!doctor.opdStarted) {
      return res.status(400).json({
        success: false,
        message: "OPD not started"
      });
    }

    if (doctor.opdPaused) {
      return res.status(400).json({
        success: false,
        message: "OPD already paused"
      });
    }

    doctor.opdPaused = true;

    await doctor.save();


    io.to(`doctor_${doctor.id}`).emit("opdPaused", {
      message: "OPD Paused"
    });

    return res.status(200).json({
      success: true,
      message: "OPD paused successfully"
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const resumeConsultation = async (req, res) => {
 
  try {
    const io = req.app.get("io");
    const doctor = await docterModel.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }
    if (!doctor.opdStarted) {
      return res.status(400).json({
        success: false,
        message: "OPD not started"
      });
    }
    if (!doctor.opdPaused) {
      return res.status(400).json({
        success: false,
        message: "OPD is already running"
      });
    }
    doctor.opdPaused = false;
    await doctor.save();

    const currentAppointment =
      await Appointment.findOne({
        doctor: doctor.id,
        status: "CURRENT"
      });


    io.to(`doctor_${doctor.id}`).emit("opdResumed", {
      currentToken: currentAppointment?.token ?? null
    });

    return res.status(200).json({
      success: true,
      message: "OPD resumed successfully"
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


const skipPatient = async (req, res) => {
  try {
    const io = req.app.get("io");
    const doctor = await docterModel.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    if (!doctor.opdStarted) {
      return res.status(400).json({
        success: false,
        message: "OPD not started"
      });
    }

    if (doctor.opdPaused) {
      return res.status(400).json({
        success: false,
        message: "OPD is paused"
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Find CURRENT patient
    const currentAppointment = await Appointment.findOne({
      doctor: doctor.id,
      status: "CURRENT",
      date: { $gte: today, $lt: tomorrow }
    });

    if (!currentAppointment) {
      return res.status(400).json({
        success: false,
        message: "No current patient to skip"
      });
    }

    // 2. Mark CURRENT → SKIPPED
    currentAppointment.status = "SKIPPED";
    currentAppointment.skippedAt = new Date();
    await currentAppointment.save();

    // 3. Find next CONFIRMED patient
    const nextAppointment = await Appointment.findOne({
      doctor: doctor.id,
      status: "CONFIRMED",
      date: { $gte: today, $lt: tomorrow }
    }).sort({ token: 1 });

    let message = "Patient skipped";

    if (!nextAppointment) {
      doctor.opdStarted = false;
      await doctor.save();

      return res.status(200).json({
        success: true,
        message: "No more patients. OPD ended after skip."
      });
    }

    // 4. Make next CURRENT
    nextAppointment.status = "CURRENT";
    nextAppointment.consultationStartedAt = new Date();
    await nextAppointment.save();

    io.to(`doctor_${doctor.id}`).emit("queueUpdated", {
      currentToken: nextAppointment.token,
      skippedToken: currentAppointment.token,
      status: "RUNNING"
    });

    return res.status(200).json({
      success: true,
      message,
      currentAppointment: nextAppointment
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const callNext = async (req, res) => {
  
  try {
    const io = req.app.get("io");
    const doctor = await docterModel.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    if (!doctor.opdStarted) {
      return res.status(400).json({
        success: false,
        message: "OPD not started"
      });
    }

    if (doctor.opdPaused) {
      return res.status(400).json({
        success: false,
        message: "OPD is paused"
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Find current patient
    const currentAppointment = await Appointment.findOne({
      doctor: doctor.id,
      status: "CURRENT",
      date: { $gte: today, $lt: tomorrow }
    });

    if (currentAppointment) {
      currentAppointment.status = "COMPLETED";
      currentAppointment.consultationEndedAt = new Date();
      await currentAppointment.save();
    }

    // 2. Find next patient
    const nextAppointment = await Appointment.findOne({
      doctor: doctor.id,
      status: "CONFIRMED",
      date: { $gte: today, $lt: tomorrow }
    }).sort({ token: 1 });

    if (!nextAppointment) {
      doctor.opdStarted = false;
      await doctor.save();

      return res.status(200).json({
        success: true,
        message: "No more patients. OPD ended."
      });
    }

    // 3. Make next patient CURRENT
    nextAppointment.status = "CURRENT";
    nextAppointment.consultationStartedAt = new Date();
    await nextAppointment.save();

    //SOCKET
    io.to(`doctor_${doctor.id}`).emit("queueUpdated", {
      currentToken: nextAppointment.token,
      status: "RUNNING"
    });

    return res.status(200).json({
      success: true,
      message: "Next patient called",
      currentAppointment: nextAppointment
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports={getDoctorDashboard,getCurrentPatient,getUniquePatients,toggleOpd,getProfileStatus,submitProfile,getDoctorById, getDoctorByHospital, searchPatient,getDoctorsByDepartment,getMyProfile,getCompletedAppointments,updateProfile,uploadDoctorPhoto,callNext,skipPatient,pauseConsultation,resumeConsultation,stopConsultation,startConsultation};
