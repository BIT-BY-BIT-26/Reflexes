import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Hospitals/Sidebar";
const HospitalLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Sidebar - fixed, stays on top */}
      <Sidebar />

      {/* Right side wrapper: Navbar + page content */}
      <div className="ml-20 transition-all">
        <Navbar />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HospitalLayout;