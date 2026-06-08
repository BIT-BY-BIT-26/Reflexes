import React from 'react'
import LandingPage from '../pages/LandingPage'
import {Routes,Route} from 'react-router-dom'
import SelectRole from '../pages/Auth/SelectRole'
import HospitalSignup from '../pages/Auth/HospitalSignup'
import Login from '../pages/Login'
import PharmacySignup from '../pages/Auth/PharmacySignup'

const AppRoutes = () => {
  return (
    <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/signup' element={<SelectRole />} />
        <Route path='/signup/hospital' element={<HospitalSignup />} />
        <Route path='/login/doctor' element={<Login />} />
        <Route path='/signup/pharmacy' element={<PharmacySignup />} />
    </Routes>
  )
}

export default AppRoutes