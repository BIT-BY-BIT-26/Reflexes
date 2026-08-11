const { ROLE } = require("./config/role");
const docterModel = require("./models/docterModel");

module.exports = (io,onlineDoctors,onlinePatients) => {
  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);
    socket.on("joinDoctor",async(doctorId)=>{
      onlineDoctors.set(doctorId,socket.id);
      socket.join(`doctor_${doctorId}`);
      console.log("Doctor online:",doctorId);
      try{
        await docterModel.findOneAndUpdate(
          {_id:doctorId},
          {isOnline:true}
        )
      }catch(err){
        console.log("Error updating doctor online status:",err.message);
      }
    })
     socket.on("patient-join", ({ patientId }) => {
      onlinePatients.set(patientId, socket.id);
      socket.join(`patient_${patientId}`);
      console.log("patient connected", patientId);
    });


    socket.on("disconnect", async() => {
      for (let [doctorId, socketId] of onlineDoctors.entries()) {
        if (socketId === socket.id) {
          onlineDoctors.delete(doctorId);
          console.log("Doctor offline:", doctorId);

          try{
            await docterModel.findOneAndUpdate(
              {_id:doctorId},
              {
                isOnline:false,
                lastSeen:new Date(),
                opdStarted:false,
                opdPaused:false
              }
            );
            io.emit("doctor-status-changed", {
              doctorId,
              isOnline: false,
            });
          }catch(err){
            console.log("Error updating doctor offline status:", err.message);
          }
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

