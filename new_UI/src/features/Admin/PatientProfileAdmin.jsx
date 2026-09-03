import React, { useState } from "react";
import { FilePlus, FileText, Upload, X } from "lucide-react";
import { useParams } from "react-router-dom";
import { addPatientReport } from "../../api/backend";
import PatientProfile from "../../components/PatientProfile";
import PageHeader from "../../components/layout/PageHeader";

/*
  Admin's view of one patient: the shared profile card plus the report upload
  form. File-type allow-list, the four validation messages, the FormData keys,
  the document.getElementById("report-file") reset and the success/error
  handling are all unchanged.
*/

const PatientProfileAdmin = () => {
  const { id } = useParams();
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

  const field =
    "w-full rounded-control border border-outline-variant bg-surface-container px-3 py-2.5 text-body-md text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Hospital admin"
        title="Patient record"
        description="Patient details on file, and the reports uploaded against this record."
      />

      <PatientProfile />

      {/* Add Report Section */}
      {!showReportForm ? (
        <div>
          <button
            onClick={() => {
              setShowReportForm(true);
              setMessage("");
              setError("");
            }}
            className="inline-flex items-center gap-2 rounded-control bg-primary px-5 py-2.5 text-body-md font-semibold text-on-primary transition hover:brightness-110"
          >
            <FilePlus size={17} />
            Add report
          </button>

          {message && (
            <p className="mt-3 rounded-control bg-primary-container/15 px-4 py-3 text-body-md text-primary">
              {message}
            </p>
          )}
        </div>
      ) : (
        <section className="overflow-hidden rounded-card border border-outline-variant bg-surface-lowest">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-outline-variant px-6 py-5">
            <div>
              <h2 className="font-display text-headline-sm text-on-surface">
                Add patient report
              </h2>
              <p className="mt-0.5 text-body-md text-on-surface-variant">
                Upload a medical report for this patient
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowReportForm(false);
                setError("");
                setMessage("");
              }}
              className="rounded-control p-1.5 text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleUploadReport} className="px-6 py-5">
            {/* Success */}
            {message && (
              <p className="mb-4 rounded-control bg-primary-container/15 px-4 py-3 text-body-md text-primary">
                {message}
              </p>
            )}

            {/* Error */}
            {error && (
              <p className="mb-4 rounded-control bg-error-container px-4 py-3 text-body-md text-on-error-container">
                {error}
              </p>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {/* Title */}
              <div>
                <label className="mb-1.5 block text-label-md text-on-surface-variant">
                  Report title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Complete Blood Count"
                  className={field}
                />
              </div>

              {/* Report Type */}
              <div>
                <label className="mb-1.5 block text-label-md text-on-surface-variant">
                  Report type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className={field}
                >
                  <option value="LAB">LAB</option>
                  <option value="XRAY">XRAY</option>
                  <option value="MRI">MRI</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
            </div>

            {/* File */}
            <div className="mt-4">
              <label className="mb-1.5 block text-label-md text-on-surface-variant">
                Report file
              </label>

              <label
                htmlFor="report-file"
                className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-card border border-dashed border-outline-variant bg-surface-container transition hover:border-primary"
              >
                <Upload size={26} className="mb-3 text-primary" />

                {file ? (
                  <>
                    <span className="flex items-center gap-2 text-body-md font-medium text-on-surface">
                      <FileText size={17} />
                      {file.name}
                    </span>
                    <span className="mt-1 text-body-sm text-on-surface-variant tabular">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-body-md font-medium text-on-surface">
                      Click to upload report
                    </span>
                    <span className="mt-1 text-body-sm text-on-surface-variant">
                      JPG, PNG or PDF
                    </span>
                  </>
                )}
              </label>

              <input
                id="report-file"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowReportForm(false);
                  setError("");
                  setMessage("");
                }}
                className="rounded-control border border-outline-variant px-4 py-2.5 text-body-md font-medium text-on-surface transition hover:bg-surface-container"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-control bg-primary px-5 py-2.5 text-body-md font-semibold text-on-primary transition hover:brightness-110 disabled:opacity-50"
              >
                <Upload size={17} />
                {uploading ? "Uploading…" : "Upload report"}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
};

export default PatientProfileAdmin;
