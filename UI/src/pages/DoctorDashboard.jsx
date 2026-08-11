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
  console.log("localStorage user:", localStorage.getItem('user'));
  const user = useSelector((state)=>state.auth.user);
  const doctorId = user?.doctorId;

  console.log("USER:", user);
  console.log("DOCTOR ID:", doctorId);

  useEffect(()=>{
    const handleNewAppointment = (data) =>{
      console.log("New appointment",data);
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




