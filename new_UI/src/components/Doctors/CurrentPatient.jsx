import { CheckCircle2, Clock3, Eye, PhoneCall, Pill, User, UserRound } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// ⭐ redux se completeAppointment import hata diya — parent (onComplete prop) API call handle karega

/*
  The live consultation panel. Props and actions are unchanged:
  onComplete(appointment._id), onCallNext, and the two navigations - including
  the ?appointmentId= query param the prescription screen submits against.

  onSkip is still received and still has no button here, exactly as before.
*/

const CurrentPatient = ({ appointment, onComplete, onSkip, onCallNext }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!appointment) {
    return (
      <section className="flex flex-col items-center justify-center rounded-card border border-dashed border-outline-variant bg-surface-lowest px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-surface-container text-on-surface-variant">
          <UserRound size={26} />
        </span>
        <h2 className="mt-4 font-display text-headline-sm text-on-surface">
          No patient in consultation
        </h2>
        <p className="mt-1 max-w-xs text-body-md text-on-surface-variant">
          Start a consultation to pull the lowest confirmed token into the room.
        </p>
      </section>
    );
  }

  const patient = appointment.patient?.userId;

  const runAction = async (fn) => {
    try {
      setLoading(true);
      await fn();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const primaryBtn =
    "inline-flex items-center justify-center gap-2 rounded-control bg-primary px-4 py-3 text-body-md font-semibold text-on-primary transition hover:brightness-110 disabled:opacity-50";
  const secondaryBtn =
    "inline-flex items-center justify-center gap-2 rounded-control border border-outline-variant bg-surface-lowest px-4 py-3 text-body-md font-medium text-on-surface transition hover:bg-surface-container disabled:opacity-50";

  return (
    <section className="overflow-hidden rounded-card border border-outline-variant bg-surface-lowest">
      {/* Live strip */}
      <div className="flex items-center justify-between gap-3 border-b border-outline-variant bg-primary-container/10 px-5 py-3">
        <span className="flex items-center gap-2 text-label-caps uppercase text-primary">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-pill bg-primary opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-pill bg-primary" />
          </span>
          In consultation
        </span>
        <span className="rounded-pill bg-primary px-3 py-1 text-label-md font-semibold text-on-primary tabular">
          Token #{appointment.token}
        </span>
      </div>

      <div className="p-5">
        {/* Patient identity */}
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 flex-none items-center justify-center rounded-pill bg-secondary-container text-on-secondary-container">
            <User size={26} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate font-display text-headline-md text-on-surface">
              {patient?.name || "Unknown"}
            </h2>
            <p className="truncate text-body-md text-on-surface-variant">{patient?.email || ""}</p>
          </div>
        </div>

        {/* Meta */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-control border border-outline-variant bg-surface-container px-3 py-2.5">
            <p className="text-label-caps uppercase text-on-surface-variant">Started at</p>
            <p className="mt-1 flex items-center gap-1.5 text-body-lg font-medium text-on-surface tabular">
              <Clock3 size={16} />
              {appointment.consultationStartedAt
                ? new Date(appointment.consultationStartedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </p>
          </div>

          <div className="rounded-control border border-outline-variant bg-surface-container px-3 py-2.5">
            <p className="text-label-caps uppercase text-on-surface-variant">Status</p>
            <p className="mt-1 text-body-lg font-medium text-primary">Consultation running</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button
            onClick={() => runAction(() => onComplete(appointment._id))}
            disabled={loading}
            className={primaryBtn}
          >
            <CheckCircle2 size={17} /> Complete Appointment
          </button>

          <button
            onClick={() => navigate(`/doctor-dashboard/patients/${appointment.patient._id}`)}
            className={secondaryBtn}
          >
            <Eye size={17} /> See Profile
          </button>

          <button
            onClick={() =>
              navigate(
                `/doctor-dashboard/patients/${appointment.patient._id}/prescription?appointmentId=${appointment._id}`
              )
            }
            disabled={loading}
            className={secondaryBtn}
          >
            <Pill size={17} /> Add Prescription
          </button>

          <button
            onClick={() => runAction(onCallNext)}
            disabled={loading}
            className={secondaryBtn}
          >
            <PhoneCall size={17} /> Call Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default CurrentPatient;
