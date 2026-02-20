import React, { useEffect, useState } from "react";
import  socket  from "../socket/socket";
import AllAppointments from "./AllAppointmnets";

const StartOpd = () => {
  const [connected, setConnected] = useState(false);
  const [opdActive, setOpdActive] = useState(false);
  const [appointmentConfirmed, setAppointmentConfirmed] = useState(false);
  const [showAppointments, setShowAppointments] = useState(false);

  // example ids (normally props / params / auth se aayenge)
  const opdId = "697b7eb01a3d22e4112b23b2";
  const patientId = "697919926a251227d9325776";

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      setConnected(true);
      socket.emit("JOIN_OPD",opdId);
      socket.emit("JOIN_PATIENT", patientId);
    });

    socket.on("OPD_STARTED", (data) => {
      console.log("🟢 OPD_STARTED:", data);
      setOpdActive(true);
    });

    socket.on("OPD_CLOSED", (data) => {
      console.log("🔴 OPD_CLOSED:", data);
      setOpdActive(false);
    });

    socket.on("TOKEN_ASSIGNED", (data) => {
      console.log("🎫 TOKEN_ASSIGNED:", data);
    });

    return () => {
      socket.off("connect");
      socket.off("OPD_STARTED");
      socket.off("OPD_CLOSED");
      socket.off("TOKEN_ASSIGNED");
    };
  }, []);

  // 🔹 Confirm Appointment
  const confirmAppointment = () => {
    socket.emit("CONFIRM_APPOINTMENT", {
      opdId,
      patientId,
    });
    setAppointmentConfirmed(true);
  };

  // 🔹 Start OPD
  const startOpd = () => {
    socket.emit("START_OPD", {
      opdId,
    });
  };

  // 🔹 Close OPD
  const closeOpd = () => {
    socket.emit("CLOSE_OPD", {
      opdId,
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🩺 OPD Control Panel</h2>

      <p>
        Socket Status:{" "}
        {connected ? "🟢 Connected" : "🔴 Not Connected"}
      </p>

      <hr />

        {/* saare appointments with that doctor */}
       <button
       onClick={()=> setShowAppointments(!showAppointments)}
       className="px-4 py-2 my-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
       >
        {showAppointments?"Hide Appointments":"Fetch Today's Appointments"}
       </button>

       {showAppointments && <AllAppointments /> }
      {/* Confirm Appointment */}
      <button
        onClick={confirmAppointment}
        disabled={!connected || appointmentConfirmed}
      >
        ✅ Confirm Appointment
      </button>

      <br /><br />

      {/* Start OPD */}
      <button
        onClick={startOpd}
        disabled={!appointmentConfirmed || opdActive}
      >
        ▶️ Start OPD
      </button>

      <br /><br />

      {/* Close OPD */}
      <button
        onClick={closeOpd}
        disabled={!opdActive}
        style={{ background: "red", color: "white" }}
      >
        ⛔ Close OPD
      </button>

      <br /><br />

      <strong>Status:</strong>{" "}
      {opdActive ? "OPD Running 🟢" : "OPD Closed 🔴"}
    </div>
  );
};

export default StartOpd;
