import React from 'react'
import LandingPage from '../pages/LandingPage'
import {Routes,Route} from 'react-router-dom'
import SelectRole from '../pages/Auth/SelectRole'
import HospitalSignup from '../pages/Auth/HospitalSignup'
import Login from '../pages/Login'
import PharmacySignup from '../pages/Auth/PharmacySignup'
import ProtectedRoutes from './protectedRoutes'
import HospitalDashboard from '../pages/HospitalDashboard'
import LoginPlatformAdmin from '../pages/Auth/LoginPlatformAdmin'
import PlatFormDashboard from '../pages/PlatFormDashboard'
import { ROLE } from '../constants/Role'
import PublicRoute from './PublicRoute'

const AppRoutes = () => {
  return (
    <Routes>
        <Route path='/' element={
           <PublicRoute>
            <LandingPage />
          </PublicRoute>
        } />
        <Route path='/signup' element={<SelectRole />} />
        <Route path='/signup/hospital' element={<HospitalSignup />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route path='/signup/pharmacy' element={<PharmacySignup />} />
        <Route path='/admin/login' element={<LoginPlatformAdmin />} />

        <Route
          path="/platform-dashboard"
          element={
            <ProtectedRoutes allowedRoles={[ROLE.platform_admin]}>
              <PlatFormDashboard />
            </ProtectedRoutes>
          }
        />
        
        <Route path='/hospital-dashboard' 
          element={
            <ProtectedRoutes allowedRoles={[ROLE.admin]}>
              <HospitalDashboard />
            </ProtectedRoutes>
          }
        />
    </Routes>
  )
}

export default AppRoutes