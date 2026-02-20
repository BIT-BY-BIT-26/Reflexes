import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

const PatientProfile = () => {
  const { id,appointmentId } = useParams();
console.log(id, appointmentId); // debugging
  const [patient, setPatient] = useState(null);

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
      className="bg-gradient-to-br from-purple-950 via-purple-900 to-purple-800 
      rounded-2xl p-6 shadow-xl text-white"
    >
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-purple-700 flex items-center justify-center text-2xl font-bold shadow-md">
          {patient?.userId?.name?.charAt(0).toUpperCase()}
        </div>

        <div>
          <h3 className="text-xl font-semibold">
            {patient?.userId?.name}
          </h3>
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
