import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Hospitals/Sidebar'
import Navbar from '../components/Navbar'
import AccessFeatures from '../features/doctor/AccessFeatures'
import DoctorHome from '../components/Doctors/DoctorHome'
import { getDoctorStatus } from '../api/backend'
import socket from '../socket'
import { useDispatch, useSelector } from 'react-redux'
import { addNotification } from '../redux/slices/notificationSlice'

const DoctorDashboard = () => { 
  const dispatch = useDispatch();
  const [doctorStatus,setDoctorStatus] = useState(null);
  const [loading,setLoading] = useState(true);
  const user = useSelector((state)=>state.auth.user);
  const doctorId = user?.doctorId;

  useEffect(() => {
  if (!doctorId) return;

  console.log("🔵 Trying to connect socket...");
  console.log("Doctor ID:", doctorId);

  socket.connect();

  socket.on("connect", () => {
    console.log("🟢 SOCKET CONNECTED!");
    console.log("Socket ID from nishu:", socket.id);

    socket.emit("joinDoctor", doctorId);

    console.log("📢 joinDoctor emitted:", doctorId);
  });

  socket.on("connect_error", (error) => {
    console.log("❌ SOCKET CONNECTION ERROR:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔴 SOCKET DISCONNECTED:", reason);
  });

  return () => {
    socket.off("connect");
    socket.off("connect_error");
    socket.off("disconnect");

    socket.disconnect();
  };
}, [doctorId]);

  useEffect(()=>{
    const handleNewAppointment = (data) =>{
      dispatch(addNotification({
      id: data.appointmentId,
      message: data.message,
      appointmentId: data.appointmentId,
      patientId: data.patientId,
      date: data.date,
      type: "NEW_APPOINTMENT",
      createdAt: new Date().toISOString()
    }));
  };
   socket.on("new-appointment", handleNewAppointment);

  return () => {
    socket.off("new-appointment", handleNewAppointment);
  };
},[]);
    useEffect(() => {
        fetchDoctorStatus();
    }, []);

    useEffect(() => {
      if (!doctorId) return;

      socket.connect();
      socket.emit("joinDoctor", doctorId);

      return () => {
        socket.disconnect();
      };
    }, [doctorId]);

    const fetchDoctorStatus = async () => {
    try {
      const res = await getDoctorStatus();
      setDoctorStatus(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
   if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <>
      {/* Main area */}
      <div >
        {doctorStatus?.profileCompleted ? (
            <DoctorHome />
          ) : (
            <AccessFeatures
              doctorStatus={doctorStatus}
              refreshDoctorStatus={fetchDoctorStatus}
            />
        )}
      </div>
    </>
  )
}

export default DoctorDashboard




