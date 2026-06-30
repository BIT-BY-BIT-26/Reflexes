import React, { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  CheckCircle,
  ShieldCheck,
  Clock3,
  Search,
  ArrowRight,
} from "lucide-react";
import { getDoctorDashboard } from "../../api/backend";
import { useNavigate } from "react-router-dom";
const DoctorCards = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const { data } = await getDoctorDashboard();

      setDashboard(data.dashboard);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

const stats = [
  {
    title: "Today's Appointments",
    value: dashboard?.totalAppointments,
    icon: Calendar,
    color: "from-emerald-500 to-green-600",
    route: "/doctor-dashboard/appointments",
  },
  {
    title: "Confirmed",
    value: dashboard?.confirmedAppointments,
    icon: ShieldCheck,
    color: "from-blue-500 to-indigo-600",
  },
  {
    title: "Pending",
    value: dashboard?.pendingAppointments,
    icon: Clock3,
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Today's Completed",
    value: dashboard?.todayCompletedAppointments,
    icon: Clock3,
    color: "from-orange-500 to-red-500",
  },
];
  if (loading) {
    return (
      <div className="text-center text-gray-400 py-10">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-10">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 mt-10 gap-6">
       <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 hover:border-green-500 transition-all duration-300">
        <div className="flex justify-between items-center">
            <div>

            <p className="text-gray-400">
            Completed Appointments
            </p>

            <h2 className="text-5xl font-bold text-white mt-3">
            {dashboard?.completedAppointments}
            </h2>

            </div>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex justify-center items-center shadow-lg">

            <CheckCircle className="text-white" size={30}/>

            </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-8">

        <div className="rounded-2xl bg-violet-500/10 border border-violet-500/20 p-2">

        <p className="text-sm text-gray-200">
        New Patients
        </p>

        <h3 className="text-xl font-bold text-white mt-2">
        {dashboard?.todayNewPatients}
        </h3>

        </div>

        <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-2">

        <p className="text-sm text-gray-200">
        Unique Patients
        </p>

        <h3 className="text-xl font-bold text-white mt-2">
        {dashboard?.totalPatients}
        </h3>

        </div>

        </div>
    </div>

      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="bg-[#111827] border border-gray-800 rounded-2xl p-6 hover:border-purple-500 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{item.title}</p>

                <h2 className="text-3xl font-bold text-white mt-2">
                  {item.value}
                </h2>
              </div>

              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center`}
              >
                <Icon className="text-white" size={28} />
              </div>
            </div>
          {item.title === "Today's Appointments" && (
            <button
              onClick={() => navigate(item.route)}
              className="mt-20 flex items-center gap-2 text-violet-400 hover:text-violet-300 font-medium"
            >
              View Details
              <ArrowRight size={17} />
            </button>
          )}
          </div>
        );
      })}
    </div>
  );
};

export default DoctorCards;