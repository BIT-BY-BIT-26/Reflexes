import { Eye } from "lucide-react";

/*
  One waiting patient. Presentational, as before - the View button carries no
  handler in the current UI and is left inert here on purpose.
*/

const QueueItem = ({ appointment, token }) => {
  const patient = appointment.patient.userId;

  return (
    <li className="grid grid-cols-2 items-center gap-3 border-b border-outline-variant/70 px-5 py-3 transition last:border-b-0 hover:bg-surface-container sm:grid-cols-12">
      {/* Token */}
      <div className="sm:col-span-2">
        <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-control bg-primary-container/20 px-2 text-body-md font-semibold text-primary tabular">
          #{token}
        </span>
      </div>

      {/* Patient */}
      <div className="order-3 col-span-2 min-w-0 sm:order-none sm:col-span-5">
        <p className="truncate text-body-md font-medium text-on-surface">{patient.name}</p>
        <p className="truncate text-body-sm text-on-surface-variant">{patient.email}</p>
      </div>

      {/* Slot time */}
      <div className="text-body-md text-on-surface-variant tabular sm:col-span-2">
        {new Date(appointment.slotDate).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>

      {/* Status */}
      <div className="sm:col-span-2">
        <span className="inline-flex items-center rounded-pill bg-warning-container px-2.5 py-1 text-label-md font-medium text-on-warning-container">
          Waiting
        </span>
      </div>

      {/* Action */}
      <div className="flex justify-end sm:col-span-1">
        <button className="inline-flex items-center gap-1.5 rounded-control border border-outline-variant px-2.5 py-1.5 text-label-md font-medium text-on-surface-variant transition hover:bg-surface-high hover:text-on-surface">
          <Eye size={14} />
          <span className="hidden lg:inline">View</span>
        </button>
      </div>
    </li>
  );
};

export default QueueItem;
