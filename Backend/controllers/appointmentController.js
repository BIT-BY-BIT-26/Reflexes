const { source } = require("../config/cloudinary");
const { redisClient } = require("../config/redisClient");
const DEPARTMENTS = require("../constants/departments");
const appointmentModel = require("../models/appointmentModel");
const departmentModel = require("../models/departmentModel");
const docterModel = require("../models/docterModel");
const PatientHospitalSchema = require("../models/PatientHospitalSchema");
const patientModel = require("../models/patientModel");
const { getDoctorOnlineSlots } = require("../services/onlineSlotService");
const { getUtcDayRange } = require("../utils/utcday");

exports.createAppointment = async (req, res) => {
  const io = req.app.get("io");

  try {
    const {
      doctor,
      date,
      appointmentType,
      reason,
      description
    } = req.body;

    // =========================
    // 1. Validate appointment type
    // =========================
    if (!appointmentType || !["online", "offline"].includes(appointmentType)) {
      return res.status(400).json({
        success: false,
        message: "Appointment type must be either online or offline"
      });
    }

    // =========================
    // 2. Find patient
    // =========================
    const patient = await patientModel.findOne({
      userId: req.user.id
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found"
      });
    }

    // =========================
    // 3. Find doctor
    // =========================
    const doctorData = await docterModel.findById(doctor);

    if (!doctorData) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    // =========================
    // 4. Validate date
    // =========================
    const appointmentDate = new Date(date);

    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date"
      });
    }

    const { start, end } = getUtcDayRange(date);

    // =========================
    // 5. Past date check
    // =========================
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(appointmentDate);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: "Past dates cannot be booked."
      });
    }

    // =========================
    // 6. Maximum 30 days advance
    // =========================
    if(appointmentType=="offline"){
      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() + 30);

      if (selectedDate > maxDate) {
        return res.status(400).json({
          success: false,
          message: "Appointments can only be booked up to 30 days in advance."
        });
      }
    }

    //online k liye current day booking
    if (appointmentType === "online") {
      if (selectedDate.getTime() !== today.getTime()) {
          return res.status(400).json({
              success: false,
              message: "Online appointments can only be booked for today."
          });
      }
  }

    // =========================
    // 7. Check doctor's OPD schedule
    // =========================
    const dayName = appointmentDate.toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: "Asia/Kolkata"
    });
    
  if(appointmentType=="offline"){
    const schedule = doctorData.opdSchedule.find(
      (s) => s.day === dayName && s.isAvailable
    );

    if (!schedule) {
      return res.status(400).json({
        success: false,
        message: "Doctor is not available on selected day."
      });
    }

    // =========================
    // 8. Same-day booking closing
    // =========================
    if (selectedDate.getTime() === today.getTime()) {

      const [hour, minute] = schedule.from
        .split(":")
        .map(Number);

      const bookingClose = new Date();

      bookingClose.setHours(hour, minute, 0, 0);
      bookingClose.setMinutes(
        bookingClose.getMinutes() - 30
      );

      if (new Date() > bookingClose) {
        return res.status(400).json({
          success: false,
          message: "Booking is closed for today's OPD."
        });
      }
    }

    // =========================
    // 9. Check duplicate appointment
    // =========================
    const existingAppointment = await appointmentModel.findOne({
      patient: patient._id,
      doctor: doctorData._id,
      appointmentType: appointmentType,
      date: {
        $gte: start,
        $lte: end
      },
      status: {
        $in: ["PENDING", "CONFIRMED"]
      }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "Your appointment already exists for this date."
      });
    }

    // =========================
    // 10. Token only for OFFLINE
    // =========================
    let token = null;

    if (appointmentType === "offline") {

      const lastAppointment = await appointmentModel
        .findOne({
          doctor: doctorData._id,
          appointmentType: "offline",
          date: {
            $gte: start,
            $lte: end
          },
          token: {
            $ne: null
          }
        })
        .sort({
          token: -1
        });

      token = lastAppointment
        ? lastAppointment.token + 1
        : 1;
    }

    // =========================
    // 11. Create appointment
    // =========================
    const appointment = await appointmentModel.create({
      patient: patient._id,
      doctor: doctorData._id,
      hospital: doctorData.hospital,
      department: doctorData.department,

      date: appointmentDate,

      appointmentType,

      // Offline → token
      // Online → null
      token,

      reason,
      description,

      status: "PENDING"
    });

    // =========================
    // 12. Update patient-hospital relation
    // =========================
    await PatientHospitalSchema.findOneAndUpdate(
      {
        patientId: patient._id,
        hospitalId: doctorData.hospital
      },
      {
        $set: {
          lastVisit: new Date(),
          status: "ACTIVE"
        },
        $setOnInsert: {
          firstVisit: new Date()
        }
      },
      {
        upsert: true,
        new: true
      }
    );

    // =========================
    // 13. Notify doctor
    // =========================
    const room = `doctor_${doctorData._id.toString()}`;

    console.log("📢 Sending appointment notification");
    console.log("Doctor ID:", doctorData._id.toString());
    console.log("Room:", room);
    console.log("Appointment Type:", appointmentType);

    io.to(room).emit("new-appointment", {
      message: "New appointment received",

      appointmentId: appointment._id,
      patientId: patient._id,
      doctorId: doctorData._id,

      appointmentType,

      token,

      date: appointmentDate,

      reason
    });

    // =========================
    // 14. Populate appointment
    // =========================
    const populatedAppointment =
      await appointmentModel
        .findById(appointment._id)
        .populate({
          path: "patient",
          populate: {
            path: "userId",
            select: "name email gender"
          }
        })
        .populate("doctor")
        .populate("hospital")
        .populate("department");

    // =========================
    // 15. Response
    // =========================
    return res.status(201).json({
      success: true,
      message: `${appointmentType} appointment booked successfully`,
      appointment: populatedAppointment
    });
  }

    // ========================================================
    // 10. ONLINE APPOINTMENT
    // ========================================================

    if (appointmentType == "online") {
      const availability =
        doctorData.onlineAvailability;
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

      // ------------------------------------------------------
      // Convert availability into minutes
      // ------------------------------------------------------
      const [fromHour, fromMinute] =
        availability.from
          .split(":")
          .map(Number);
      const [toHour, toMinute] =
        availability.to
          .split(":")
          .map(Number);
      const fromMinutes =
        fromHour * 60 +
        fromMinute;
      const toMinutes =
        toHour * 60 +
        toMinute;

      // ------------------------------------------------------
      // Appointment time
      // ------------------------------------------------------

      const appointmentHour =
        appointmentDate.getHours();
      const appointmentMinute =
        appointmentDate.getMinutes();
      const appointmentMinutes =
        appointmentHour * 60 +
        appointmentMinute;

      if (
        appointmentMinutes < fromMinutes ||
        appointmentMinutes >= toMinutes
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Selected time is outside doctor's online availability."
        });
      }
      
     const consultationDuration =
        availability.consultationDuration || 20;
    const bufferTime =
        availability.bufferTime || 5;
    const SLOT_DURATION =
        consultationDuration + bufferTime;

      if (
        (appointmentMinutes - fromMinutes) %
          SLOT_DURATION !== 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid online consultation slot."
        });
      }

      if (
        appointmentMinutes +
          SLOT_DURATION >
        toMinutes
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Selected slot extends beyond doctor's availability."
        });
      }


      // ------------------------------------------------------
      // Same-day online booking
      // Slot must be in future
      // ------------------------------------------------------

      const now = new Date();
      if (
        selectedDate.getTime() === today.getTime()
      ) {
        if (appointmentDate <= now) {
          return res.status(400).json({
            success: false,
            message:
              "Past online slots cannot be booked."
          });
        }
      }


      const slotEnd =
        new Date(
          appointmentDate.getTime() +
          SLOT_DURATION * 60 * 1000
        );


      const existingOnlineAppointment =
        await appointmentModel.findOne({
          doctor: doctorData._id,
          appointmentType: "online",
          date: {
            $gte: appointmentDate,
            $lt: slotEnd
          },
          status: {
            $in: [
              "PENDING",
              "CONFIRMED",
              "CURRENT"
            ]
          }
        });


      if (existingOnlineAppointment) {
        return res.status(400).json({
          success: false,
          message:
            "This online slot is already booked."
        });
      }


      // ------------------------------------------------------
      // Create ONLINE appointment
      // ------------------------------------------------------

      const appointment =
        await appointmentModel.create({
          patient: patient._id,
          doctor: doctorData._id,
          hospital: doctorData.hospital,
          department: doctorData.department,
          date: appointmentDate,
          appointmentType: "online",
          token: null,
          reason,
          description,
          status: "CONFIRMED"
        });

      // ------------------------------------------------------
      // Patient-Hospital relation
      // ------------------------------------------------------

      await PatientHospitalSchema.findOneAndUpdate(
        {
          patientId: patient._id,
          hospitalId: doctorData.hospital
        },
        {
          $set: {
            lastVisit: new Date(),
            status: "ACTIVE"
          },

          $setOnInsert: {
            firstVisit: new Date()
          }
        },
        {
          upsert: true,
          new: true
        }
      );

      const room =
        `doctor_${doctorData._id.toString()}`;
      io.to(room).emit(
        "new-appointment",
        {
          message:
            "New online appointment received",
          appointmentId:
            appointment._id,
          patientId:
            patient._id,
          doctorId:
            doctorData._id,
          appointmentType:
            "online",
          token: null,
          date:
            appointmentDate,
          reason
        }
      );

      const populatedAppointment =
        await appointmentModel
          .findById(appointment._id)

          .populate({
            path: "patient",
            populate: {
              path: "userId",
              select: "name email gender"
            }
          })
          .populate("doctor")
          .populate("hospital")
          .populate("department");

      return res.status(201).json({
        success: true,
        message:
          "Online appointment booked successfully",
        appointment:
          populatedAppointment
      });
    }
  } catch (err) {
    console.error("CREATE APPOINTMENT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



// ================================
// Admin / Receptionist confirms appointment
// ================================
exports.confirmAppointment = async (req, res) => {
  const io = req.app.get("io");

  try {
    const { id } = req.params;
    const appointment = await appointmentModel.findById(id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    // 🚫 Online ko confirm nahi karna yahan
    if (appointment.appointmentType !== "offline") {
      return res.status(400).json({
        message: "Only offline appointments require confirmation"
      });
    }

    if (appointment.status === "CONFIRMED") {
      return res.status(400).json({
        message: "Appointment already confirmed"
      });
    }

    // // ✅ Update status
    // appointment.status = "CONFIRMED";
    // appointment.token = tokenNumber;
    // await appointment.save();

    // ✅ Same day range
    const startOfDay = new Date(appointment.date);
    startOfDay.setHours(0,0,0,0);

    const endOfDay = new Date(appointment.date);
    endOfDay.setHours(23,59,59,999);

    // ✅ FIRST appointments fetch karo
    const appointments = await appointmentModel.find({
      doctor: appointment.doctor,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["PENDING", "CONFIRMED"] },
      appointmentType: "offline"  
    }).sort({ createdAt: 1 });

    // ✅ THEN token calculate karo
    const tokenNumber =
      appointments.findIndex(
        (a) => a._id.toString() === appointment._id.toString()
      ) + 1;

    // ✅ THEN save
    appointment.status = "CONFIRMED";
    if (appointment.appointmentType === "offline") {
      appointment.token = tokenNumber; //.
    } else {
      appointment.token = null;
    }
    await appointment.save();
    await redisClient.del(`doctor:todayAppointments:${appointment.doctor.toString()}`);

    // ✅ Socket emit
    io.to(`patient_${appointment.patient.toString()}`)
      .emit("APPOINTMENT_CONFIRMED", {
        appointmentId: appointment._id,
        token: appointment.appointmentType === "offline" ? tokenNumber : null,
        message: "Your appointment is confirmed"
      });

    return res.status(200).json({
      message: "Appointment confirmed successfully",
      token: tokenNumber,
      appointment
    });

  } catch (error) {
    console.error("Confirm Appointment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to confirm appointment",
      error: error.message
    });
  }
};


exports.cancelAppointment = async (req, res) => {
  const io = req.app.get("io");

  try {
    const { id } = req.params;

    const appointment = await appointmentModel.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Already cancelled
    if (appointment.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Appointment already cancelled",
      });
    }

    // Completed appointment cancel nahi ho sakti
    if (appointment.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Completed appointment cannot be cancelled",
      });
    }

    // Status update
    appointment.status = "CANCELLED";

    // Offline token remove kar do
    if (appointment.appointmentType === "offline") {
      appointment.token = null;
    }

    await appointment.save();
    await redisClient.del(`doctor:todayAppointments:${appointment.doctor.toString()}`);

    // Patient ko notify karo
    io.to(`patient_${appointment.patient.toString()}`).emit(
      "APPOINTMENT_CANCELLED",
      {
        appointmentId: appointment._id,
        message: "Your appointment has been cancelled by the doctor.",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment,
    });

  } catch (error) {
    console.error("Cancel Appointment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
      error: error.message,
    });
  }
};

exports.getAllAppointmentsForDate = async(req,res)=>{
  try{
    console.log("entered");
    const doctorUserId = req.user.id;
    const doctor = await docterModel.findOne({userId:doctorUserId})
    .populate("department hospital","name");
    if(!doctor){
      return res.status(404).json({
        message:"Doctor profile not found",
      })
    }

    const cacheKey = `doctor:todayAppointments:${doctor._id}`;
    const cachedAppointments = await redisClient.get(cacheKey);
    if(cachedAppointments){

  console.log("✅ Redis HIT");
      return res.status(200).json({
        ...JSON.parse(cachedAppointments),
        source:"redis"
      })
    }
    //today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);

    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    const appointments = await appointmentModel.find({
      doctor:doctor._id,
      appointmentType:"offline",
      date:{
        $gte:startOfDay,
        $lte:endOfDay,
      }
    })
    .populate({
      path:"patient",
      populate:({
        path:"userId",
        select:"name email gender"
      })
    })
    .sort({createdAt:1});

    const patients = appointments.map((appt,index)=>({
      token: index+1,
      appointmentId:appt._id,
      patient:appt.patient,
      status:appt.status,
      bookedAt:appt.createdAt
    }))

    const response ={
      success:true,
      message:"Today's appointments fetched successfully",
      doctor:{
        id:doctor._id,
        name:doctor.name,
        department:doctor.department,
        hospital:doctor.hospital
      },
      total:appointments.length,
      patients,
    };

    await redisClient.set(
      cacheKey,
      JSON.stringify(response),
      "EX",
      60
    )
    return res.status(200).json({
      ...response,
      source:"mongodb"
    });

  }catch(error){
    console.error("getAllAppointmentForToday error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
}

exports.getOnlineAppointmentsForDate = async(req,res)=>{
  try{
    const doctorUserId = req.user.id;
    const doctor = await docterModel.findOne({userId:doctorUserId})
    .populate("department hospital","name");
    if(!doctor){
      return res.status(404).json({
        message:"Doctor profile not found",
      })
    }
    //today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);

    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    const appointments = await appointmentModel.find({
      doctor:doctor._id,
      appointmentType:"online",
      date:{
        $gte:startOfDay,
        $lte:endOfDay,
      }
    })
    .populate({
      path:"patient",
      populate:({
        path:"userId",
        select:"name email gender"
      })
    })
    .sort({createdAt:1});

    const patients = appointments.map((appt,index)=>({
      token: index+1,
      appointmentId:appt._id,
      patient:appt.patient,
      status:appt.status,
      bookedAt:appt.createdAt
    }))

    return res.status(200).json({
      message:"Today's appointments fetched successfully",
      doctor:{
        id:doctor._id,
        name:doctor.name,
        department:doctor.department,
        hospital:doctor.hospital
      },
      total:appointments.length,
      patients,
    });
  }catch(error){
    console.error("getAllAppointmentForToday error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
}

exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await appointmentModel.findById(req.params.id)
      .populate("doctor", "name position")
      .populate("patient", "name email");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//doc--
exports.getMyAppointments = async (req, res) => {
  try {
    const { status,appointmentType } = req.query;

    const doctor = await docterModel.findOne({
      userId: req.user.id,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const filter = {
      doctor: doctor._id,
      date: {
        $gte: start,
        $lte: end,
      },
    };

    if (status) {
      filter.status = status.toUpperCase();
    }
    if (appointmentType) {
      filter.appointmentType = appointmentType;
    }

    const appointments = await appointmentModel.find(filter)
      .populate({
        path: "patient",
        populate: {
          path: "userId",
          select: "name email gender phone",
        },
      })
      .select("patient token appointmentType date status")
      .sort({ token: 1 });

    return res.status(200).json({
      success: true,
      total: appointments.length,
      appointments,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Patient - Get My Appointments
exports.getMyAppointmentsPatients = async (req, res) => {
  try {
    const patient = await patientModel.findOne({
      userId: req.user.id,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const appointments = await appointmentModel
      .find({ patient: patient._id })
      .populate({
        path: "doctor",
        select: "profile_photo",
        populate: {
          path: "userId",
          select: "name",
        },
      })
      .populate({
        path: "department",
        select: "name",
      })
      .populate({
        path: "hospital",
        select: "name",
      })
      .sort({ createdAt: -1 });

    const result = appointments.map((a) => ({
      id: a._id,
      doctorId: a.doctor?._id,
      doctorName: a.doctor?.userId?.name || "Doctor",
      doctorProfilePhoto: a.doctor?.profile_photo || "",
      department: a.department?.name || "Department",
      hospital: a.hospital?.name || "Hospital",
      status: a.status,
      token: a.token ?? null,
      date: a.date,
      appointmentType: a.appointmentType,
    }));

    return res.status(200).json({
      success: true,
      appointments: result,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Failed to fetch appointments: ${err.message}`,
    });
  }
};


//BOOK EARLIEST AVAILABLE ONLINE SLOT 
exports.bookEarliestAvailable = async (req, res) => {
  try {
    const patientId = req.user.id;

    const { department, date } = req.body;

    // ============================================================
    // 1. VALIDATION
    // ============================================================

    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Department is required",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    // Department must be one of our predefined departments
    if (!DEPARTMENTS.includes(department)) {
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

    // ============================================================
    // 2. ONLINE CONSULTATION IS CURRENTLY SAME-DAY ONLY
    // ============================================================

    const now = new Date();

    const { start, end } = getUtcDayRange(date);

    if (selectedDate < start || selectedDate > end) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date",
      });
    }

    // ============================================================
    // 3. FIND DEPARTMENT DOCUMENTS ACROSS ALL HOSPITALS
    // ============================================================

    const departments = await departmentModel.find({
      name: {
        $regex: `^${department}$`,
        $options: "i",
      },
      isActive: true,
    }).select("_id hospital");

    if (departments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active department found",
      });
    }

    const departmentIds = departments.map(
      (dept) => dept._id
    );

    // ============================================================
    // 4. FIND ALL ONLINE DOCTORS
    // ============================================================

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

    if (doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No online doctors found for this department",
      });
    }

    // ============================================================
    // 5. FIND EARLIEST AVAILABLE SLOT
    // ============================================================

    let earliestSlot = null;
    let selectedDoctor = null;

    for (const doctor of doctors) {

      const slots = await getDoctorOnlineSlots(
        doctor,
        date
      );

      const availableSlots = slots.filter(
        (slot) => slot.available
      );

      if (availableSlots.length === 0) {
        continue;
      }

      // Slots already chronological hain,
      // so first available slot is earliest for this doctor.
      const doctorEarliestSlot = availableSlots[0];

      // ========================================================
      // Compare with globally earliest slot
      // ========================================================

      if (
        !earliestSlot ||
        doctorEarliestSlot.start < earliestSlot.start
      ) {
        earliestSlot = doctorEarliestSlot;
        selectedDoctor = doctor;
      }
    }

    // ============================================================
    // 6. NO SLOT FOUND
    // ============================================================

    if (!earliestSlot || !selectedDoctor) {
      return res.status(404).json({
        success: false,
        message:
          "No future online consultation slots are available for this department",
      });
    }

    // ============================================================
    // 7. FINAL AVAILABILITY CHECK
    // ============================================================
    // Important:
    //
    // Doctor list nikalne ke baad kisi aur patient ne
    // same slot book kiya ho sakta hai.
    //
    // Isliye booking se pehle DB me dobara check karenge.
    // ============================================================

    const existingAppointment = await appointmentModel.findOne({
      doctor: selectedDoctor._id,
      appointmentType: "online",
      date: earliestSlot.start,
      status: {
        $in: ["PENDING", "CONFIRMED", "CURRENT"],
      },
    });

    if (existingAppointment) {

      // Slot race condition ki wajah se unavailable ho gaya.
      // Better hai client ko retry karne dena.

      return res.status(409).json({
        success: false,
        message:
          "The earliest slot was just booked. Please try again.",
      });
    }

    // ============================================================
    // 8. CREATE APPOINTMENT
    // ============================================================

    const appointment = await appointmentModel.create({
      patient: patientId,

      doctor: selectedDoctor._id,

      department: selectedDoctor.department._id,

      hospital: selectedDoctor.hospital,

      appointmentType: "online",

      date: earliestSlot.start,

      status: "CONFIRMED",

      token: null,
    });

    // ============================================================
    // 9. RESPONSE
    // ============================================================

    return res.status(201).json({
      success: true,

      message: "Earliest available slot booked successfully",

      appointment: {
        appointmentId: appointment._id,

        doctor: {
          id: selectedDoctor._id,
          name: selectedDoctor.name,
          profile_photo: selectedDoctor.profile_photo,
          experience: selectedDoctor.experience,
          specialisations:
            selectedDoctor.specialisations,
        },

        hospital: selectedDoctor.hospital,

        department: selectedDoctor.department,

        date: appointment.date,

        slot: {
          time: earliestSlot.time,
          start: earliestSlot.start,
          end: earliestSlot.end,
        },

        appointmentType: "online",

        status: appointment.status,
      },
    });

  } catch (error) {

    console.error(
      "BOOK EARLIEST AVAILABLE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to book earliest available slot",
      error: error.message,
    });
  }
};


exports.getOnlineAppointments = async (req, res) => {
  try {
    const patient = await patientModel.findOne({ userId: req.user.id });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const appointments = await appointmentModel.find({
      patient: patient._id,
      appointmentType: "online"
    })
      .populate({
        path: "doctor",
        populate: {
          path: "userId",
          select: "name"
        }
      })
      .populate({ path: "department", select: "name" })
      .populate({ path: "hospital", select: "name" })
      .sort({ date: -1 });

    const result = appointments.map(a => ({
      id: a._id,
      doctorName: a.doctor?.userId?.name || "Doctor",
      department: a.department?.name || "Department",
      hospital: a.hospital?.name || "Hospital",
      status: a.status,
      date: a.date,
      token: a.token ?? null,
      appointmentType: a.appointmentType
    }));

    res.status(200).json({ appointments: result });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.completeAppointment = async (req, res) => {
  const io = req.app.get("io");
  try {
    const appointment = await appointmentModel.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // 🔥 doctor fetch karke uska opdPaused check karo
    const doctor = await docterModel.findById(appointment.doctor);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (doctor.opdPaused) {
      return res.status(400).json({
        message: "Cannot complete appointment while OPD is paused"
      });
    }

    appointment.status = "COMPLETED";
    appointment.consultationEndedAt = new Date(); // baaki controllers ke pattern se consistent
    await appointment.save();

    const patientId = appointment.patient.toString();
    const doctorId = appointment.doctor.toString();

    // 🔥 Realtime update doctor dashboard
    io.to(`doctor_${doctorId}`).emit("appointmentCompleted", {
      appointmentId: req.params.id
    });

    // 🔥 Realtime notify patient
    io.to(`patient_${patientId}`).emit("APPOINTMENT_COMPLETED", {
      message: "Your consultation is completed"
    });

    return res.status(200).json({
      message: "Appointment completed",
      appointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error completing appointment" });
  }
};
exports.getTodayStats = async(req,res)=>{
  try{
    const doctorUserId = req.user.id;
    const doctorId = await docterModel.findOne({userId:doctorUserId});
    if (!doctorId) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);

    const todayEnd = new Date();
    todayEnd.setHours(23,59,59,999);

    const appointments= await appointmentModel.find({
      doctor:doctorId,
      appointmentType:"offline",
      date:{$gte: todayStart, $lte:todayEnd}
    })
    const stats={
      total: appointments.length,
      pending:appointments.filter(a=>a.status === "PENDING").length,
      confirmed:appointments.filter(a=>a.status === "CONFIRMED").length,
      cancelled:appointments.filter(a=>a.status === "CANCELLED").length,
      current:appointments.filter(a=>a.status === "INPROGRESS").length,  
      completed:appointments.filter(a=>a.status === "COMPLETED").length,  
    }
    res.json(stats);
  }catch(error){
    res.status(500).json({ error: error.message });
  }
}

exports.getTodayOnlineStats = async(req,res)=>{
  try{
    const doctorUserId = req.user.id;
    const doctorId = await docterModel.findOne({userId:doctorUserId});
    if (!doctorId) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);

    const todayEnd = new Date();
    todayEnd.setHours(23,59,59,999);

    const appointments= await appointmentModel.find({
      doctor:doctorId,
      appointmentType:"online",
      date:{$gte: todayStart, $lte:todayEnd}
    })
    const stats={
      total: appointments.length,
      pending:appointments.filter(a=>a.status === "PENDING").length,
      confirmed:appointments.filter(a=>a.status === "CONFIRMED").length,
      cancelled:appointments.filter(a=>a.status === "CANCELLED").length,
      current:appointments.filter(a=>a.status === "INPROGRESS").length,  
    }
    res.json(stats);
  }catch(error){
    res.status(500).json({ error: error.message });
  }
}