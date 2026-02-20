import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { motion } from "framer-motion";

const MoreDetails = () => {
  const { id, appointmentId } = useParams();

  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    console.log("Patient ID:", id);
    getPrescriptions();
    getAppointments();
  }, [id]);

  const getPrescriptions = async () => {
    try {
      const res = await api.get(`/prescription/get-prescription/${id}`);
      setPrescriptions(res.data.prescriptions);
    } catch (err) {
      console.log(err);
    }
  };

  const getAppointments = async () => {
    try {
      const res = await api.get(`/patients/get-appointments/${id}`);
      setAppointments(res.data.appointments);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 text-white"
    >
      <h2 className="text-2xl font-semibold mb-6">
        Patient Medical History
      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        {/* PRESCRIPTIONS */}
        <div>
          <h3 className="text-purple-300 font-semibold mb-3">
            Prescriptions
          </h3>

          {prescriptions.length === 0 ? (
            <p className="text-sm text-purple-400">No prescriptions</p>
          ) : (
            prescriptions.map((rx) => (
              <div
                key={rx._id}
                className="bg-white/10 p-4 rounded-xl mb-3 backdrop-blur"
              >
                <p className="text-sm">
                  <span className="text-purple-200">Diagnosis:</span>{" "}
                  {rx.diagnosis.join(", ")}
                </p>

                <p className="text-sm">
                  <span className="text-purple-200">Medicines:</span>{" "}
                  {rx.medicines.map((m) => m.name).join(", ")}
                </p>

                <p className="text-xs text-purple-300 mt-1">
                  {new Date(rx.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>

        {/* APPOINTMENTS */}
        <div>
          <h3 className="text-purple-300 font-semibold mb-3">
            Past Visits
          </h3>

          {appointments.length === 0 ? (
            <p className="text-sm text-purple-400">No visits</p>
          ) : (
            appointments.map((appt) => (
              <div
                key={appt._id}
                className="bg-white/10 p-4 rounded-xl mb-3 backdrop-blur"
              >
                <p className="text-sm">
                  <span className="text-purple-200">Status:</span>{" "}
                  {appt.status}
                </p>

                <p className="text-sm">
                  <span className="text-purple-200">Date:</span>{" "}
                  {new Date(appt.date).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default MoreDetails; 