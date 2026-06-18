import React from 'react'
import LandingPage from '../pages/LandingPage'
import {Routes,Route} from 'react-router-dom'
import SelectRole from '../pages/Auth/SelectRole'
import HospitalSignup from '../pages/Auth/HospitalSignup'
import Login from '../pages/Login'
import PharmacySignup from '../pages/Auth/PharmacySignup'
import ProtectedRoutes from './protectedRoutes'
import HospitalDashboard from '../pages/HospitalDashboard'

const AppRoutes = () => {
  return (
    <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/signup' element={<SelectRole />} />
        <Route path='/signup/hospital' element={<HospitalSignup />} />
        <Route path='/login/doctor' element={<Login />} />
        <Route path='/signup/pharmacy' element={<PharmacySignup />} />
        <Route path='/hospital-dashboard' 
          element={
            <ProtectedRoutes allowedRoles={["admin"]}>
              <HospitalDashboard />
            </ProtectedRoutes>
          }
        />
    </Routes>
  )
}

export default AppRoutes