import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./protected/protectedRoute";
import DoctorDashboard from "./components/DoctorDashboard";
import PublicRoute from "./protected/publicRoute";
import Login from "./pages/Login";
import RegisterHospital from "./pages/RegisterHospital";
import RegisterRole from "./pages/RegisterRoles";
import RegisterPharmacy from "./pages/RegisterPharmacy";
import PharmacyDashboard from "./components/PharmacyDashboard";
import { ROLE } from "./constants/role";
import AdminDashboard from "./components/AdminDashboard";
import PatientProfile from "./patientComponents/getPatientProfile";
import Dashboard from "./onlineConsultation.jsx/Dashboard";
import DoctorProfile from "./DoctorDashboard.jsx/DoctorProfile";
import CompleteProfile from "./components/CompleteProfile";
import MoreDetails from "./patientComponents/moreDetails";
import MedicalChatbot from "./chatbot/MedicalChatbot";
// import ForgotPassword from "./pages/ForgotPassword";
function App() {
  return (
    <BrowserRouter>
      {/* 🔔 Toast container (only once) */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
                <Routes>
                <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterHospital />
            </PublicRoute>
          }
        />
        <Route path="/register-role" element={<RegisterRole />} />
      <Route path="/register-pharmacy" element={<RegisterPharmacy />} />
      <Route path="/pharmacy-dashboard" element={<PharmacyDashboard />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
    <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={[ROLE.admin]}>
              <AdminDashboard />
        </ProtectedRoute>} />

        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLE.doctor]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        >
        <Route path="patient/:id" element={<PatientProfile />}/>
        <Route
          path="patient-details/:id"
          element={<MoreDetails />}
        />
    </Route> 
      <Route
        path="/doctor/profile"
        element={
          <ProtectedRoute allowedRoles={[ROLE.doctor]}>
            <DoctorProfile />
          </ProtectedRoute>
        }
      ></Route>
       <Route
        path="/doctor/complete-profile"
        element={
          <ProtectedRoute allowedRoles={[ROLE.doctor]}>
            <CompleteProfile />
          </ProtectedRoute>
        }
      />

      <Route path="/chatbot" element={<MedicalChatbot />} />
      <Route
      path="/online-assessment"
      element={
        <ProtectedRoute allowedRoles={[ROLE.doctor]}>
          <Dashboard />
        </ProtectedRoute>
      }
    />
    </Routes>
    
    </BrowserRouter>
  );
}

export default App;
