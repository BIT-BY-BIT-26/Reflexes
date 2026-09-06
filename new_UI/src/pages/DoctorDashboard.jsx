import React, { useEffect, useState } from 'react'
import AccessFeatures from '../features/doctor/AccessFeatures'
import DoctorHome from '../components/Doctors/DoctorHome'
import { getDoctorStatus } from '../api/backend'
import socket from '../socket'
import { useDispatch, useSelector } from 'react-redux'
import { addNotification } from '../redux/slices/notificationSlice'

/*
  Unchanged container: profile-status gate, the new-appointment socket listener
  and the joinDoctor room join all work exactly as before. Only the loading
  placeholder was restyled.
*/

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
    return (
      <div className="flex flex-col gap-4">
        <div className="h-16 w-72 animate-pulse rounded-card bg-surface-container" />
        <div className="h-44 animate-pulse rounded-card bg-surface-container" />
        <div className="h-20 animate-pulse rounded-card bg-surface-container" />
      </div>
    );
  }

  return (
    <>
      {doctorStatus?.profileCompleted ? (
        <DoctorHome />
      ) : (
        <AccessFeatures
          doctorStatus={doctorStatus}
          refreshDoctorStatus={fetchDoctorStatus}
        />
      )}
    </>
  )
}

export default DoctorDashboard
