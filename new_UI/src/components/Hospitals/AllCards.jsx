import React from 'react'
import StatsCard from './StatsCard'
import { Building2, CalendarDays } from 'lucide-react'
import { FaUserDoctor, FaUsers } from "react-icons/fa6";
import { useStats } from '../../hooks/useStats'

/*
  Overview metrics. Same hook, same four cards, same routes and kebab options -
  including the `count` fallbacks and the /appointments and /patients targets,
  which have no route registered yet and so land on a blank page, as before.
*/

const AllCards = () => {
  // Cached under queryKeys.hospitalStats. Navigating away (e.g. to
  // Today's Appointments) and back re-mounts this component, but the
  // cache survives - isLoading stays false on return, so no reload.
  const { data: stats, isLoading, isError, refetch } = useStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-card bg-surface-container" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-error/40 bg-error-container px-4 py-3">
        <span className="text-body-md text-on-error-container">Could not load stats.</span>
        <button
          onClick={() => refetch()}
          className="rounded-control border border-on-error-container/30 px-3 py-1.5 text-body-sm font-medium text-on-error-container transition hover:bg-on-error-container/10"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

      <StatsCard
        title="Total Departments"
        count={stats.countDepartment || 0}
        icon={Building2}
        route="/hospital-dashboard/departments"
        bg='#00685f'
        options={[
          { label: "add department", route: "/hospital-dashboard/departments/add" },
          { label: "edit department", route: "/hospital-dashboard/departments" }
        ]}
      />

      <StatsCard
        title="Total Doctors"
        count={stats.countDoctor || 5}
        icon={FaUserDoctor}
        route="/hospital-dashboard/doctors"
        bg='#006398'
        options={[
          { label: "add doctor", route: "/hospital-dashboard/doctors/add" },
          { label: "delete doctor", route: "/hospital-dashboard/doctors/add" }
        ]}
      />
      <StatsCard
        title="Total Appointments Today"
        count={stats.countAppointment || 0}
        icon={CalendarDays}
        route="/hospital-dashboard/appointments"
        bg='#4648d4'
        options={[
          { label: "today appointment", route: "/hospital-dashboard/appointments/" }
        ]}
      />

      <StatsCard
        title="Total Patients Today"
        count={stats.countPatient || 0}
        icon={FaUsers}
        route="/hospital-dashboard/patients"
        bg='#008378'
        options={[
          { label: "todays patients", route: "/hospital-dashboard/patients/today" }
        ]}
      />

    </div>
  )
}

export default AllCards
