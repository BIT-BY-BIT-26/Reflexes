import React, { useState } from "react";
import { FilePlus, Upload, X, FileText, History, Share2, Sparkles } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { addPatientReport, getPatientMedicalSummary } from "../../api/backend";
import PatientProfile from "../../components/PatientProfile";
import PageHeader from "../../components/layout/PageHeader";

/*
  Doctor's view of one patient: the shared profile card, the AI medical summary
  (GET /doctors/patient-summary/:id, 90s timeout) and the link to previous
  reports and prescriptions.

  The report-upload state and handlers below are carried over verbatim even
  though this screen never rendered the upload form - only the admin variant
  does. Left in place rather than removed, as agreed.

  The "shared reports and prescription" button has no handler here either, and
  stays inert.
*/

const recorded = (value) => value && value !== "not recorded";

const Section = ({ title, items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-5">
      <h3 className="text-label-caps uppercase text-on-surface-variant">{title}</h3>
      <ul className="mt-2 flex flex-col gap-1">
        {items.map((item, i) => (
          <li key={i} className="text-body-md text-on-surface">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

const PatientProfileAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showReportForm, setShowReportForm] = useState(false);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("LAB");
  const [file, setFile] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    // Optional: only image/pdf
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only JPG, PNG or PDF files are allowed.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const handleUploadReport = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!id) {
      setError("Patient ID not found");
      return;
    }

    if (!title.trim()) {
      setError("Please enter report title");
      return;
    }

    if (!type) {
      setError("Please select report type");
      return;
    }

    if (!file) {
      setError("Please select a report file");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("patientId", id);
      formData.append("title", title);
      formData.append("type", type);
      formData.append("file", file);

      console.log("Uploading report:");
      console.log("patientId:", id);
      console.log("title:", title);
      console.log("type:", type);
      console.log("file:", file);

      const res = await addPatientReport(formData);

      if (res.data.success) {
        setMessage("Report uploaded successfully.");

        // Reset form
        setTitle("");
        setType("LAB");
        setFile(null);

        // file input reset
        document.getElementById("report-file").value = "";

        setShowReportForm(false);
      } else {
        setError(res.data.message || "Failed to upload report");
      }
    } catch (err) {
      console.error("Report upload failed:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Report upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    setSummaryError("");

    try {
      const res = await getPatientMedicalSummary(id);
      setSummary(res.data.summary);
    } catch (err) {
      setSummaryError(
        err.response?.data?.message || "Could not generate the medical summary"
      );
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  };

  const actionBtn =
    "inline-flex items-center gap-2 rounded-control border border-outline-variant bg-surface-lowest px-4 py-2.5 text-body-md font-medium text-on-surface transition hover:bg-surface-container disabled:opacity-50";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Doctor portal"
        title="Patient record"
        description="Identity, an AI recap of everything on file, and the full report and prescription history."
      />

      <PatientProfile />

      {/* Record actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleGenerateSummary}
          disabled={summaryLoading}
          className="inline-flex items-center gap-2 rounded-control bg-primary px-4 py-2.5 text-body-md font-semibold text-on-primary transition hover:brightness-110 disabled:opacity-50"
        >
          <Sparkles size={16} />
          {summaryLoading ? "Generating…" : "See medical summary"}
        </button>

        <button
          onClick={() => navigate(`/doctor-dashboard/patients/${id}/history`)}
          className={actionBtn}
        >
          <History size={16} />
          Previous reports and prescriptions
        </button>

        <button className={actionBtn}>
          <Share2 size={16} />
          Shared reports and prescriptions
        </button>
      </div>

      {summaryLoading && (
        <div className="flex items-center gap-3 rounded-card border border-outline-variant bg-primary-container/10 px-5 py-4">
          <span className="h-5 w-5 animate-spin rounded-pill border-2 border-primary border-t-transparent" />
          <div>
            <p className="text-body-md font-medium text-primary">
              Reading this patient's record…
            </p>
            <p className="mt-0.5 text-body-sm text-on-surface-variant">
              This can take up to a minute the first time.
            </p>
          </div>
        </div>
      )}

      {summaryError && (
        <div className="rounded-card border border-error/40 bg-error-container px-4 py-3 text-body-md text-on-error-container">
          {summaryError}
        </div>
      )}

      {summary && !summaryLoading && (
        <section className="rounded-card border border-outline-variant bg-surface-lowest p-6">
          <div className="flex items-start gap-3 border-b border-outline-variant pb-4">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-control bg-primary text-on-primary">
              <Sparkles size={18} />
            </span>
            <div>
              <h2 className="font-display text-headline-sm text-on-surface">
                Medical summary
              </h2>
              <p className="mt-0.5 text-body-md text-on-surface-variant">
                {summary.patientSnapshot}
              </p>
            </div>
          </div>

          {summary.insufficientRecord && (
            <p className="mt-4 rounded-control bg-warning-container px-4 py-3 text-body-md text-on-warning-container">
              There is very little on file for this patient, so this summary is necessarily
              thin.
            </p>
          )}

          <Section title="Points of attention" items={summary.pointsOfAttention} />

          {summary.activeMedications?.length > 0 && (
            <div className="mt-5">
              <h3 className="text-label-caps uppercase text-on-surface-variant">
                Medicines, as last prescribed
              </h3>
              <ul className="mt-2 flex flex-col gap-1">
                {summary.activeMedications.map((m, i) => (
                  <li key={i} className="text-body-md text-on-surface">
                    {m.name}
                    {recorded(m.dosage) ? ` ${m.dosage}` : ""}
                    {[m.frequency, m.duration, m.instructions]
                      .filter(recorded)
                      .map((part) => `, ${part}`)
                      .join("")}
                    <span className="text-on-surface-variant">
                      {" "}
                      (prescribed {m.lastPrescribedOn})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.visitTimeline?.length > 0 && (
            <div className="mt-5">
              <h3 className="text-label-caps uppercase text-on-surface-variant">Visits</h3>
              <ul className="mt-2 flex flex-col gap-1">
                {summary.visitTimeline.map((v, i) => (
                  <li key={i} className="text-body-md text-on-surface">
                    <span className="text-on-surface-variant tabular">{v.date}</span> —{" "}
                    {v.detail}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Section title="Recurring patterns" items={summary.recurringPatterns} />
          <Section title="Reports on file" items={summary.reportsOnFile} />
          <Section title="Not available in the record" items={summary.dataGaps} />

          <p className="mt-6 border-t border-outline-variant pt-4 text-body-sm text-on-surface-variant">
            {summary.disclaimer}
          </p>
        </section>
      )}
    </div>
  );
};

export default PatientProfileAdmin;
