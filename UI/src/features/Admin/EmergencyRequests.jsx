import { useState } from "react";
import {
  Ambulance,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  Phone,
  Siren,
  XCircle,
} from "lucide-react";
import useHospitalEmergencies from "../../hooks/useHospitalEmergencies";
import useUpdateEmergencyStatus from "../../hooks/useUpdateEmergencyStatus";

/*
  The hospital's ambulance dispatch queue.

  Until this page existed an emergency was only ever a transient socket alert
  in the notification bell - the PATCH /api/emergency/:id/status endpoint was
  implemented and reachable but nothing called it, so every request sat at
  REQUESTED forever.

  The transition map below mirrors Backend/config/emergencyStatus.js. The
  server is authoritative and rejects an illegal step with a 400; this copy
  only decides which button to draw, so if the two ever drift the worst case is
  a button that fails loudly rather than a bad write.
*/

const NEXT_STEP = {
  REQUESTED: { status: "ACKNOWLEDGED", label: "Acknowledge" },
  ACKNOWLEDGED: { status: "AMBULANCE_ASSIGNED", label: "Assign ambulance" },
  AMBULANCE_ASSIGNED: { status: "ON_THE_WAY", label: "Mark on the way" },
  ON_THE_WAY: { status: "ARRIVED", label: "Mark arrived" },
  ARRIVED: { status: "PATIENT_PICKED", label: "Patient picked up" },
  PATIENT_PICKED: { status: "COMPLETED", label: "Complete" },
  COMPLETED: null,
  CANCELLED: null,
};

const STATUS_STYLE = {
  REQUESTED:
    "bg-red-100 text-red-700 border-red-400 dark:bg-red-500/20 dark:text-red-300",
  ACKNOWLEDGED:
    "bg-amber-100 text-amber-700 border-amber-400 dark:bg-amber-500/20 dark:text-amber-300",
  AMBULANCE_ASSIGNED:
    "bg-blue-100 text-blue-700 border-blue-400 dark:bg-blue-500/20 dark:text-blue-300",
  ON_THE_WAY:
    "bg-indigo-100 text-indigo-700 border-indigo-400 dark:bg-indigo-500/20 dark:text-indigo-300",
  ARRIVED:
    "bg-cyan-100 text-cyan-700 border-cyan-400 dark:bg-cyan-500/20 dark:text-cyan-300",
  PATIENT_PICKED:
    "bg-violet-100 text-violet-700 border-violet-400 dark:bg-violet-500/20 dark:text-violet-300",
  COMPLETED:
    "bg-emerald-100 text-emerald-700 border-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-300",
  CANCELLED:
    "bg-gray-100 text-gray-600 border-gray-400 dark:bg-slate-800 dark:text-slate-400",
};

const readableStatus = (status) => (status || "").split("_").join(" ");

/* How long the patient has been waiting - the triage signal on this screen. */
const waitedFor = (createdAt) => {
  if (!createdAt) return null;

  const minutes = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 60000
  );

  if (minutes < 1) return "just now";
  if (minutes < 60) return minutes + " min ago";

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + "h " + (minutes % 60) + "m ago";

  return Math.floor(hours / 24) + "d ago";
};

/*
  Collected only for the AMBULANCE_ASSIGNED step, which the server refuses
  without all three fields.
*/
const AmbulanceForm = ({ onSubmit, onCancel, pending }) => {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");

  const complete =
    vehicleNumber.trim() && driverName.trim() && driverPhone.trim();

  const inputClass =
    "w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none";

  return (
    <div className="mt-4 rounded-xl border border-blue-300 dark:border-blue-500/40 bg-blue-50 dark:bg-blue-500/10 p-4">
      <p className="mb-3 text-sm font-semibold text-blue-800 dark:text-blue-300">
        Ambulance details
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <input
          className={inputClass}
          placeholder="Vehicle number"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
        />

        <input
          className={inputClass}
          placeholder="Driver name"
          value={driverName}
          onChange={(e) => setDriverName(e.target.value)}
        />

        <input
          className={inputClass}
          placeholder="Driver phone"
          value={driverPhone}
          onChange={(e) => setDriverPhone(e.target.value)}
        />
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={!complete || pending}
          onClick={() =>
            onSubmit({
              vehicleNumber: vehicleNumber.trim(),
              driverName: driverName.trim(),
              driverPhone: driverPhone.trim(),
            })
          }
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Dispatching..." : "Dispatch ambulance"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 dark:border-slate-700 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const EmergencyCard = ({ emergency, onAdvance, pendingId, error }) => {
  const [assigning, setAssigning] = useState(false);

  const next = NEXT_STEP[emergency.status];
  const pending = pendingId === emergency._id;

  // GeoJSON is [lng, lat]; every map link wants lat,lng.
  const coordinates = emergency.location?.coordinates ?? [];
  const lng = coordinates[0];
  const lat = coordinates[1];

  const handleClick = () => {
    if (next.status === "AMBULANCE_ASSIGNED") {
      setAssigning(true);
      return;
    }

    onAdvance(emergency._id, next.status);
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 p-5 shadow-sm">
      {/* Header: who, and how long they have waited */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
            <Siren size={22} className="text-red-600 dark:text-red-400" />
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {emergency.patient?.name || "Unknown patient"}
            </h3>

            <p className="text-sm text-gray-500 dark:text-slate-400">
              {readableStatus(emergency.reason)}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={
              "rounded-full border px-3 py-1 text-xs font-medium " +
              (STATUS_STYLE[emergency.status] || STATUS_STYLE.CANCELLED)
            }
          >
            {readableStatus(emergency.status)}
          </span>

          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={13} />
            {waitedFor(emergency.createdAt)}
          </span>
        </div>
      </div>

      {/* Patient's own words */}
      {emergency.message && (
        <p className="mt-4 rounded-lg bg-gray-50 dark:bg-slate-800/60 px-3 py-2 text-sm text-gray-700 dark:text-slate-300">
          {emergency.message}
        </p>
      )}

      {/* Contact + pickup location */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        {emergency.patient?.phone_number && (
          <a
            href={"tel:" + emergency.patient.phone_number}
            className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Phone size={15} />
            {emergency.patient.phone_number}
          </a>
        )}

        {lat !== undefined && lng !== undefined && (
          <a
            href={
              "https://www.google.com/maps/search/?api=1&query=" +
              lat +
              "," +
              lng
            }
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <MapPin size={15} />
            Open pickup location
          </a>
        )}
      </div>

      {/* Crew, once one has been dispatched */}
      {emergency.ambulance?.vehicleNumber && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 dark:border-slate-700 px-3 py-2 text-sm text-gray-700 dark:text-slate-300">
          <Ambulance size={16} className="text-blue-600 dark:text-blue-400" />

          <span className="font-medium">
            {emergency.ambulance.vehicleNumber}
          </span>
          <span className="text-gray-400">·</span>
          <span>{emergency.ambulance.driverName}</span>
          <span className="text-gray-400">·</span>
          <span>{emergency.ambulance.driverPhone}</span>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* The one legal next step, or nothing for a closed request */}
      {next && !assigning && (
        <button
          type="button"
          onClick={handleClick}
          disabled={pending}
          className="mt-4 flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Updating..." : next.label}
          <ChevronRight size={16} />
        </button>
      )}

      {assigning && (
        <AmbulanceForm
          pending={pending}
          onCancel={() => setAssigning(false)}
          onSubmit={(ambulance) =>
            onAdvance(emergency._id, "AMBULANCE_ASSIGNED", ambulance, () =>
              setAssigning(false)
            )
          }
        />
      )}
    </div>
  );
};

const EmergencyRequests = () => {
  const [scope, setScope] = useState("active");

  const {
    data,
    isLoading,
    isError,
    error: queryError,
  } = useHospitalEmergencies(scope);

  const mutation = useUpdateEmergencyStatus();

  // Only the row that is mid-request should show a spinner, so the id is
  // tracked rather than leaning on the mutation's global isPending.
  const [pendingId, setPendingId] = useState(null);
  const [rowError, setRowError] = useState({});

  const emergencies = data?.emergencies ?? [];
  const activeCount = data?.activeCount ?? 0;

  const handleAdvance = (emergencyId, status, ambulance, onDone) => {
    setPendingId(emergencyId);
    setRowError((prev) => ({ ...prev, [emergencyId]: null }));

    mutation.mutate(
      { emergencyId, status, ambulance },
      {
        onSuccess: () => {
          setPendingId(null);
          if (onDone) onDone();
        },

        onError: (err) => {
          setPendingId(null);

          setRowError((prev) => ({
            ...prev,
            [emergencyId]:
              err?.response?.data?.message ||
              "Could not update this request. Please try again.",
          }));
        },
      }
    );
  };

  const tabClass = (value) =>
    "rounded-lg px-4 py-2 text-sm font-medium transition " +
    (scope === value
      ? "bg-red-600 text-white"
      : "bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
              <Siren size={24} className="text-red-600 dark:text-red-400" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Emergency requests
              </h1>

              <p className="text-sm text-gray-500 dark:text-slate-400">
                {activeCount} active{" "}
                {activeCount === 1 ? "request" : "requests"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className={tabClass("active")}
              onClick={() => setScope("active")}
            >
              Active queue
            </button>

            <button
              type="button"
              className={tabClass("history")}
              onClick={() => setScope("history")}
            >
              History
            </button>
          </div>
        </div>

        {isLoading && (
          <p className="py-10 text-center text-gray-500 dark:text-slate-400">
            Loading requests...
          </p>
        )}

        {isError && (
          <div className="rounded-xl border border-red-200 dark:border-red-500/40 bg-red-50 dark:bg-red-500/10 p-5 text-center">
            <XCircle
              size={28}
              className="mx-auto mb-2 text-red-600 dark:text-red-400"
            />

            <p className="text-sm text-red-700 dark:text-red-300">
              {queryError?.response?.data?.message ||
                "Could not load emergency requests."}
            </p>
          </div>
        )}

        {!isLoading && !isError && emergencies.length === 0 && (
          <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center">
            <CheckCircle2 size={40} className="mx-auto mb-3 text-emerald-500" />

            <h2 className="text-lg font-medium text-gray-700 dark:text-white">
              {scope === "active"
                ? "No active emergencies"
                : "Nothing in history yet"}
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              {scope === "active"
                ? "New requests appear here the moment a patient raises one."
                : "Completed and cancelled requests will be listed here."}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {emergencies.map((emergency) => (
            <EmergencyCard
              key={emergency._id}
              emergency={emergency}
              onAdvance={handleAdvance}
              pendingId={pendingId}
              error={rowError[emergency._id]}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmergencyRequests;
