import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Calendar,
  ExternalLink,
  FileText,
  Pill,
  Stethoscope,
} from "lucide-react";
import { getPatientHistory } from "../../api/backend";
import PageHeader from "../../components/layout/PageHeader";

/*
  Reports + prescriptions timeline for one patient.
  GET /doctors/patient-history/:id, same fetch, same guards, same fields.
*/

const PatientHistory = () => {
  const { id } = useParams();

  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatientHistory = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("Fetching history for patient:", id);

        const response = await getPatientHistory(id);

        console.log("Patient History:", response.data);

        if (response.data.success) {
          setHistory(response.data);
        } else {
          setError(response.data.message || "Failed to fetch patient history");
        }
      } catch (err) {
        console.error("Patient history error:", err);

        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to fetch patient history"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPatientHistory();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-16 w-72 animate-pulse rounded-card bg-surface-container" />
        <div className="h-24 animate-pulse rounded-card bg-surface-container" />
        <div className="h-64 animate-pulse rounded-card bg-surface-container" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-card border border-error/40 bg-error-container px-4 py-3 text-body-md text-on-error-container">
        {error}
      </div>
    );
  }

  if (!history) {
    return (
      <p className="text-body-md text-on-surface-variant">No patient history found.</p>
    );
  }

  const { reports = [], prescriptions = [] } = history;

  const chip = "inline-flex items-center rounded-pill px-2.5 py-1 text-label-md font-medium";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Doctor portal"
        title="Patient History"
        description="Everything filed against this patient: uploaded reports and past prescriptions."
      />

      {/* Counts */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-card border border-outline-variant bg-surface-lowest px-5 py-4">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-control bg-secondary-container text-on-secondary-container">
            <FileText size={20} />
          </span>
          <div>
            <p className="text-label-caps uppercase text-on-surface-variant">Medical reports</p>
            <p className="mt-1 font-display text-headline-md text-on-surface tabular">
              {reports.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-card border border-outline-variant bg-surface-lowest px-5 py-4">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-control bg-primary-container/20 text-primary">
            <Pill size={20} />
          </span>
          <div>
            <p className="text-label-caps uppercase text-on-surface-variant">Prescriptions</p>
            <p className="mt-1 font-display text-headline-md text-on-surface tabular">
              {prescriptions.length}
            </p>
          </div>
        </div>
      </div>

      {/* REPORTS */}
      <section>
        <h2 className="flex items-center gap-2 font-display text-headline-sm text-on-surface">
          <FileText size={18} className="text-secondary" />
          Medical reports
        </h2>

        {reports.length === 0 ? (
          <div className="mt-4 rounded-card border border-dashed border-outline-variant bg-surface-lowest px-6 py-10 text-center text-body-md text-on-surface-variant">
            No medical reports available.
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {reports.map((report) => (
              <article
                key={report._id}
                className="flex flex-col rounded-card border border-outline-variant bg-surface-lowest p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 flex-none items-center justify-center rounded-control bg-secondary-container text-on-secondary-container">
                      <FileText size={20} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-title-card text-on-surface">
                        {report.title}
                      </h3>
                      <p className="text-body-sm text-on-surface-variant">{report.type}</p>
                    </div>
                  </div>

                  <span className={`${chip} flex-none bg-surface-high text-on-surface-variant`}>
                    {report.fileType}
                  </span>
                </div>

                <dl className="mt-4 flex flex-col gap-1 text-body-sm">
                  <div className="flex gap-1.5">
                    <dt className="text-on-surface-variant">Uploaded by:</dt>
                    <dd className="font-medium text-on-surface">{report.uploadedBy}</dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt className="text-on-surface-variant">Date:</dt>
                    <dd className="font-medium text-on-surface tabular">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>

                <a
                  href={report.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-fit items-center gap-2 rounded-control bg-primary px-4 py-2 text-body-sm font-semibold text-on-primary transition hover:brightness-110"
                >
                  View report
                  <ExternalLink size={15} />
                </a>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* PRESCRIPTIONS */}
      <section>
        <h2 className="flex items-center gap-2 font-display text-headline-sm text-on-surface">
          <Pill size={18} className="text-primary" />
          Prescriptions
        </h2>

        {prescriptions.length === 0 ? (
          <div className="mt-4 rounded-card border border-dashed border-outline-variant bg-surface-lowest px-6 py-10 text-center text-body-md text-on-surface-variant">
            No prescriptions available.
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-5">
            {prescriptions.map((prescription) => (
              <article
                key={prescription._id}
                className="overflow-hidden rounded-card border border-outline-variant bg-surface-lowest"
              >
                {/* Header */}
                <div className="flex flex-col justify-between gap-3 border-b border-outline-variant px-5 py-4 md:flex-row md:items-center">
                  <div>
                    <h3 className="font-display text-headline-sm text-on-surface">
                      Prescription
                    </h3>

                    <div className="mt-1 flex flex-wrap gap-4 text-body-sm text-on-surface-variant">
                      <span className="flex items-center gap-1.5 tabular">
                        <Calendar size={14} />
                        {new Date(prescription.createdAt).toLocaleDateString()}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Stethoscope size={14} />
                        Doctor
                      </span>
                    </div>
                  </div>

                  <span className={`${chip} bg-primary-container/20 text-primary`}>
                    Prescription
                  </span>
                </div>

                <div className="flex flex-col gap-5 p-5">
                  {/* Complaints + diagnosis */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-control border border-outline-variant bg-surface-container p-4">
                      <h4 className="text-label-caps uppercase text-on-surface-variant">
                        Complaints
                      </h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {prescription.complaints?.map((complaint, index) => (
                          <span
                            key={index}
                            className={`${chip} bg-error-container text-on-error-container`}
                          >
                            {complaint}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-control border border-outline-variant bg-surface-container p-4">
                      <h4 className="text-label-caps uppercase text-on-surface-variant">
                        Diagnosis
                      </h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {prescription.diagnosis?.map((diagnosis, index) => (
                          <span
                            key={index}
                            className={`${chip} bg-tertiary-container text-on-tertiary-container`}
                          >
                            {diagnosis}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Medicines */}
                  <div>
                    <h4 className="text-label-caps uppercase text-on-surface-variant">
                      Medicines
                    </h4>

                    <div className="mt-2 overflow-x-auto rounded-control border border-outline-variant">
                      <table className="w-full min-w-[640px] border-collapse text-left">
                        <thead>
                          <tr className="bg-surface-container">
                            {["Medicine", "Dosage", "Frequency", "Duration", "Instructions"].map(
                              (head) => (
                                <th
                                  key={head}
                                  className="border-b border-outline-variant px-3 py-2 text-label-caps uppercase text-on-surface-variant"
                                >
                                  {head}
                                </th>
                              )
                            )}
                          </tr>
                        </thead>

                        <tbody>
                          {prescription.medicines?.map((medicine, index) => (
                            <tr
                              key={medicine._id || index}
                              className="border-b border-outline-variant/70 last:border-0"
                            >
                              <td className="px-3 py-2.5 text-body-md font-medium text-on-surface">
                                {medicine.name}
                              </td>
                              <td className="px-3 py-2.5 text-body-md text-on-surface-variant">
                                {medicine.dosage}
                              </td>
                              <td className="px-3 py-2.5 text-body-md text-on-surface-variant">
                                {medicine.frequency}
                              </td>
                              <td className="px-3 py-2.5 text-body-md text-on-surface-variant">
                                {medicine.duration}
                              </td>
                              <td className="px-3 py-2.5 text-body-md text-on-surface-variant">
                                {medicine.instructions}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Tests */}
                  <div>
                    <h4 className="text-label-caps uppercase text-on-surface-variant">Tests</h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {prescription.tests?.map((test, index) => (
                        <span
                          key={index}
                          className={`${chip} bg-warning-container text-on-warning-container`}
                        >
                          {test}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Advice */}
                  {prescription.advice && (
                    <div className="rounded-control border border-outline-variant bg-primary-container/10 p-4">
                      <h4 className="text-label-caps uppercase text-primary">Advice</h4>
                      <p className="mt-1 text-body-md text-on-surface">{prescription.advice}</p>
                    </div>
                  )}

                  {/* Follow-up */}
                  {prescription.followUpDate && (
                    <div className="flex items-center gap-2 text-body-md text-on-surface-variant">
                      <Calendar size={16} />
                      <span className="font-medium text-on-surface">Follow-up:</span>
                      <span className="tabular">
                        {new Date(prescription.followUpDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PatientHistory;
