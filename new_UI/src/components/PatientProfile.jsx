import React, { useEffect, useState } from "react";
import {
  Calendar,
  Droplets,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { getPatientProfile } from "../api/backend";

/*
  Shared patient identity card - rendered by both PatientProfileDoctor and
  PatientProfileAdmin. Fetch, field mapping, formatDate and the loading/error/
  null branches are unchanged; only the presentation moved onto the design
  tokens. (The ~840 lines of commented-out earlier markup that preceded this
  component were dropped - they carried no behaviour.)
*/

const PatientProfile = () => {
  const { id } = useParams();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          setError("Patient ID not found");
          return;
        }

        const res = await getPatientProfile(id);

        console.log("Patient profile response:", res.data);

        if (res.data.success) {
          setPatient(res.data.patient);
        } else {
          setError(res.data.message || "Failed to fetch patient profile");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);

        setError(err.response?.data?.message || "Failed to load patient profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "Not provided";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // ---------------- LOADING ----------------

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-28 animate-pulse rounded-card bg-surface-container" />
        <div className="h-40 animate-pulse rounded-card bg-surface-container" />
      </div>
    );
  }

  // ---------------- ERROR ----------------

  if (error) {
    return (
      <div className="rounded-card border border-error/40 bg-error-container px-4 py-3 text-body-md text-on-error-container">
        {error}
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-card border border-outline-variant bg-surface-lowest">
      {/* Identity */}
      <div className="flex flex-col gap-5 border-b border-outline-variant bg-primary-container/10 px-6 py-6 sm:flex-row sm:items-center">
        <div className="flex h-24 w-24 flex-none items-center justify-center overflow-hidden rounded-pill border border-outline-variant bg-surface-container">
          {patient.profileImage ? (
            <img
              src={patient.profileImage}
              alt={patient.name || "Patient"}
              className="h-full w-full object-cover"
            />
          ) : (
            <User size={44} className="text-on-surface-variant" />
          )}
        </div>

        <div className="min-w-0">
          <p className="text-label-caps uppercase text-primary">Patient record</p>
          <h2 className="mt-1 font-display text-headline-lg capitalize text-on-surface">
            {patient.name || "Unknown Patient"}
          </h2>
          <p className="mt-2 flex items-center gap-2 text-body-md text-on-surface-variant">
            <Mail size={16} />
            <span className="truncate">{patient.email || "No email"}</span>
          </p>
        </div>
      </div>

      {/* Personal information */}
      <div className="px-6 py-6">
        <h3 className="font-display text-headline-sm text-on-surface">
          Personal information
        </h3>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoItem
            icon={<Calendar size={18} />}
            label="Date of birth"
            value={formatDate(patient.dob)}
          />

          <InfoItem
            icon={<User size={18} />}
            label="Gender"
            value={patient.gender || "Not provided"}
          />

          <InfoItem
            icon={<Droplets size={18} />}
            label="Blood group"
            value={patient.bloodGroup || "Not provided"}
          />

          <InfoItem
            icon={<Phone size={18} />}
            label="Phone number"
            value={patient.phone_number || "Not provided"}
          />
        </div>
      </div>

      {/* Address */}
      <div className="px-6 pb-6">
        <h3 className="font-display text-headline-sm text-on-surface">Address</h3>

        <div className="mt-4 flex gap-4 rounded-card border border-outline-variant bg-surface-container px-4 py-4">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-control bg-secondary-container text-on-secondary-container">
            <MapPin size={18} />
          </span>

          <div className="min-w-0">
            <p className="text-body-md font-medium text-on-surface">
              {patient.address?.line || "Address not provided"}
            </p>

            {(patient.address?.city || patient.address?.state) && (
              <p className="mt-1 text-body-md text-on-surface-variant">
                {patient.address?.city}
                {patient.address?.city && patient.address?.state ? ", " : ""}
                {patient.address?.state}
              </p>
            )}

            <p className="mt-1 text-body-sm text-on-surface-variant">
              Pincode: {patient.address?.pincode || "Not provided"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* Reusable label/value row */
const InfoItem = ({ icon, label, value }) => {
  return (
    <div className="flex items-center gap-3 rounded-card border border-outline-variant bg-surface-container px-4 py-3">
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-control bg-primary-container/20 text-primary">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-label-caps uppercase text-on-surface-variant">{label}</p>
        <p className="mt-0.5 break-words text-body-md font-medium text-on-surface">{value}</p>
      </div>
    </div>
  );
};

export default PatientProfile;
