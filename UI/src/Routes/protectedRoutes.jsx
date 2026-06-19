import React from 'react'
import { Navigate } from 'react-router-dom';
import { ROLE } from '../constants/Role';

const ProtectedRoutes = ({children,allowedRoles}) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if(!token){
    return <Navigate to='/login' replace />
  }
  if(!role){
    localStorage.clear();
    return <Navigate to='/login' replace />
  }

  if(allowedRoles && !allowedRoles.includes(role)){
    if(role ===ROLE.admin) return <Navigate to='/hospital-dashboard' />
    if(role ===ROLE.doctor) return <Navigate to='/doctor-dashboard' />
    if(role ===ROLE.patient) return <Navigate to='/patient-dashboard' />
    if(role ===ROLE.pharmacy) return <Navigate to='/pharmacy-dashboard' />
    if(role === ROLE.platform_admin) return <Navigate to='/platform-dashboard' />
    //"User galat page par aa gaya hai. Use uske apne dashboard par wapas bhej do."
  }
  return children;
}

export default ProtectedRoutes