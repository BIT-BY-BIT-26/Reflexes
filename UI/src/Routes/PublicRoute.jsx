import { Navigate } from "react-router-dom";
import { ROLE } from "../constants/Role";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token && role) {
    switch (role) {
      case ROLE.admin:
        return <Navigate to="/hospital-dashboard" replace />;
      case ROLE.platform_admin:
        return <Navigate to="/platform-dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default PublicRoute;