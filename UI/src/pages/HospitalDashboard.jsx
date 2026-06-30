
import { useState } from "react";
import { logout } from "../api/backend";
import Profile from "../components/Hospitals/Profile";
import AllCards from "../components/Hospitals/AllCards";
import IntroSection from "../components/Hospitals/IntroSection";
import DepartmentProfile from "../features/Admin/DepartmentProfile";

/* ------------------ Main Component ------------------ */

export default function HospitalDashboard() {
  return (
    <>
     <IntroSection />
      <AllCards />
    </>
  );
}
