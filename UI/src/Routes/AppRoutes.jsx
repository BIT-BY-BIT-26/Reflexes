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
import AddDepartment from '../features/Admin/AddDepartment'
import CompleteProfile from '../features/Admin/CompleteProfile'
import Profile from '../components/Hospitals/Profile'
import DoctorDashboard from '../pages/DoctorDashboard'
import AllDepartments from '../features/Admin/AllDepartments'
import HospitalLayout from '../pages/HospitalLayout'
import AddDoctor from '../features/Admin/AddDoctor'
import AllDoctor from '../features/Admin/AllDoctor'
import EmergencyRequests from '../features/Admin/EmergencyRequests'
import Appointment from '../components/Doctors/Appointment'
import OpdSchedule from '../features/Admin/OpdSchedule'
import NotificationSection from '../components/NotificationSection'
import SignupPharmacy from '../components/Pharmacy/SignupPharmacy'
import PharmacyDashboard from '../components/Pharmacy/PharmacyDashboard'
import PharmacyLayout from '../features/pharmacy/PharmacyLayout'
import AddMedicine from '../features/pharmacy/AddMedicine'
import PatientReport from '../features/Admin/PatientProfileAdmin'
import PatientProfileAdmin from '../features/Admin/PatientProfileAdmin'
import PatientProfileDoctor from '../features/doctor/PatientProfileDoctor'
import PrescriptionOptions from '../features/doctor/PrescritionOptions'
import PatientHistory from '../features/doctor/PatientHistory'
import SharedMedicalData from '../features/doctor/SharedMedicalData'
import VideoCallPage from '../features/doctor/VideoCallPage'
import DoctorLayout from '../features/doctor/layout/DoctorLayout'


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
        <Route path='/hospital-dashboard' element={<ProtectedRoutes allowedRoles={[ROLE.admin]}>
          <HospitalLayout />
        </ProtectedRoutes>}>
          <Route index element={<HospitalDashboard />} />
          <Route path='departments' element={<AllDepartments />} />
          <Route path='departments/add' element={<AddDepartment />}/>
          <Route path='doctors/add' element={<AddDoctor />}/>
          <Route path='doctors' element={<AllDoctor />}/>
          <Route path='notifications' element={<NotificationSection />}/>
          <Route path='emergencies' element={<EmergencyRequests />}/>
          <Route path='doctor/opd-schedule/:doctorId' element={<OpdSchedule />}/>
          <Route path='patients/:id' element={<PatientProfileAdmin />}/>
          <Route path='patient-report/:id' element={<PatientReport />}/>
          
        </Route>


        <Route path='/doctor-dashboard' element={<ProtectedRoutes allowedRoles={[ROLE.doctor]}>
          <DoctorLayout />
        </ProtectedRoutes>}>
          
          <Route index element={<DoctorDashboard />} />
          <Route path='appointments' element={<Appointment />} />
          <Route path='notifications' element={<NotificationSection />}/>
          <Route path='video-call' element={<VideoCallPage />} />
          <Route path='patients/:id' element={<PatientProfileDoctor />}/>
          <Route path='patients/:id/prescription' element={<PrescriptionOptions />}/>
          <Route path='patients/:id/history' element={<PatientHistory />}/>
          <Route path='patients/:id/shared-data' element={<SharedMedicalData />}/>
          
        </Route>  

        <Route path='/hospital-dashboard/profile' 
          element={
            <ProtectedRoutes allowedRoles={[ROLE.admin]}>
              <CompleteProfile />
            </ProtectedRoutes>
          }
        />
        <Route path='/hospital-dashboard/hospital-profile' 
          element={
            <ProtectedRoutes allowedRoles={[ROLE.admin]}>
              <Profile />
            </ProtectedRoutes>
          }
        />

      <Route
        path="/pharmacy-dashboard"
        element={
          <ProtectedRoutes allowedRoles={[ROLE.pharmacy]}>
            <PharmacyLayout />
          </ProtectedRoutes>
        }
      >
        <Route index element={<PharmacyDashboard />} />

        <Route
          path="add-medicine"
          element={<AddMedicine />}
        />
      </Route>

      <Route
        path="*"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />
    </Routes>
  )
}

export default AppRoutes