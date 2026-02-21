
import { Navigate } from "react-router-dom";
import { ROLE } from "../constants/role";
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 🔴 No token → login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 🔴 Token hai but role missing → force logout
  if (!role) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  // 🔴 Role present but not allowed
//   if (allowedRoles && !allowedRoles.includes(role)) {
//     return <Navigate to="/unauthorized" replace />;
//   }
if (allowedRoles && !allowedRoles.includes(role)) {
  if (role === ROLE.admin) return <Navigate to="/admin-dashboard" />;
  if (role === ROLE.doctor) return <Navigate to="/doctor-dashboard" />;
  if (role === ROLE.patient) return <Navigate to="/patient-dashboard" />;
  if (role === ROLE.pharmacy) return <Navigate to="/pharmacy-dashboard" />
}


  return children;
};

export default ProtectedRoute;
