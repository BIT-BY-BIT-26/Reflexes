
import { useState } from "react";
import { logout } from "../api/backend";
import Profile from "../components/Hospitals/Profile";
import Sidebar from "../components/Hospitals/Sidebar";
import AllCards from "../components/Hospitals/AllCards";

/* ------------------ Main Component ------------------ */

export default function HospitalDashboard() {
  return (
    <div className="h-screen w-screen bg-black">
      {/* <AllCards /> */}
      <Sidebar />
      {/* <Profile /> */}
    </div>
  );
}
