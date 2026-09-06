const docterModel = require("../models/docterModel");
const HospitalModel = require("../models/HospitalModel");
const Appointment = require("../models/appointmentModel");
const patientModel = require("../models/patientModel");
const { redisClient } = require("../config/redisClient");
const { summaryCacheKey } = require("./medicalSummaryController");
const departmentModel = require("../models/departmentModel");
const { getUtcDayRange } = require("../utils/utcday");
const DEPARTMENTS = require("../constants/departments");
const { getDoctorOnlineSlots } = require("../services/onlineSlotService");
//const appointmentModel = require("../models/appointmentModel");
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

    // =========================
    // Hospital ID validation
    // =========================
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
      registrationNumber,
      consultationFee,
      languages
    } = req.body;
    if (!position || !department) {
      return res.status(400).json({
        success: false,
        message: "Position and Department are required"
      });
    }
    const existingDoctor = await docterModel.findOne({
      userId
    });

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
      profile_photo: profile_photo || "",
      department,
      experience: experience || 0,
      specialisations: specialisations || [],
      registrationNumber,
      consultationFee: consultationFee || 0,
      languages: languages || [],
      profileCompleted: true
    });

    await doctor.save();

    return res.status(201).json({
      success: true,
      message: "Doctor profile created successfully",
      doctor
    });

  } catch (error) {

    console.error("SUBMIT DOCTOR PROFILE ERROR:", error);

    return res.status(500).json({
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
      registrationNumber,
      consultationFee
    } = req.body;

    // =========================
    // Professional profile update
    // =========================

    if (position !== undefined)
      doctor.position = position;

    if (profile_photo !== undefined)
      doctor.profile_photo = profile_photo;

    if (department !== undefined)
      doctor.department = department;

    if (opd_timing !== undefined)
      doctor.opd_timing = opd_timing;

    if (experience !== undefined)
      doctor.experience = experience;

    if (specialisations !== undefined)
      doctor.specialisations = specialisations;

    if (availableDays !== undefined)
      doctor.availableDays = availableDays;

    if (consultationFee !== undefined)
      doctor.consultationFee = consultationFee;

    // =========================
    // Registration number
    // =========================

    if (registrationNumber !== undefined)
      doctor.registrationNumber = registrationNumber;

    // Always sync hospital from logged-in user
    doctor.hospital = hospitalId;

    await doctor.save();

    return res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully",
      doctor
    });

  } catch (error) {

    console.error("UPDATE DOCTOR PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Profile update failed",
      error: error.message
    });
  }
};

// ========================================================
// UPDATE ONLINE AVAILABILITY
// Doctor can update this daily
// ========================================================

const updateOnlineAvailability = async (req, res) => {
  try {

    const userId = req.user.id;

    // ------------------------------------------------------
    // 1. Find doctor
    // ------------------------------------------------------

    const doctor = await docterModel.findOne({ userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found"
      });
    }

    // ------------------------------------------------------
    // 2. Get data from body
    // ------------------------------------------------------

    const {
      isAvailable,
      from,
      to,
      consultationDuration,
      bufferTime
    } = req.body;

    // ------------------------------------------------------
    // 3. Validate isAvailable
    // ------------------------------------------------------

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be true or false"
      });
    }

    // ------------------------------------------------------
    // 4. If doctor is disabling online consultation
    // ------------------------------------------------------

    if (!isAvailable) {
      doctor.onlineAvailability = {
        from: doctor.onlineAvailability?.from ?? null,
        to: doctor.onlineAvailability?.to ?? null,

        consultationDuration:
          consultationDuration ??
          doctor.onlineAvailability?.consultationDuration ??
          20,

        bufferTime:
          bufferTime ??
          doctor.onlineAvailability?.bufferTime ??
          10,

        isAvailable: false
      };

      await doctor.save();

      return res.status(200).json({
        success: true,
        message: "Online consultation temporarily disabled",
        onlineAvailability: doctor.onlineAvailability
      });
    }

    // ------------------------------------------------------
    // 5. If enabling, from and to are required
    // ------------------------------------------------------

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message:
          "From and to time are required when online consultation is enabled"
      });
    }

    // ------------------------------------------------------
    // 6. Validate time format
    // HH:mm
    // ------------------------------------------------------

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timeRegex.test(from) || !timeRegex.test(to)) {
      return res.status(400).json({
        success: false,
        message: "Time must be in HH:mm format"
      });
    }

    // ------------------------------------------------------
    // 7. Convert time to minutes
    // ------------------------------------------------------

    const [fromHour, fromMinute] =
      from.split(":").map(Number);

    const [toHour, toMinute] =
      to.split(":").map(Number);

    const fromMinutes =
      fromHour * 60 + fromMinute;

    const toMinutes =
      toHour * 60 + toMinute;

    // ------------------------------------------------------
    // 8. Validate time range
    // ------------------------------------------------------

    if (fromMinutes >= toMinutes) {
      return res.status(400).json({
        success: false,
        message:
          "Online availability 'from' time must be before 'to' time"
      });
    }

    // ------------------------------------------------------
    // 9. Consultation duration
    // ------------------------------------------------------

    const finalConsultationDuration =
      consultationDuration ??
      doctor.onlineAvailability?.consultationDuration ??
      20;

    if (
      !Number.isInteger(finalConsultationDuration) ||
      finalConsultationDuration <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Consultation duration must be a positive integer"
      });
    }

    // ------------------------------------------------------
    // 10. Buffer time
    // ------------------------------------------------------

    const finalBufferTime =
      bufferTime ??
      doctor.onlineAvailability?.bufferTime ??
      10;

    if (
      !Number.isInteger(finalBufferTime) ||
      finalBufferTime < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Buffer time must be a non-negative integer"
      });
    }

    // ------------------------------------------------------
    // 11. Make sure at least one complete slot fits
    // ------------------------------------------------------

    const slotDuration =
      finalConsultationDuration +
      finalBufferTime;

    if (
      fromMinutes + slotDuration >
      toMinutes
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Online availability is too short for one consultation slot"
      });
    }

    // ------------------------------------------------------
    // 12. Save online availability
    // ------------------------------------------------------

    doctor.onlineAvailability = {

      from,

      to,

      consultationDuration:
        finalConsultationDuration,

      bufferTime:
        finalBufferTime,

      isAvailable: true

    };

    await doctor.save();

    // ------------------------------------------------------
    // 13. Response
    // ------------------------------------------------------

    return res.status(200).json({

      success: true,

      message:
        "Online availability updated successfully",

      onlineAvailability:
        doctor.onlineAvailability

    });

  } catch (error) {

    console.error(
      "UPDATE ONLINE AVAILABILITY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update online availability",
      error: error.message
    });
  }
};


//=============================
//get available online slots
//=============================
const getAvailableOnlineSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    // =========================================
    // 1. Validate date
    // =========================================

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required"
      });
    }

    const selectedDate = new Date(date);

    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date"
      });
    }

    // =========================================
    // 2. Find doctor
    // =========================================

    const doctor = await docterModel.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    // =========================================
    // 3. Check online availability
    // =========================================

    const availability = doctor.onlineAvailability;

    if (
      !availability ||
      !availability.isAvailable ||
      !availability.from ||
      !availability.to
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Doctor is currently not available for online consultation."
      });
    }

    // =========================================
    // 4. Convert time → minutes
    // =========================================

    const [fromHour, fromMinute] =
      availability.from.split(":").map(Number);

    const [toHour, toMinute] =
      availability.to.split(":").map(Number);

    const fromMinutes =
      fromHour * 60 + fromMinute;

    const toMinutes =
      toHour * 60 + toMinute;

    const consultationDuration =
      availability.consultationDuration || 20;

    const bufferTime =
      availability.bufferTime ?? 10;

    const slotDuration =
      consultationDuration + bufferTime;

    // =========================================
    // 5. Get today's date range
    // =========================================

    const { start, end } =getUtcDayRange(date)

    // =========================================
    // 6. Get already booked online appointments
    // =========================================

    const bookedAppointments =
      await Appointment.find({
        doctor: doctor._id,

        appointmentType: "online",

        date: {
          $gte: start,
          $lte: end
        },

        status: {
          $in: [
            "PENDING",
            "CONFIRMED",
            "CURRENT"
          ]
        }
      }).select("date");

    // =========================================
    // 7. Create booked slot set
    // =========================================

    const bookedTimes = new Set(
      bookedAppointments.map((appointment) => {
        const d = new Date(appointment.date);

        const hours = String(
          d.getHours()
        ).padStart(2, "0");

        const minutes = String(
          d.getMinutes()
        ).padStart(2, "0");

        return `${hours}:${minutes}`;
      })
    );

    // =========================================
    // 8. Generate slots
    // =========================================

    const slots = [];

    for (
      let currentMinutes = fromMinutes;
      currentMinutes + slotDuration <= toMinutes;
      currentMinutes += slotDuration
    ) {

      const hour =
        Math.floor(currentMinutes / 60);

      const minute =
        currentMinutes % 60;

      const time =
        `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

      // =====================================
      // Create actual slot date
      // =====================================

      const slotDate = new Date(selectedDate);

      slotDate.setHours(
        hour,
        minute,
        0,
        0
      );

      const slotEnd = new Date(slotDate);

      slotEnd.setMinutes(
        slotEnd.getMinutes() +
        consultationDuration
      );

      // =====================================
      // Check whether slot is booked
      // =====================================

      const isBooked =
        bookedTimes.has(time);

      // =====================================
      // If today → past slots unavailable
      // =====================================

      let isPast = false;

      const now = new Date();

      const today = new Date();

      today.setHours(0, 0, 0, 0);

      const slotDay = new Date(selectedDate);

      slotDay.setHours(0, 0, 0, 0);

      if (
        slotDay.getTime() === today.getTime() &&
        slotDate <= now
      ) {
        isPast = true;
      }

      slots.push({
        time,

        start: slotDate,

        end: slotEnd,

        consultationDuration,

        bufferTime,

        booked: isBooked,

        available:
          !isBooked && !isPast
      });
    }

    // =========================================
    // 9. Response
    // =========================================

    return res.status(200).json({
      success: true,

      doctorId: doctor._id,

      date,

      onlineAvailability: {
        from: availability.from,
        to: availability.to,
        consultationDuration,
        bufferTime
      },

      slots
    });

  } catch (error) {

    console.error(
      "GET AVAILABLE ONLINE SLOTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch available online slots",
      error: error.message
    });
  }
};


const getOnlineDoctorsByDepartment = async (req, res) => {
  try {
    const { name, date } = req.query;

    // --------------------------------------------------
    // Validation
    // --------------------------------------------------

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Department name is required",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    // Department must exist in our allowed list
    if (!DEPARTMENTS.includes(name)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department",
      });
    }

    const selectedDate = new Date(date);

    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    // --------------------------------------------------
    // Find all department documents
    // --------------------------------------------------
    // Same department can exist in multiple hospitals.
    //
    // Example:
    // Cardiology -> Hospital A
    // Cardiology -> Hospital B
    // Cardiology -> Hospital C
    //
    // So we cannot use one department ID.
    // --------------------------------------------------

    const departments = await departmentModel.find({
      name: {
        $regex: `^${name}$`,
        $options: "i",
      },

      isActive: true,
    }).select("_id hospital");

    console.log("DEPARTMENT NAME:", name);

console.log("DEPARTMENTS FOUND:", departments);

    if (departments.length === 0) {
      return res.status(200).json({
        success: true,
        department: name,
        date,
        doctors: [],
      });
    }

    const departmentIds = departments.map(
      (department) => department._id
    );

    // --------------------------------------------------
    // Find online doctors
    // --------------------------------------------------

    const doctors = await docterModel
      .find({
        department: {
          $in: departmentIds,
        },

        "onlineAvailability.isAvailable": true,

        "onlineAvailability.from": {
          $exists: true,
          $ne: "",
        },

        "onlineAvailability.to": {
          $exists: true,
          $ne: "",
        },
      })
      .populate("department", "name hospital")
      .populate("hospital", "name")
      .select(
        "name profile_photo experience specialisations department hospital onlineAvailability"
      );

    // --------------------------------------------------
    // Check available slots
    // --------------------------------------------------

    const availableDoctors = [];

    for (const doctor of doctors) {
      const slots = await getDoctorOnlineSlots(
        doctor,
        date
      );

      // Only slots which are actually available
      const availableSlots = slots.filter(
        (slot) => slot.available
      );

      // If no future/free slot -> don't show doctor
      if (availableSlots.length === 0) {
        continue;
      }

      // First available slot
      const nextAvailableSlot = availableSlots[0];

      availableDoctors.push({
        doctorId: doctor._id,

        name: doctor.name,

        profile_photo: doctor.profile_photo,

        experience: doctor.experience,

        specialisations: doctor.specialisations,

        department: doctor.department,

        hospital: doctor.hospital,

        onlineAvailability: {
          from: doctor.onlineAvailability.from,
          to: doctor.onlineAvailability.to,
          consultationDuration:
            doctor.onlineAvailability.consultationDuration ?? 20,
          bufferTime:
            doctor.onlineAvailability.bufferTime ?? 10,
        },

        nextAvailableSlot: {
          time: nextAvailableSlot.time,
          start: nextAvailableSlot.start,
          end: nextAvailableSlot.end,
        },

        availableSlots: availableSlots.map((slot) => ({
          time: slot.time,
          start: slot.start,
          end: slot.end,
        })),
      });
    }

    return res.status(200).json({
      success: true,
      department: name,
      date,
      count: availableDoctors.length,
      doctors: availableDoctors,
    });
  } catch (error) {
    console.error(
      "GET ONLINE DOCTORS BY DEPARTMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch available online doctors",
      error: error.message,
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

const getTodayRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { today, tomorrow };
};

// ============================================================
// 1. toggleOpd
// Simple flip of opdStarted flag.
// ============================================================
const toggleOpd = async (req, res) => {
  try {
    const doctor = await docterModel.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    // Guard: don't allow toggling OFF while a consultation is CURRENT.
    // This mirrors the same guard stopConsultation already had —
    // otherwise this endpoint bypasses that protection entirely.
    if (doctor.opdStarted) {
      const { today, tomorrow } = getTodayRange();
      const currentAppointment = await Appointment.findOne({
        doctor: doctor._id,
        status: "CURRENT",
        date: { $gte: today, $lt: tomorrow }
      });

      if (currentAppointment) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot stop OPD while a consultation is in progress. Complete the current consultation first."
        });
      }
    }

    doctor.opdStarted = !doctor.opdStarted;
    if (!doctor.opdStarted) {
      doctor.opdPaused = false; // reset pause state when OPD turns off
    }
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

// ============================================================
// 2. startConsultation
// Starts OPD queue: takes the first CONFIRMED patient (by token)
// and makes them CURRENT.
// Made atomic with findOneAndUpdate to avoid two parallel requests
// both creating a CURRENT appointment.
// ============================================================
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

    const { today, tomorrow } = getTodayRange();

    const alreadyRunning = await Appointment.findOne({
      doctor: doctor._id,
      status: "CURRENT",
      date: { $gte: today, $lt: tomorrow }
    }).populate("patient doctor");

    if (alreadyRunning) {
      return res.status(400).json({
        success: false,
        message: "Consultation already started",
        currentAppointment: alreadyRunning
      });
    }

    // Atomic claim: only one request can successfully flip
    // CONFIRMED -> CURRENT for the lowest-token appointment.
    const firstAppointment = await Appointment.findOne({
      doctor: doctor._id,
      status: "CONFIRMED",
      date: { $gte: today, $lt: tomorrow }
    }).sort({ token: 1 });

    if (!firstAppointment) {
      return res.status(400).json({
        success: false,
        message: "No patients in queue"
      });
    }

    const currentAppointment = await Appointment.findOneAndUpdate(
      { _id: firstAppointment._id, status: "CONFIRMED" }, // condition guards race
      { status: "CURRENT", consultationStartedAt: new Date() },
      { new: true }
    ).populate("patient doctor")
    .populate({path:"patient",populate:{path:"userId",select: "name email"}})
    .populate("doctor");

    if (!currentAppointment) {
      // Someone else claimed it in between — safe to tell client to retry
      return res.status(409).json({
        success: false,
        message: "Queue changed, please try again"
      });
    }

    io.to(`doctor_${doctor._id}`).emit("queueUpdated", {
      currentToken: currentAppointment.token,
      status: "RUNNING",
      appointmentId: currentAppointment._id
    });

    return res.status(200).json({
      success: true,
      message: "Consultation started",
      currentAppointment
    });
  } catch (error) {
    console.error("START CONSULTATION ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
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

    const { today, tomorrow } = getTodayRange();

    const currentAppointment = await Appointment.findOne({
      doctor: doctor._id,
      status: "CURRENT",
      date: { $gte: today, $lt: tomorrow }
    }).populate({ path: "patient", populate: { path: "userId", select: "name email" } })

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

const stopConsultation = async (req, res) => {
  try {
    const io = req.app.get("io");

    const doctor = await docterModel.findOne({
      userId: req.user.id
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    if (!doctor.opdStarted) {
      return res.status(400).json({
        success: false,
        message: "OPD is already stopped"
      });
    }

    const { today, tomorrow } = getTodayRange();

    const currentAppointment = await Appointment.findOne({
      doctor: doctor._id,
      status: "CURRENT",
      date: { $gte: today, $lt: tomorrow }
    }).populate({
      path: "patient",
      populate: {
        path: "userId",
        select: "name email"
      }
    });

    /*
     * Current patient exists.
     * Emergency/force stop ke case mein consultation ko
     * COMPLETED nahi karenge because consultation actually
     * complete nahi hui hai.
     *
     * Is case mein SKIPPED better hai.
     */
    if (currentAppointment) {
      currentAppointment.status = "SKIPPED";
      currentAppointment.skippedAt = new Date();

      await currentAppointment.save();

      io.to(`doctor_${doctor._id}`).emit("consultationInterrupted", {
        appointmentId: currentAppointment._id,
        token: currentAppointment.token,
        status: "SKIPPED",
        message: "Consultation interrupted because OPD was stopped."
      });
    }

    // Stop OPD
    doctor.opdStarted = false;
    doctor.opdPaused = false;

    await doctor.save();

    // Notify doctor dashboard
    io.to(`doctor_${doctor._id}`).emit("opdStopped", {
      status: "STOPPED",
      message: "OPD stopped successfully."
    });

    return res.status(200).json({
      success: true,
      message: currentAppointment
        ? "OPD stopped. Current consultation was interrupted."
        : "OPD stopped successfully.",
      opdStarted: doctor.opdStarted,
      opdPaused: doctor.opdPaused,
      interruptedAppointment: currentAppointment
        ? {
            appointmentId: currentAppointment._id,
            token: currentAppointment.token,
            status: currentAppointment.status
          }
        : null
    });

  } catch (error) {
    console.error("STOP OPD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================
// 5. completeConsultation
// Marks CURRENT patient as COMPLETED and auto-advances the queue
// to the next CONFIRMED patient (merged with what callNext did,
// so the two endpoints no longer duplicate/conflict with each other).
// If frontend just wants "mark done, don't auto-advance", call
// this with ?autoAdvance=false.
// ============================================================
// const completeConsultation = async (req, res) => {
//   try {
//     const io = req.app.get("io");
//     const autoAdvance = req.query.autoAdvance !== "false";

//     const doctor = await docterModel.findOne({ userId: req.user.id });
//     if (!doctor) {
//       return res.status(404).json({
//         success: false,
//         message: "Doctor not found"
//       });
//     }

//     if (!doctor.opdStarted) {
//       return res.status(400).json({
//         success: false,
//         message: "OPD not started"
//       });
//     }

//     const { today, tomorrow } = getTodayRange();

//     const currentAppointment = await Appointment.findOne({
//       doctor: doctor._id,
//       status: "CURRENT",
//       date: { $gte: today, $lt: tomorrow }
//     });

//     if (!currentAppointment) {
//       return res.status(400).json({
//         success: false,
//         message: "No active consultation"
//       });
//     }

//     currentAppointment.status = "COMPLETED";
//     currentAppointment.consultationEndedAt = new Date();
//     await currentAppointment.save();

//     io.to(`doctor_${doctor._id}`).emit("consultationCompleted", {
//       appointmentId: currentAppointment._id,
//       token: currentAppointment.token,
//       status: "COMPLETED"
//     });

//     if (!autoAdvance) {
//       return res.status(200).json({
//         success: true,
//         message: "Consultation completed",
//         appointmentId: currentAppointment._id,
//         token: currentAppointment.token,
//         status: currentAppointment.status
//       });
//     }

//     // Auto-advance to next patient
//     const nextAppointment = await Appointment.findOneAndUpdate(
//       {
//         doctor: doctor._id,
//         status: "CONFIRMED",
//         date: { $gte: today, $lt: tomorrow }
//       },
//       { status: "CURRENT", consultationStartedAt: new Date() },
//       { new: true, sort: { token: 1 } }
//     ).populate({ path: "patient", populate: { path: "userId", select: "name email" } });

//     if (!nextAppointment) {
//       doctor.opdStarted = false;
//       await doctor.save();

//       io.to(`doctor_${doctor._id}`).emit("opdStopped", {
//         status: "STOPPED",
//         message: "No more patients. OPD ended."
//       });

//       return res.status(200).json({
//         success: true,
//         message: "Consultation completed. No more patients — OPD ended."
//       });
//     }

//     io.to(`doctor_${doctor._id}`).emit("queueUpdated", {
//       currentToken: nextAppointment.token,
//       status: "RUNNING"
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Consultation completed. Next patient called.",
//       currentAppointment: nextAppointment
//     });
//   } catch (error) {
//     console.error("COMPLETE CONSULTATION ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

const completeConsultation = async (req, res) => {
  try {
    const io = req.app.get("io");

    const doctor = await docterModel.findOne({
      userId: req.user.id
    });

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

    const result = await advanceQueue({
      doctor,
      io,
      closeStatus: "COMPLETED",
      socketEventName: "queueUpdated",
      closingMessage: "No more patients. OPD ended."
    });

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    if (result.ended) {
      return res.status(200).json({
        success: true,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Consultation completed. Next patient called.",
      currentAppointment: result.nextAppointment
    });

  } catch (error) {
    console.error("COMPLETE CONSULTATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================
// 6. pauseConsultation — unchanged, was already correct.
// ============================================================
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

    io.to(`doctor_${doctor._id}`).emit("opdPaused", {
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

// ============================================================
// 7. resumeConsultation
// Added date filter for consistency when looking up current appointment.
// ============================================================
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

    const { today, tomorrow } = getTodayRange();

    const currentAppointment = await Appointment.findOne({
      doctor: doctor._id,
      status: "CURRENT",
      date: { $gte: today, $lt: tomorrow }
    });

    io.to(`doctor_${doctor._id}`).emit("opdResumed", {
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

const advanceQueue = async ({ doctor, io, closeStatus, socketEventName, closingMessage }) => {
  const { today, tomorrow } = getTodayRange();

  const currentAppointment = await Appointment.findOne({
    doctor: doctor._id,
    status: "CURRENT",
    date: { $gte: today, $lt: tomorrow }
  });

  if (!currentAppointment && closeStatus === "SKIPPED") {
    // skipPatient specifically requires an existing current patient
    return { error: "No current patient to skip" };
  }

  if (currentAppointment) {
    currentAppointment.status = closeStatus;
    if (closeStatus === "SKIPPED") currentAppointment.skippedAt = new Date();
    if (closeStatus === "COMPLETED") currentAppointment.consultationEndedAt = new Date();
    await currentAppointment.save();

    // Closing an appointment changes the timeline the AI summary is built from.
    await redisClient.del(summaryCacheKey(currentAppointment.patient));
  }

  const nextAppointment = await Appointment.findOneAndUpdate(
    {
      doctor: doctor._id,
      status: "CONFIRMED",
      date: { $gte: today, $lt: tomorrow }
    },
    { status: "CURRENT", consultationStartedAt: new Date() },
    { new: true, sort: { token: 1 } }
  ).populate({ path: "patient", populate: { path: "userId", select: "name email" } });

  if (!nextAppointment) {
    doctor.opdStarted = false;
    await doctor.save();

    io.to(`doctor_${doctor._id}`).emit("opdStopped", {
      status: "STOPPED",
      message: closingMessage
    });

    return { ended: true, message: closingMessage };
  }

  io.to(`doctor_${doctor._id}`).emit(socketEventName, {
    currentToken: nextAppointment.token,
    ...(currentAppointment && closeStatus === "SKIPPED"
      ? { skippedToken: currentAppointment.token }
      : {}),
    status: "RUNNING"
  });

  return { nextAppointment };
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

    const result = await advanceQueue({
      doctor,
      io,
      closeStatus: "SKIPPED",
      socketEventName: "queueUpdated",
      closingMessage: "No more patients. OPD ended after skip."
    });

    if (result.error) {
      return res.status(400).json({ success: false, message: result.error });
    }

    if (result.ended) {
      return res.status(200).json({ success: true, message: result.message });
    }

    return res.status(200).json({
      success: true,
      message: "Patient skipped",
      currentAppointment: result.nextAppointment
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

    const result = await advanceQueue({
      doctor,
      io,
      closeStatus: "COMPLETED",
      socketEventName: "queueUpdated",
      closingMessage: "No more patients. OPD ended."
    });

    if (result.ended) {
      return res.status(200).json({ success: true, message: result.message });
    }

    return res.status(200).json({
      success: true,
      message: "Next patient called",
      currentAppointment: result.nextAppointment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports={getDoctorDashboard,getAvailableOnlineSlots,getOnlineDoctorsByDepartment,getCurrentPatient,completeConsultation,getUniquePatients,toggleOpd,getProfileStatus,submitProfile,getDoctorById, getDoctorByHospital, searchPatient,getDoctorsByDepartment,getMyProfile,getCompletedAppointments,updateProfile,uploadDoctorPhoto,callNext,skipPatient,pauseConsultation,resumeConsultation,stopConsultation,startConsultation,updateOnlineAvailability};
