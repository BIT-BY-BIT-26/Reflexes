import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket/socket";
import api from "../api/axios";
// const socket = io("http://10.6.6.133:3000");
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { fetchDoctorProfile, fetchTodayAppointments } from "../redux/doctor/doctorThunk";
import { addAppointment } from "../redux/doctor/appointmentSlice";
import Sidebar from "../DoctorDashboard.jsx/sidebar";
import Navbar from "../DoctorDashboard.jsx/Navbar";
import OpdWorkingArea from "../DoctorDashboard.jsx/opdWorking";
import StartOpd from "../DoctorDashboard.jsx/startOpd";
const DoctorDashboard = () => {
  console.log("Dashboard mounted");
  const navigate = useNavigate();
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [currentToken, setCurrentToken] = useState(null);
  const [queue, setQueue] = useState([]);
  const dispatch = useDispatch();
   const {doctor, loading, profileCompleted,isOnline,opdStarted} = useSelector(
    (state)=> state.doctor
  )
    useEffect(() => {
    if (!doctor) {
      dispatch(fetchDoctorProfile());
    }
  }, []);
  const doctorId = doctor?._id;
  useEffect(() => {
  if (profileCompleted === false) {
    setShowProfilePopup(true);
  }
}, [profileCompleted]);

useEffect(() => {

  if(!doctorId) return;

  // Always join room when dashboard loads
  socket.emit("joinDoctor", doctorId);

  console.log("✅ Joined Doctor Room");

  return () => {
    socket.emit("leaveDoctor", doctorId);
    console.log("❌ Left Doctor Room");
  };

}, []);
  
    useEffect(() => {
    if(!doctorId) return;

  if(isOnline){
    socket.emit("doctor-online", doctorId);
    console.log("Doctor Online");
  }
  else{
    socket.emit("doctor-offline", doctorId);
    console.log("Doctor Offline");
  }
    const handlepatientConnected= (patientId) => {
      console.log("✅ Patient Connected",patientId);
      alert("Patient Connected");
    };

      const handlePatientOffline=() => {
        console.log("❌ Patient Offline");
      };
      
     const handleAppointmentCompleted= () => {
        fetchAppointments();
      };
      const handleNewAppointment = (data) => {
        dispatch(addAppointment(data));
        dispatch(fetchTodayAppointments());
      };

       socket.on("newAppointment", handleNewAppointment);
      socket.on("patient-connected",handlepatientConnected);
      socket.on("patient-offline",handlePatientOffline);
      socket.on("appointmentCompleted",handleAppointmentCompleted);
    // cleanup
    return () => {
        socket.off("patient-connected", handlepatientConnected);
        socket.off("patient-offline", handlePatientOffline);
        socket.off("appointmentCompleted", handleAppointmentCompleted);
         socket.off("newAppointment",handleNewAppointment);
    };
  }, [doctorId,isOnline]);

    useEffect(() => {

    socket.on("TOKEN_UPDATE", (data) => {
      setCurrentToken(data.tokenNumber);
    });
    socket.on("QUEUE_UPDATE", (data) => {
      setQueue(data.queue);
    });


    return () => {
      socket.off("TOKEN_UPDATE");
      socket.off("QUEUE_UPDATE");
    };

  }, []);

  const callNext = () => {
    socket.emit("CALL_NEXT_PATIENT", {
         opdSessionId: "123"
    });
  };

if (loading) {
  return (
    <div className="h-screen flex justify-center items-center">
      Loading...
    </div>
  );
}

  return (
    <div className="flex flex-col">
      <div>
        <Sidebar />
      </div>
      <div className="bg-blue-900 h-screen w-screen text-center align-center jusitify-center ">
        <Navbar />
        <div className="w-full flex justify-center pl-20 mt-6 px-6">
          <motion.div
              className="w-full backdrop-blur-md bg-white/5 border border-white/20 
                        rounded-2xl px-8 py-6 shadow-lg relative z-10"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1
                className="text-2xl md:text-4xl font-bold text-white tracking-wide"
              >
                Welcome to Doctor Dashboard,

                <motion.span
                  className="block text-blue-300 mt-3"
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  {doctor?.userId?.name || "Doctor"}
                </motion.span>
              </motion.h1>
            </motion.div>

        </div>
         <div>
        <OpdWorkingArea />
        
      </div>
      </div>
     
    </div>
  );
};




export default DoctorDashboard;




