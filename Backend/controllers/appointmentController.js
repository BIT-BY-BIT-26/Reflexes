const appointmentModel = require("../models/appointmentModel");
const docterModel = require("../models/docterModel");
const patientModel = require("../models/patientModel");
const { getUtcDayRange } = require("../utils/utcday");

exports.createAppointment = async (req, res) => {
  const io = req.app.get("io");
  try {
    const { doctor, date, appointmentType } = req.body;

    const patient = await patientModel.findOne({ userId: req.user.id });

    if (!patient) {
      return res.status(404).json({ success: false,message: "Patient profile not found" });
    }

    const doctorData = await docterModel.findById(doctor);

    if (!doctorData) {
      return res.status(404).json({ success: false,message: "Doctor not found" });
    }

    const { start, end } = getUtcDayRange(date);

    // const appointmentDate = new Date(date);
    // appointmentDate.setHours(0, 0, 0, 0);

    const existingAppointment = await appointmentModel.findOne({
      patient: patient._id,
      doctor: doctorData._id,
      appointmentType: appointmentType, 
      date: { $gte: start, $lte: end },
      status: { $in: ["PENDING", "CONFIRMED"] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: " Your Appointment already exists for this date"
      });
    }

    const appointment = await appointmentModel.create({
      patient: patient._id,
      doctor: doctorData._id,
      hospital: doctorData.hospital,
      department: doctorData.department,
      date: new Date(date), // exact time preserved,
      appointmentType:appointmentType,
      status: "PENDING"
    });
    // await patientModel.findByIdAndUpdate(
    //   patient._id,
    //   {
    //     $push:{
    //       medicalHistory:{
    //         type:"APPOINTMENT",
    //         doctor:doctorData._id
    //       }
    //     }
    //   }
    // )
    const io = req.app.get("io");
    const onlineDoctors = req.app.get("onlineDoctors");
    const doctorSocket = onlineDoctors.get(doctorData._id.toString());
    const populatedAppointment = await appointmentModel.findById(appointment._id)
    .populate({
      path:"patient",
      populate:{
        path:"userId",
        select:"name email gender"
      }
    });
    if(doctorSocket){
      io.to(doctorSocket).emit("newAppointment",{
        patientName:patient.name,
        date,
        // appointmentId:appointment._id
         appointment: populatedAppointment,
         appointmentType:appointment.appointmentType
      })
    }

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment
    });

  } catch (err) {
    success: false,
    res.status(500).json({ error: err.message });
  }
};



// ================================
// Admin / Receptionist confirms appointment
// ================================
exports.confirmAppointment = async (req, res) => {
  const io = req.app.get("io");

  try {
    const appointment = await appointmentModel.findById(req.params.id);

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



exports.getAllAppointmentsForDate = async(req,res)=>{
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


exports.getMyAppointments = async (req, res) => {
  try {
    const patient = await patientModel.findOne({ userId: req.user.id });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const appointments = await appointmentModel.find({ patient: patient._id   })
      .populate({
        path:"doctor",
        populate:{
          path:"userId",
          select:"name"
        }
      })
      .populate({
        path:"department",
        select:"name",
      })
      .populate({
        path:"hospital",
        select:"name"
      })
      .sort({ createdAt: -1 }); // latest first

    const result = appointments.map((a) => ({
      id: a._id,
      doctorId: a.doctor?._id,
      doctorName: a.doctor?.userId?.name || "Doctor",
      department: a.department?.name || "Department",
      hospital: a.hospital?.name || "Hospital",
      status: a.status,
      token: a.token ?? null,
      date: a.date,
      appointmentType: a.appointmentType
    }));

    res.status(200).json({
      appointments: result
    });

  } catch (err) {
    res.status(500).json({ message: `Failed to fetch appointments: ${err.message}` });
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

exports.completeAppointment = async(req,res)=>{
  const io = req.app.get("io");
  try{
    const appointment = await appointmentModel.findById(req.params.id);
    if(!appointment){
      return res.status(404).json({ message: "Appointment not found" });
    }
    appointment.status = "COMPLETED";
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
  }catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error completing appointment" });
  }
}

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