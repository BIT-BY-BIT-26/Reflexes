import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./protected/protectedRoute";
import { ROLE } from "./Constants/role";
import DoctorDashboard from "./components/DoctorDashboard";
import PublicRoute from "./protected/publicRoute";
import Login from "./pages/Login";
import RegisterHospital from "./pages/RegisterHospital";
import RegisterRole from "./pages/RegisterRoles";
import RegisterPharmacy from "./pages/RegisterPharmacy";
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
       
      <Route path="/register-role" element={<RegisterRole />} />
      <Route path="/register-pharmacy" element={<RegisterPharmacy />} />

      <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterHospital />
            </PublicRoute>
          }
        />
       <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
         <Route
        path="/doctor-dashboard"
        element={
          <ProtectedRoute allowedRoles={[ROLE.doctor]}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />

    </Routes>
    
    </BrowserRouter>
  );
}

export default App;
