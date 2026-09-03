import { Lock, BadgeCheck } from "lucide-react";
import { useState } from "react";
import { lockedFeatures } from "./LockedFeatures";
import CompleteProfileModal from "./CompleteProfileModal";
import PageHeader from "../../components/layout/PageHeader";

/*
  Shown until GET /doctors/profile-status reports profileCompleted. Every button
  opens the same CompleteProfileModal, which on success calls
  refreshDoctorStatus() - that is what swaps this wall for the OPD console.

  (The old file also declared an unused fetchDoctorStatus() that referenced
  setters which do not exist in this component; it was never called and is not
  carried over.)
*/

export default function AccessFeatures({ refreshDoctorStatus, onClose }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="Doctor portal"
          title="Finish setup to open your OPD"
          description="Your clinical profile is what links you to a department, a consultation fee and the appointment queue. These features stay locked until it is complete."
        />

        {/* Callout */}
        <div className="flex flex-col gap-4 rounded-card border border-outline-variant bg-primary-container/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-control bg-primary text-on-primary">
              <BadgeCheck size={20} />
            </span>
            <div>
              <h2 className="font-display text-title-card text-on-surface">
                Complete your profile
              </h2>
              <p className="mt-0.5 max-w-xl text-body-md text-on-surface-variant">
                Add your specialisation, experience and consultation fee so patients know who they
                are booking.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex-none rounded-control bg-primary px-5 py-2.5 text-body-md font-semibold text-on-primary transition hover:brightness-110"
          >
            Complete your profile
          </button>
        </div>

        {/* Locked features */}
        <div className="grid gap-4 md:grid-cols-3">
          {lockedFeatures.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.id}
                className="flex flex-col rounded-card border border-outline-variant bg-surface-lowest p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-control bg-surface-container text-on-surface-variant">
                    <Icon size={20} />
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-pill bg-error-container px-2.5 py-1 text-label-md font-medium text-on-error-container">
                    <Lock size={12} />
                    {card.status}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-headline-sm text-on-surface">
                  {card.title}
                </h3>
                <p className="mt-1 flex-1 text-body-md text-on-surface-variant">
                  {card.description}
                </p>

                <button
                  onClick={() => setShowModal(true)}
                  className="mt-5 w-full rounded-control border border-outline-variant px-4 py-2.5 text-body-md font-medium text-on-surface transition hover:bg-surface-container"
                >
                  {card.buttonText}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <CompleteProfileModal
          refreshDoctorStatus={refreshDoctorStatus}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
