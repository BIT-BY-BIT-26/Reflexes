import React, { useEffect, useState } from 'react'
import StatsCard from './StatsCard'
import { Building2, CalendarDays, UserRound, Users } from 'lucide-react'
import { getStats } from '../../api/backend';

const AllCards = () => {
     const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getStats();
        setStats(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

 if (loading) {
    return <div>Loading...</div>;
  }
     return (
    <div className="px-30 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

      <StatsCard
      title="Departments"
      count={stats.countDepartment || 0}
      icon={Building2}
      route="/hospital-dashboard/departments"
    />

      <StatsCard
      title="Doctors"
      count={stats.countDoctor || 5}
      icon={UserRound}
      route="/hospital-dashboard/doctors"
    />

     {/* <StatsCard
      title="Patients"
      count={stats.patients}
      icon={Users}
      route="/hospital-dashboard/patients"
    /> */}

     <StatsCard
      title="Appointments"
      count={stats.countAppointment || 0}
      icon={CalendarDays}
      route="/hospital-dashboard/appointments"
    />

    </div>
  )
}

export default AllCards