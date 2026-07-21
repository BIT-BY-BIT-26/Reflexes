import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Hospitals/Sidebar'
import Navbar from '../components/Navbar'
import AccessFeatures from '../features/doctor/AccessFeatures'
import DoctorHome from '../components/Doctors/DoctorHome'
import { getDoctorStatus } from '../api/backend'

const DoctorDashboard = () => { 
  const [doctorStatus,setDoctorStatus] = useState(null);
  const [loading,setLoading] = useState(true);

    useEffect(() => {
        fetchDoctorStatus();
    }, []);
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




