const appointmentModel = require("../models/appointmentModel");
const docterModel = require("../models/docterModel");
const prescriptionModel = require("../models/prescriptionModel");

const createPrescription = async (req, res) => {
  try {
    const userId = req.user.id; // token se doctor
    const doctor = await docterModel.findOne({ userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found"
      });
    }
    const doctorId = doctor._id;
    const {
      appointmentId,
      //patientId,
      complaints,
      diagnosis,
      medicines,
      tests,
      advice,
      attachments,
      followUpDate
    } = req.body;

    // if (!patientId) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Patient ID required"
    //   });
    // }

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID required"
      });
    }
    
    // ✅ Check appointment exists
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }
    
    // ✅ Check doctor owns this appointment
    if (appointment.doctor.toString() !== doctorId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    // ✅ Prevent duplicate prescription
    const existingPrescription = await prescriptionModel.findOne({ appointmentId });
    if (existingPrescription) {
      return res.status(400).json({
        success: false,
        message: "Prescription already created for this appointment"
      });
    }

    const prescription = new prescriptionModel({
      appointmentId,
      patientId:appointment.patient,
      doctorId,
      complaints,
      diagnosis,
      medicines,
      tests,
      advice,
      attachments,
      followUpDate
    });

    await prescription.save();
    // ===== Add Medical History Entry =====
  

    res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription
    });

  } catch (error) {
    console.error("Create Prescription Error:", error);

    res.status(500).json({
      success: false,
      message: `Failed to create prescription ${error.message}`
    });
  }
};


const getPatientPrescriptionsForDoctor = async (req, res) => {
  try {
      const { patientId } = req.params;
     const doctor = await docterModel.findOne({
        userId: req.user.id
     })
    if(!doctor){
        return res.status(404).json({
            success: false,
            message:"Doctor not found"
        });
    }
    
    const prescriptions = await prescriptionModel.find({ patientId, 
      $or:[
        {doctorId:doctor._id},
        {sharedWithDoctor:doctor._id}
      ]
     })
    .populate("appointmentId")  
    .populate({
      path:"doctorId",
      populate:{path:"userId", select:"name"}
    })
  .sort({ createdAt: -1 });

    res.json({
      success: true,
      prescriptions
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch prescriptions ${error}`
    });
  }
};



const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Patient param:", patientId);

    const prescription = await prescriptionModel.findById(id)
      .populate("doctorId , id, name")
      .populate("patientId");

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found"
      });
    }

    res.json({
      success: true,
      prescription
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching prescription"
    });
  }
};


//appointment se linked prescription dhoondne k liye--
const getPrescriptionByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const prescription = await prescriptionModel
      .findOne({ appointmentId })
      .populate("doctorId")
      .populate("patientId");

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "No prescription for this appointment"
      });
    }

    res.json({
      success: true,
      prescription
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching prescription"
    });
  }
};

module.exports={createPrescription,getPrescriptionById,getPatientPrescriptionsForDoctor,getPrescriptionByAppointment};