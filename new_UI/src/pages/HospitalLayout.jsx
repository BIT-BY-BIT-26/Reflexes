import { Outlet } from "react-router-dom";
import {
  Building2,
  LayoutDashboard,
  SlidersHorizontal,
  Stethoscope,
  UserRound,
} from "lucide-react";
import AppSidebar from "../components/layout/AppSidebar";
import AppTopbar from "../components/layout/AppTopbar";
import { useStats } from "../hooks/useStats";

/*
  Shell for /hospital-dashboard/*. Same AppSidebar / AppTopbar as the doctor
  shell - the topbar's search, theme toggle, bell and profile menu all keep the
  destinations the old Navbar used for admins.
*/

const navItems = [
  { to: "/hospital-dashboard", end: true, label: "Overview", icon: LayoutDashboard },
  { to: "/hospital-dashboard/departments", label: "Departments", icon: Building2 },
  { to: "/hospital-dashboard/doctors", label: "Doctors", icon: Stethoscope },
  { to: "/hospital-dashboard/hospital-profile", label: "Hospital profile", icon: UserRound },
  { to: "/hospital-dashboard/profile", label: "Edit profile", icon: SlidersHorizontal },
];

/*
  Reads the same cached hospitalStats query the dashboard cards use, so this
  costs no extra request.
*/
const HospitalSummary = () => {
  const { data: stats } = useStats();

  return (
    <>
      <p className="text-label-caps uppercase text-on-surface-variant">Hospital</p>
      <p className="mt-2 font-display text-title-card text-on-surface">Administration</p>
      <p className="mt-1 text-body-sm text-on-surface-variant tabular">
        {stats
          ? `${stats.countDepartment || 0} departments · ${stats.countDoctor || 0} doctors`
          : "Loading figures…"}
      </p>
    </>
  );
};

const HospitalLayout = () => {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <AppSidebar items={navItems} sectionLabel="Administration">
        <HospitalSummary />
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

export default HospitalLayout;
