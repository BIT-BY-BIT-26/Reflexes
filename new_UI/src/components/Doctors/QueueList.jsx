import { useState } from "react";
import { Hourglass, Search, Users } from "lucide-react";
import QueueItem from "./QueueItem";

/*
  Waiting queue. Same props and the same client-side name filter as before -
  the list itself is fetched by DoctorHome and held in the opd slice.
*/

const QueueList = ({ appointments }) => {
  const [search, setSearch] = useState("");

  const filteredAppointments = appointments.filter((appointment) =>
    appointment.patient?.userId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="flex flex-col overflow-hidden rounded-card border border-outline-variant bg-surface-lowest">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-outline-variant px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-headline-sm text-on-surface">Waiting queue</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-body-sm text-on-surface-variant">
            <Users size={14} />
            <span className="tabular">{appointments.length}</span> confirmed offline
            {appointments.length === 1 ? " patient" : " patients"} waiting
          </p>
        </div>

        <div className="relative w-full lg:w-64">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            placeholder="Search patient…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-control border border-outline-variant bg-surface-container py-2 pl-9 pr-3 text-body-md text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary"
          />
        </div>
      </div>

      {/* Column labels */}
      {filteredAppointments.length > 0 && (
        <div className="hidden grid-cols-12 gap-3 border-b border-outline-variant bg-surface-container px-5 py-2 text-label-caps uppercase text-on-surface-variant sm:grid">
          <span className="col-span-2">Token</span>
          <span className="col-span-5">Patient</span>
          <span className="col-span-2">Slot</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-1 text-right">Action</span>
        </div>
      )}

      {/* Rows */}
      <div className="max-h-[32rem] overflow-y-auto">
        {filteredAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-surface-container text-on-surface-variant">
              <Hourglass size={24} />
            </span>
            <h3 className="mt-4 font-display text-headline-sm text-on-surface">
              {search ? "No match in the queue" : "No patients in queue"}
            </h3>
            <p className="mt-1 max-w-xs text-body-md text-on-surface-variant">
              {search
                ? "No waiting patient matches that name."
                : "There are currently no confirmed offline appointments."}
            </p>
          </div>
        ) : (
          <ul>
            {filteredAppointments.map((appointment) => (
              <QueueItem
                key={appointment._id}
                appointment={appointment}
                token={appointment.token}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default QueueList;
