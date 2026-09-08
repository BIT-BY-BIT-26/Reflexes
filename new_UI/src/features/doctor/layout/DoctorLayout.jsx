import { Outlet } from "react-router-dom";
import { Activity, Bell, CalendarDays, LayoutDashboard } from "lucide-react";
import { useSelector } from "react-redux";
import AppSidebar from "../../../components/layout/AppSidebar";
import AppTopbar from "../../../components/layout/AppTopbar";

/*
  Shell for /doctor-dashboard/*. The hospital admin and pharmacy trees use their
  own layouts, so nothing outside the doctor screens changes.
*/

const navItems = [
  { to: "/doctor-dashboard", end: true, label: "OPD Console", icon: LayoutDashboard },
  { to: "/doctor-dashboard/appointments", label: "Today's Appointments", icon: CalendarDays },
  { to: "/doctor-dashboard/notifications", label: "Notifications", icon: Bell, showUnread: true },
];

/* Read-only mirror of the opd slice. */
const OpdStatus = () => {
  const { opdStarted, opdPaused, appointments } = useSelector((state) => state.opd);

  const label = !opdStarted ? "OPD closed" : opdPaused ? "OPD paused" : "OPD live";

  const tone = !opdStarted
    ? "text-on-surface-variant"
    : opdPaused
    ? "text-warning"
    : "text-primary";

  return (
    <>
      <p className="text-label-caps uppercase text-on-surface-variant">Session</p>
      <div className="mt-2 flex items-center gap-2">
        <span className={`flex items-center gap-2 font-display text-title-card ${tone}`}>
          <Activity size={16} />
          {label}
        </span>
      </div>
      <p className="mt-1 text-body-sm text-on-surface-variant tabular">
        {opdStarted ? `${appointments.length} waiting in queue` : "Start OPD to open the queue"}
      </p>
    </>
  );
};

const DoctorLayout = () => {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <AppSidebar items={navItems} sectionLabel="Clinical suite">
        <OpdStatus />
      </AppSidebar>

      <div className="lg:pl-64">
        <AppTopbar />
        <main className="px-4 py-6 md:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;
