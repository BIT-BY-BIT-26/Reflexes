import { useEffect, useState } from "react";
import {
  Building2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getHospitalProfile } from "../../api/backend";
import PageHeader from "../layout/PageHeader";

/*
  Hospital profile overview. Same GET /profile fetch and the same fields.

  The "Edit Profile" button had no handler before; it now navigates to the
  existing /hospital-dashboard/profile editor - the only behavioural addition on
  this screen.
*/

export default function Profile() {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getHospitalProfile();

      setHospital(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-16 w-80 animate-pulse rounded-card bg-surface-container" />
        <div className="h-72 animate-pulse rounded-card bg-surface-container" />
      </div>
    );
  }

  if (!hospital) {
    return (
      <p className="text-body-md text-on-surface-variant">
        Hospital profile could not be loaded.
      </p>
    );
  }

  const card = "rounded-card border border-outline-variant bg-surface-lowest p-5";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Hospital admin"
        title="Hospital Profile"
        description="How this hospital appears to patients booking an appointment."
      >
        <button
          onClick={() => navigate("/hospital-dashboard/profile")}
          className="rounded-control border border-outline-variant px-4 py-2.5 text-body-md font-medium text-on-surface transition hover:bg-surface-container"
        >
          Edit profile
        </button>
      </PageHeader>

      {/* Identity */}
      <section className="overflow-hidden rounded-card border border-outline-variant bg-surface-lowest">
        {hospital.coverImage && (
          <img
            src={hospital.coverImage}
            alt=""
            className="h-56 w-full object-cover md:h-72"
          />
        )}

        <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center">
          {hospital.logo && (
            <img
              src={hospital.logo}
              alt=""
              className="h-16 w-16 flex-none rounded-card border border-outline-variant bg-surface-lowest object-cover"
            />
          )}

          <div className="min-w-0 flex-1">
            <h2 className="flex items-center gap-2 font-display text-headline-md text-on-surface">
              <span className="truncate">{hospital.name}</span>
              <ShieldCheck size={20} className="flex-none text-primary" />
            </h2>

            {hospital.description && (
              <p className="mt-1 text-body-md text-on-surface-variant">
                {hospital.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Details */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Address */}
        <div className={card}>
          <h3 className="flex items-center gap-2 font-display text-title-card text-on-surface">
            <MapPin size={17} className="text-primary" />
            Address
          </h3>
          <p className="mt-3 text-body-md text-on-surface-variant">{hospital.address}</p>
        </div>

        {/* Contact */}
        <div className={card}>
          <h3 className="flex items-center gap-2 font-display text-title-card text-on-surface">
            <Phone size={17} className="text-primary" />
            Contact information
          </h3>

          <dl className="mt-3 flex flex-col gap-3">
            <div>
              <dt className="text-label-caps uppercase text-on-surface-variant">Phone number</dt>
              <dd className="mt-0.5 text-body-md font-medium text-on-surface tabular">
                {hospital.phone_number}
              </dd>
            </div>

            <div>
              <dt className="text-label-caps uppercase text-on-surface-variant">Email address</dt>
              <dd className="mt-0.5 flex items-center gap-2 break-all text-body-md font-medium text-on-surface">
                <Mail size={14} className="flex-none text-on-surface-variant" />
                {hospital.email}
              </dd>
            </div>
          </dl>
        </div>

        {/* Working hours */}
        <div className={card}>
          <h3 className="flex items-center gap-2 font-display text-title-card text-on-surface">
            <Clock3 size={17} className="text-primary" />
            Working hours
          </h3>

          <dl className="mt-3 flex flex-col">
            {Object.entries(hospital.timings || {}).map(([day, time]) => (
              <div
                key={day}
                className="flex justify-between gap-4 border-b border-outline-variant/70 py-2 last:border-b-0"
              >
                <dt className="text-body-md capitalize text-on-surface-variant">{day}</dt>
                <dd className="text-body-md font-medium text-on-surface tabular">{time}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Facilities */}
        <div className={card}>
          <h3 className="flex items-center gap-2 font-display text-title-card text-on-surface">
            <Building2 size={17} className="text-primary" />
            Facilities
          </h3>

          <div className="mt-3 flex flex-wrap gap-2">
            {hospital.facilities?.map((facility, index) => (
              <span
                key={index}
                className="rounded-pill bg-secondary-container px-3 py-1 text-label-md font-medium text-on-secondary-container"
              >
                {facility}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery */}
      {hospital.galleryImages?.length > 0 && (
        <section>
          <h3 className="font-display text-headline-sm text-on-surface">Hospital gallery</h3>

          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {hospital.galleryImages?.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`gallery-${index}`}
                className="h-56 w-80 flex-none rounded-card border border-outline-variant object-cover"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
