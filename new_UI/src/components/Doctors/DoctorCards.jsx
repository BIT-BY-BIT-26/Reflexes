import React from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDoctorDashboard } from "../../hooks/Usedoctordashboard";

/*
  Same hook, same fields, same single navigation as before - only the layout and
  tokens changed. Data lives in React Query's cache under this hook's queryKey,
  so re-mounting renders instantly from cache with no spinner.
*/

const DoctorCards = () => {
  const navigate = useNavigate();

  const { data: dashboard, isLoading, isError, error } = useDoctorDashboard();

  const stats = [
    {
      title: "Today's Appointments",
      value: dashboard?.totalAppointments,
      icon: CalendarDays,
      tone: "text-primary",
      route: "/doctor-dashboard/appointments",
    },
    {
      title: "Confirmed",
      value: dashboard?.confirmedAppointments,
      icon: ShieldCheck,
      tone: "text-secondary",
    },
    {
      title: "Pending",
      value: dashboard?.pendingAppointments,
      icon: Clock3,
      tone: "text-warning",
    },
    {
      title: "Today's Completed",
      value: dashboard?.todayCompletedAppointments,
      icon: CheckCircle2,
      tone: "text-tertiary",
    },
  ];

  // Only true on the very first fetch when there's no cached data at all.
  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)]">
        <div className="h-44 animate-pulse rounded-card bg-surface-container" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-card bg-surface-container" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-card border border-error/40 bg-error-container px-4 py-3 text-body-md text-on-error-container">
        {error?.response?.data?.message || "Something went wrong"}
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)]">
      {/* Lead panel - lifetime completions plus the two patient counts */}
      <section className="rounded-card border border-outline-variant bg-surface-lowest p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-label-caps uppercase text-on-surface-variant">
              Completed appointments
            </p>
            <p className="mt-2 font-display text-hero text-on-surface tabular">
              {dashboard?.completedAppointments ?? "—"}
            </p>
          </div>
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-control bg-primary text-on-primary">
            <CheckCircle2 size={22} />
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-control border border-outline-variant bg-surface-container px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-label-md text-on-surface-variant">
              <UserPlus size={14} /> New patients
            </p>
            <p className="mt-1 font-display text-headline-sm text-on-surface tabular">
              {dashboard?.todayNewPatients ?? "—"}
            </p>
          </div>

          <div className="rounded-control border border-outline-variant bg-surface-container px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-label-md text-on-surface-variant">
              <Users size={14} /> Unique patients
            </p>
            <p className="mt-1 font-display text-headline-sm text-on-surface tabular">
              {dashboard?.totalPatients ?? "—"}
            </p>
          </div>
        </div>
      </section>

      {/* Metric tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex flex-col justify-between rounded-card border border-outline-variant bg-surface-lowest p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-label-caps uppercase text-on-surface-variant">{item.title}</p>
                  <p className="mt-2 font-display text-headline-lg text-on-surface tabular">
                    {item.value ?? "—"}
                  </p>
                </div>
                <Icon size={20} className={`flex-none ${item.tone}`} />
              </div>

              {item.route && (
                <button
                  onClick={() => navigate(item.route)}
                  className="mt-3 inline-flex items-center gap-1.5 self-start text-label-md font-medium text-primary transition hover:gap-2.5"
                >
                  View details
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DoctorCards;
