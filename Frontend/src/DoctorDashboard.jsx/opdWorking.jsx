import { motion } from "framer-motion";
import AllAppointments from "./AllAppointmnets";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import socket from "../socket/socket";
import { fetchTodayAppointments, fetchTodayStats } from "../redux/doctor/doctorThunk";
import { useNavigate, Outlet } from "react-router-dom";

const OpdWorkingArea = () => {

  const { opdStarted } = useSelector(state => state.doctor);
  const { stats = {}, todayAppointments = [] } = useSelector(state => state.appointment);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (opdStarted) {
      dispatch(fetchTodayStats());
      dispatch(fetchTodayAppointments());
    }
  }, [opdStarted, dispatch]);

  const handlePatientClick = (patientId) => {
    navigate(`/doctor-dashboard/patient/${patientId}`);
  };

  const statCards = [
    { label: "Total", value: stats.total, color: "text-white" },
    { label: "Pending", value: stats.pending, color: "text-yellow-400" },
    { label: "Confirmed", value: stats.confirmed, color: "text-green-400" },
    { label: "Cancelled", value: stats.cancelled, color: "text-red-400" },
    { label: "Current", value: stats.current, color: "text-blue-400" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 text-white space-y-6"
    >

      {/* ===== SUMMARY CARD ===== */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 80 }}
        className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 rounded-2xl px-6 py-4 shadow-xl"
      >
        <h2 className="text-xl font-semibold mb-4">
          Today Appointment Summary
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statCards.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center"
            >
              <p className="text-sm text-gray-300">{item.label}</p>
              <p className={`text-3xl font-bold ${item.color}`}>
                {item.value ?? 0}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-center gap-4 flex-wrap mt-6">
          {["Current Patient", "Call Next Patient", "Skip & Call Next"].map((btn, index) => (
            <motion.button
              key={index}
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 0px 14px rgba(168,85,247,0.6)"
              }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-700 px-6 py-3 rounded-full font-medium"
            >
              {btn}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ===== QUEUE + PROFILE ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* LEFT — TODAY APPOINTMENTS */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-blue-950 rounded-2xl p-6 shadow-lg"
        >
          {/* Sticky header inside panel */}
          <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-blue-950 py-2 z-10">
            Today's Appointments
          </h3>

          {/* Scrollable area */}
          <div className="max-h-[65vh] overflow-y-auto pr-2">
            <AllAppointments
              appointments={todayAppointments}
              onPatientClick={handlePatientClick}
            />
          </div>
        </motion.div>

        {/* RIGHT — PATIENT PROFILE */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-blue-950 rounded-2xl p-6 shadow-lg"
        >
          <div className="min-h-[200px]">
            <Outlet />

            {!todayAppointments.length && (
              <p className="text-gray-400 text-center mt-10">
                No patient selected
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OpdWorkingArea;
