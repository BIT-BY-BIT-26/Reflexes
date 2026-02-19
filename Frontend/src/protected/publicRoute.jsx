import { Navigate } from "react-router-dom";
import { ROLE } from "../constants/role";


const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token && role) {
    if (role === ROLE.admin) {
      return <Navigate to="/admin-dashboard" />;
    }
    if (role === ROLE.doctor) {
      return <Navigate to="/doctor-dashboard" />;
    }
    if (role === ROLE.patient) {
      return <Navigate to="/patient-dashboard" />;
    }
  }

  return children;
};

export default PublicRoute;
