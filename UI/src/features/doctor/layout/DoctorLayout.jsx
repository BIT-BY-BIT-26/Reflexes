import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Activity, Bell, CalendarDays, LayoutDashboard } from "lucide-react";
import { useSelector } from "react-redux";
import AppSidebar from "../../../components/layout/AppSidebar";
import Navbar from "../../../components/Navbar";

/*
  Shell for /doctor-dashboard/*. The doctor tree used to reuse HospitalLayout,
  which has no sidebar at all - the hamburger in Navbar only opened a one-item
  popover pointing at an admin-only route.

  The hospital-admin and pharmacy trees keep their own layouts, so nothing
  outside the doctor screens changes.
*/

const navItems = [
  { to: "/doctor-dashboard", end: true, label: "OPD Console", icon: LayoutDashboard },
  { to: "/doctor-dashboard/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/doctor-dashboard/notifications", label: "Notifications", icon: Bell, showUnread: true },
];

/* Read-only mirror of the opd slice. */
const OpdStatus = () => {
  const { opdStarted, opdPaused, appointments } = useSelector((state) => state.opd);

  const label = !opdStarted ? "OPD closed" : opdPaused ? "OPD paused" : "OPD live";

  const tone = !opdStarted
    ? "text-gray-500 dark:text-slate-400"
    : opdPaused
    ? "text-amber-500"
    : "text-green-600 dark:text-green-400";

  return (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
        Session
      </p>

      <p className={`mt-2 flex items-center gap-2 font-semibold ${tone}`}>
        <Activity size={16} />
        {label}
      </p>

      <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
        {opdStarted
          ? `${appointments.length} waiting in queue`
          : "Start OPD to open the queue"}
      </p>
    </>
  );
};

const DoctorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <AppSidebar
        items={navItems}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sectionLabel="Clinical suite"
      >
        <OpdStatus />
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

export default DoctorLayout;
