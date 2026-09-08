import AllCards from "../components/Hospitals/AllCards";
import DoctorStatus from "../features/Admin/DoctorStatus";
import PageHeader from "../components/layout/PageHeader";
import LiveClock from "../components/layout/LiveClock";

/*
  Hospital admin overview. Same three pieces as before - the intro banner is now
  the page header, the stat cards and the live doctor status board are unchanged
  components.
*/

export default function HospitalDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Hospital admin"
        title="Hospital Overview"
        description="Departments, doctors and today's load, with live availability from the socket feed."
      >
        <LiveClock />
      </PageHeader>

      <AllCards />
      <DoctorStatus />
    </div>
  );
}
