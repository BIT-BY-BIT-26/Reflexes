import React, { useState } from "react";
import { FilePlus, Upload, X, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { addPatientReport } from "../../api/backend";
import PatientProfile from "../../components/PatientProfile";

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
      <div className="max-w-5xl mx-auto">

        {/* Patient Profile */}
        <PatientProfile />
        <div className="mt-10 flex gap-5">
          <button className="p-3 bg-blue-800 text-white rounded-md">see medical summary</button>
          <button onClick={() =>navigate(`/doctor-dashboard/patients/${id}/history`)} className="p-3 bg-blue-800 text-white rounded-md">previous reports and prescription</button>
          <button className="p-3 bg-blue-800 text-white rounded-md">shared reports and prescription</button>
        </div>
      </div>
    </div>
  );
};

export default PatientProfileAdmin;