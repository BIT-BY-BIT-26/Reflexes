import { useNavigate } from "react-router-dom";
import { CalendarClock, Mail, Phone, Plus } from "lucide-react";
import { useAllDoctors } from "../../hooks/UseAllDcotors";
import PageHeader from "../../components/layout/PageHeader";

/*
  Staff directory. Same hook and the same single action per card - Schedule OPD
  navigates to /hospital-dashboard/doctor/opd-schedule/:doctorId.
*/

export default function AllDoctor() {
  const navigate = useNavigate();

  // Cached under queryKeys.allDoctors. Leaving this page and coming back
  // reads from cache instantly - isLoading is only true the first time.
  const { data, isLoading, isError, refetch } = useAllDoctors();

  const doctors = data?.doctors ?? [];
  const hospital = data?.hospital;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-card bg-surface-container" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-error/40 bg-error-container px-4 py-3">
        <span className="text-body-md text-on-error-container">Could not load doctors.</span>
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
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Hospital admin"
        title="Staff Directory"
        description={hospital?.name}
      >
        <div className="flex items-center gap-3 rounded-card border border-outline-variant bg-surface-lowest px-4 py-3">
          <span>
            <span className="block text-label-caps uppercase text-on-surface-variant">
              Total doctors
            </span>
            <span className="block font-display text-headline-sm text-on-surface tabular">
              {doctors.length}
            </span>
          </span>
        </div>

        <button
          onClick={() => navigate("/hospital-dashboard/doctors/add")}
          className="inline-flex items-center gap-2 rounded-control bg-primary px-4 py-2.5 text-body-md font-semibold text-on-primary transition hover:brightness-110"
        >
          <Plus size={16} />
          Add doctor
        </button>
      </PageHeader>

      {doctors.length === 0 ? (
        <div className="rounded-card border border-dashed border-outline-variant bg-surface-lowest px-6 py-14 text-center">
          <h2 className="font-display text-headline-sm text-on-surface">No doctors yet</h2>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Add a doctor to start scheduling OPD sessions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doc) => (
            <article
              key={doc._id}
              className="flex flex-col rounded-card border border-outline-variant bg-surface-lowest p-5"
            >
              {/* Identity */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-display text-headline-sm text-on-surface">
                    Dr. {doc.userId?.name}
                  </h2>
                  <p className="truncate text-body-md text-primary">{doc.department?.name}</p>
                </div>

                <span
                  className={`flex-none rounded-pill px-2.5 py-1 text-label-md font-medium ${
                    doc.isActive
                      ? "bg-primary-container/20 text-primary"
                      : "bg-error-container text-on-error-container"
                  }`}
                >
                  {doc.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Contact */}
              <div className="mt-4 flex flex-col gap-1.5 text-body-sm text-on-surface-variant">
                <p className="flex items-center gap-2">
                  <Mail size={14} className="flex-none" />
                  <span className="truncate">{doc.userId?.email}</span>
                </p>
                <p className="flex items-center gap-2 tabular">
                  <Phone size={14} className="flex-none" />
                  <span className="truncate">{doc.userId?.phone_number}</span>
                </p>
              </div>

              {/* Details */}
              <dl className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-label-caps uppercase text-on-surface-variant">Experience</dt>
                  <dd className="mt-0.5 text-body-md font-medium text-on-surface tabular">
                    {doc.experience} yrs
                  </dd>
                </div>

                <div>
                  <dt className="text-label-caps uppercase text-on-surface-variant">Fee</dt>
                  <dd className="mt-0.5 text-body-md font-medium text-on-surface tabular">
                    ₹{doc.consultationFee}
                  </dd>
                </div>

                <div>
                  <dt className="text-label-caps uppercase text-on-surface-variant">Reg no</dt>
                  <dd className="mt-0.5 truncate text-body-md font-medium text-on-surface">
                    {doc.registrationNumber}
                  </dd>
                </div>

                <div>
                  <dt className="text-label-caps uppercase text-on-surface-variant">Created</dt>
                  <dd className="mt-0.5 text-body-md font-medium text-on-surface tabular">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>

              {/* OPD timing */}
              <p className="mt-4 flex items-center gap-2 rounded-control border border-outline-variant bg-surface-container px-3 py-2 text-body-sm text-on-surface-variant">
                <CalendarClock size={14} className="flex-none" />
                <span className="tabular">
                  OPD: {doc.opd_timing?.from || "--"} to {doc.opd_timing?.to || "--"}
                </span>
              </p>

              {/* Available days */}
              {doc.availableDays?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {doc.availableDays?.map((day, i) => (
                    <span
                      key={i}
                      className="rounded-pill bg-secondary-container px-2.5 py-1 text-label-md font-medium capitalize text-on-secondary-container"
                    >
                      {day}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() =>
                  navigate(`/hospital-dashboard/doctor/opd-schedule/${doc._id}`)
                }
                className="mt-5 w-full rounded-control border border-outline-variant px-4 py-2.5 text-body-md font-medium text-on-surface transition hover:bg-surface-container"
              >
                Schedule OPD
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
