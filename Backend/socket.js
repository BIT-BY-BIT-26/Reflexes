const { ROLE } = require("./config/Role");

module.exports = (io,onlineDoctors,onlinePatients) => {
  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);


    socket.on("joinDoctor",(doctorId)=>{
      onlineDoctors.set(doctorId,socket.id);
      
      socket.join(`doctor_${doctorId}`);
      console.log("Doctor online:",doctorId);
    })


     socket.on("patient-join", ({ patientId }) => {
      onlinePatients.set(patientId, socket.id);
      socket.join(`patient_${patientId}`);
      console.log("patient connected", patientId);
    });

    // socket.on("join-call-room", (roomId) => {
    //   socket.join(roomId);
    // });

    // =========================
    // JOIN CALL ROOM
    // =========================
    socket.on("join-call-room",
      async ({ roomId, role }) => {

        socket.join(roomId);

        const room =
          await consultation.findOne({ roomId });

        if (!room) return;

        if (role === ROLE.patient) {
          room.patientJoined = true;
        }

        if (role === ROLE.doctor) {
          room.doctorJoined = true;
        }

        // 🔥 BOTH JOINED
        if (
          room.patientJoined &&
          room.doctorJoined
        ) {
          room.status = "ONGOING";
        }

        await room.save();

        io.to(roomId).emit("user-joined", { role });
      });


    socket.on("call-doctor", ({doctorId, patientId, appointmentId}) => {
      const doctorSocket = onlineDoctors.get(doctorId);
      if (!doctorSocket) {
        socket.emit("doctor-offline");
        return;
      }
      io.to(doctorSocket).emit("incoming-call", {
        patientId,
        appointmentId
      });
    });


    socket.on("accept-call", ({patientId, doctorId, appointmentId}) => {
      const patientSocket = onlinePatients.get(patientId);
      if (patientSocket) {
        io.to(patientSocket).emit("call-accepted", { roomId: appointmentId });
      }
    });


    socket.on("offer", ({roomId, offer}) => {
      console.log("📡 Offer received on server");
      socket.to(roomId).emit("offer", offer);
    });


    // socket.on("end-call", roomId => {
    //   socket.to(roomId).emit("call-ended");
    // });


    // =========================
    // END CALL
    // =========================
    socket.on("end-call",
      async ({ roomId }) => {

        const room =
          await consultation.findOne({ roomId });

        if (!room) return;

        room.status = "COMPLETED";
        room.endedAt = new Date();

        await room.save();

        io.to(roomId).emit("call-ended");
      });


    socket.on("answer", ({ roomId, answer }) => {
      socket.to(roomId).emit("answer", answer);
    });


    socket.on("ice-candidate", ({ roomId, candidate }) => {
      socket.to(roomId).emit("ice-candidate", candidate);
    });


    // socket.on("reject-call", ({patientId})=>{
    //   const patientSocket = onlinePatients.get(patientId);
    //   io.to(patientSocket).emit("call-rejected");
    // });


    // =========================
    // REJECT CALL
    // =========================
    socket.on("reject-call",
      ({ patientId }) => {

        const patientSocket =
          onlinePatients.get(patientId.toString());

        if (patientSocket) {
          io.to(patientSocket)
            .emit("call-rejected");
        }
      });


    socket.on("disconnect", () => {
      for (let [doctorId, socketId] of onlineDoctors.entries()) {
        if (socketId === socket.id) {
          onlineDoctors.delete(doctorId);
          console.log("Doctor offline:", doctorId);
        }
      }
      for (let [patientId, socketId] of onlinePatients.entries()) {
        if (socketId === socket.id) {
          onlinePatients.delete(patientId);
          console.log("Patient offline:", patientId);
        }
      }
      console.log("🔴 Disconnected:", socket.id);
    });
  });
};



//io("http:localhost:3000")//socket.id provide kr dega-> connection
//emit krte to parameters ko pass krte h
//on krte h to kaam krte h parameters 

