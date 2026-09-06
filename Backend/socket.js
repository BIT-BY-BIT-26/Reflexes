const jwt = require("jsonwebtoken");
const userModel = require("./models/userModel");
const docterModel = require("./models/docterModel");
const dotenv = require("dotenv");

dotenv.config();

module.exports = (io, onlineDoctors, onlinePatients) => {

  // 🔐 Socket authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication token missing"));
      }
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
      const user = await userModel.findById(decoded.id);
      if (!user) {
        return next(new Error("User not found"));
      }
      socket.user = user;
      console.log("✅ Socket authenticated:", user._id);
      console.log("Role:", user.role);
      console.log("Hospital:", user.hospitalId);
      
      //==============
      //hospital join
      //==============
      if (
        socket.user.role === "HOSPITAL_ADMIN" &&
        socket.user.hospitalId
      ) {
        socket.join(
          `hospital_${socket.user.hospitalId.toString()}`
        );

        console.log(
          "🏥 Hospital room joined:",
          socket.user.hospitalId.toString()
        );
      }

      next();
    } catch (error) {
      console.log(
        "❌ Socket authentication failed:",
        error.message
      );
      next(new Error("Unauthorized"));
    }
  });
  // Connection
  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);
    console.log("Socket user:", socket.user._id);
    console.log("Socket role:", socket.user.role);
    console.log("Socket hospital:", socket.user.hospitalId);
    if (socket.user.role === "HOSPITAL_ADMIN" || socket.user.role === "PLATFORM_ADMIN") {
      socket.emit("initial-doctor-status", {
          onlineDoctors: Array.from(onlineDoctors.keys()),
      });
    }
    // TEMPORARY — later remove doctorId from client
    socket.on("joinDoctor", async (doctorId) => {
      onlineDoctors.set(doctorId, socket.id);
      io.emit("doctor-online", {
        doctorId,
      });
      socket.join(`doctor_${doctorId}`);
      console.log("Doctor online:", doctorId);
    });


    // Patient
    socket.on("patient-join", ({ patientId }) => {
      onlinePatients.set(patientId, socket.id);
      socket.join(`patient_${patientId}`);
      console.log("Patient connected:", patientId);
      console.log("Patient socket ID:", socket.id);
      // Doctor ko patient ka socket ID bhejna
      io.emit("patient-online", {
        patientId,
        socketId: socket.id,
      });
    });

    // Disconnect
    socket.on("disconnect", async () => {
      for (const [doctorId, socketId] of onlineDoctors.entries()) {
        if (socketId === socket.id) {
          onlineDoctors.delete(doctorId);
          io.emit("doctor-offline", {
            doctorId,
            lastSeen: new Date(),
          });
          console.log("Doctor offline:", doctorId);
          await docterModel.findByIdAndUpdate(
            doctorId,
            {
              lastSeen: new Date(),
              opdStarted: false,
              opdPaused: false
            }
          );

        }
      }


      for (const [patientId, socketId] of onlinePatients.entries()) {
        if (socketId === socket.id) {
          onlinePatients.delete(patientId);
          console.log("Patient offline:", patientId);
        }
      }
      console.log("🔴 Disconnected:", socket.id);
    });

  });

};