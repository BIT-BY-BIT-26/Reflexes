import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams, useNavigate,useLocation } from "react-router-dom"; // ✅ import useNavigate
import api from "../api/axios";

const PatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // ✅ define navigate
  const [patient, setPatient] = useState(null);
  const location = useLocation();
    const appointmentId = location.state?.appointmentId;

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await api.get(`patients/get-patient-profile/${id}`);
        setPatient(res.data.patient);
      } catch (err) {
        console.log(err);
      }
    };

    if (id) fetchPatient();
  }, [id]);
 const startConsultation = async () => {
    try {
      if (!appointmentId) {
        alert("Appointment ID missing ❌");
        return;
      }

      await api.patch(`/consulation/start-consultation/${appointmentId}`);

      alert("Consultation Started ✅");

    } catch (error) {
      console.error(error);
      alert("Error starting consultation ❌");
    }
  };
  if (!patient)
    return (
      <div className="text-white animate-pulse p-6">
        Loading patient profile...
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gradient-to-br from-purple-950 via-purple-900 to-purple-800 rounded-2xl p-6 shadow-xl text-white"
    >
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-purple-700 flex items-center justify-center text-2xl font-bold shadow-md">
          {patient?.userId?.name?.charAt(0).toUpperCase()}
        </div>

        <div>
          <h3 className="text-xl font-semibold">{patient?.userId?.name}</h3>
          <p className="text-sm text-purple-200">
            Patient ID: {patient?._id.slice(-6)}
          </p>
        </div>
      </div>

      {/* INFO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Info label="Email" value={patient?.userId?.email} />
        <Info label="Phone" value={patient?.phone_number || "N/A"} />
        <Info label="Age" value={patient?.age || "N/A"} />
        <Info label="Gender" value={patient?.gender || "N/A"} />
        <Info label="Blood Group" value={patient?.bloodGroup || "N/A"} />
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3 mt-6">
        {/* MORE DETAILS */}
            
        <button
        onClick={() =>
            navigate(`/doctor-dashboard/patient-details/${patient._id}`)
            }
        className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-sm font-medium"
        >
        More Details
        </button>
        {/* START CONSULTATION */}
        <motion.button
          onClick={startConsultation}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm font-medium"
        >
          Start Consultation
        </motion.button>
      </div>
    </motion.div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-white/10 backdrop-blur rounded-xl p-3">
    <p className="text-xs text-purple-200">{label}</p>
    <p className="font-semibold">{value}</p>
  </div>
);

export default PatientProfile;