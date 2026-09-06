import { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  Building2,
  LayoutDashboard,
  PlusCircle,
  UserPlus,
  Users,
} from "lucide-react";
import { useSelector } from "react-redux";
import AppSidebar from "../components/layout/AppSidebar";
import Navbar from "../components/Navbar";

/*
  Shell for /hospital-dashboard/*. Same rail as DoctorLayout - the admin tree
  had no navigation at all once the Navbar hamburger stopped rendering its
  one-item popover.

  Every entry below is a route registered in AppRoutes under ROLE.admin.
  /hospital-dashboard/hospital-profile is declared outside this layout, so it
  renders on its own - the link still works, it just loses the rail.
*/

const navItems = [
  { to: "/hospital-dashboard", end: true, label: "Dashboard", icon: LayoutDashboard },
  { to: "/hospital-dashboard/departments", end: true, label: "Departments", icon: Building2 },
  { to: "/hospital-dashboard/departments/add", label: "Add Department", icon: PlusCircle },
  { to: "/hospital-dashboard/doctors", end: true, label: "Doctors", icon: Users },
  { to: "/hospital-dashboard/doctors/add", label: "Add Doctor", icon: UserPlus },
];

/* Read-only identity block; `user` is whatever loginUser returned. */
const AdminIdentity = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
        Signed in as
      </p>

      <p className="mt-2 truncate font-semibold text-gray-900 dark:text-white">
        {user?.name || "Hospital admin"}
      </p>

      {user?.email && (
        <p className="mt-1 truncate text-xs text-gray-500 dark:text-slate-400">
          {user.email}
        </p>
      )}
    </>
  );
};

const HospitalLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <AppSidebar
        items={navItems}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sectionLabel="Administration"
        brandLabel="Hospital Admin"
      >
        <AdminIdentity />
      </AppSidebar>

      <div className="lg:pl-64">
        <Navbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HospitalLayout;
