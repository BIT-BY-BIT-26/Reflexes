import React, { useEffect, useState } from "react";
import api from "../api/axios";
import LiveCall from "./LiveCall";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [room, setRoom] = useState(null);
  const [waiting, setWaiting] = useState(false);

  // 1️⃣ Fetch today's online appointments
  const getTodayOnlineAppointments = async () => {
    try {
      const res = await api.get("/appointments/online");
      setData(res.data);
    } catch (error) {
      console.error("Error fetching appointments", error);
    }
  };

  useEffect(() => {
    getTodayOnlineAppointments();
  }, []);

  // 2️⃣ Start consultation & get room
  const startConsultation = async (patient) => {
    try {
      const res = await api.post("/consulation/start", {
        appointmentId: patient.appointmentId,
        patientId: patient.patient._id,
      });
      setRoom(res.data); // room object from backend
      setWaiting(true);  // triggers LiveCall
    } catch (error) {
      console.error("Error starting consultation", error);
    }
  };

  // 3️⃣ Loading state
  if (!data) return <p className="ml-6 p-6 text-gray-600">Loading...</p>;
  if (waiting && room) return <LiveCall room={room} />; // show live call

  return (
    <div className="ml-6 p-6 space-y-6 w-screen bg-blue-700">
      <h1 className="text-3xl font-extrabold text-gray-200">Today's Online Patients</h1>

      {/* Doctor Info */}
      <div className="bg-white shadow-md rounded-lg p-6 flex justify-between items-center">
        <div>
          <p className="text-gray-700"><span className="font-semibold">Department:</span> {data.doctor.department.name}</p>
          <p className="text-gray-700"><span className="font-semibold">Hospital:</span> {data.doctor.hospital.name}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-700"><span className="font-semibold">Total Patients:</span> {data.total}</p>
        </div>
      </div>

      {/* Patient List */}
      {data.patients.length === 0 ? (
        <p className="text-gray-500 text-center py-6">No patients in queue</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.patients.map((p) => (
            <div key={p.appointmentId} className="bg-blue-100 shadow rounded-lg p-5 border hover:shadow-lg transition duration-200">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-600 font-semibold">Token: {p.token}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                  ${p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    p.status === 'CURRENT' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'}`}>
                  {p.status}
                </span>
              </div>
              <p className="text-gray-800 font-medium">{p.patient.userId?.name}</p>
              <p className="text-gray-500 text-sm">{p.patient.userId?.email}</p>
              <p className="text-gray-500 text-sm mt-1">
                <span className="font-semibold">Booked At:</span> {new Date(p.bookedAt).toLocaleTimeString()}
              </p>

              {p.status === "PENDING" && (
                <button
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition duration-200"
                  onClick={() => startConsultation(p)}
                >
                  Start Call
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;