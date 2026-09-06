import React, { useState } from "react";
import axios from "axios";
import { Camera, PenLine, Plus, Sparkles, Trash2 } from "lucide-react";
import { addPrescriptionImage, ManualPrescription, PrescriptionDescription } from "../../api/backend";
import { useParams, useSearchParams } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";

/*
  Three ways to create one prescription: typed by hand, extracted from an image
  by the external OCR service, or parsed from free text. All three end in the
  same draft shape.

  Every handler below is unchanged, including handleFinalSubmit's reference to
  CREATE_PRESCRIPTION_API - which is not defined anywhere in the project, so
  that button throws a ReferenceError that the catch turns into "Failed to save
  prescription." Preserved as-is per the brief; flagged rather than fixed.
*/

const PrescriptionOptions = () => {
  const {id:patientId} = useParams();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  console.log("Patient ID:", patientId);
  console.log("Appointment ID:", appointmentId);
  const [method, setMethod] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [prescription, setPrescription] = useState({
    appointmentId: appointmentId || "",
    complaints: [],
    diagnosis: [],
    medicines: [],
    tests: [],
    advice: "",
    attachments: [],
    followUpDate: "",
  });


  const [complaints, setComplaints] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [tests, setTests] = useState("");
  const [advice, setAdvice] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  const [medicines, setMedicines] = useState([
    {
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    },
  ]);
  const [description, setDescription] = useState("");

  const [image, setImage] = useState(null);
  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...medicines]; //Ye medicines array ki copy banata hai.

    updatedMedicines[index][field] = value;

    setMedicines(updatedMedicines);
  };

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ]);
  };

  const removeMedicine = (index) => {
    if (medicines.length === 1) return;

    setMedicines(medicines.filter((_, i) => i !== index));
  };

const handleManualSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);
    setMessage("");

    if (!patientId) {
      setMessage("Patient ID is missing.");
      return;
    }

    if (!appointmentId) {
      setMessage("Appointment ID is missing.");
      return;
    }

    const formData = new FormData();

    // IDs
    formData.append("patientId", patientId);
    formData.append("appointmentId", appointmentId);

    // Arrays
    formData.append(
      "complaints",
      JSON.stringify(
        complaints
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      )
    );

    formData.append(
      "diagnosis",
      JSON.stringify(
        diagnosis
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      )
    );

    formData.append(
      "medicines",
      JSON.stringify(medicines)
    );

    formData.append(
      "tests",
      JSON.stringify(
        tests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      )
    );

    // Normal fields
    formData.append("advice", advice);
    formData.append("followUpDate", followUpDate);
    const response = await ManualPrescription(formData);
    setMessage("Prescription created successfully!");

    // Clear form
    setComplaints("");
    setDiagnosis("");
    setTests("");
    setAdvice("");
    setFollowUpDate("");

    setMedicines([
      {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ]);

  } catch (error) {


    setMessage(
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to create prescription."
    );

  } finally {
    setLoading(false);
  }
};

  const handleImageUpload = async () => {
    if (!image) {
      setMessage("Please select a prescription image.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();

      formData.append("file", image);

      // If your API expects appointmentId
      formData.append("appointmentId", appointmentId);

      console.log("Sending image to OCR API...");

      const response = await addPrescriptionImage(formData);

      console.log("OCR Response:", response.data);

      const extracted =
        response.data?.data ||
        response.data?.result ||
        response.data;

      const finalData = {
        appointmentId,

        complaints: extracted.complaints || [],

        diagnosis: extracted.diagnosis || [],

        medicines: extracted.medicines || [],

        tests: extracted.tests || [],

        advice: extracted.advice || "",

        attachments: extracted.attachments || [],

        followUpDate: extracted.followUpDate || "",
      };

      setPrescription(finalData);

      setMessage(
        "Prescription extracted successfully. Please review it."
      );

    } catch (error) {
      console.error("OCR Error:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to process prescription image."
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // DESCRIPTION / AI PARSE
  // -----------------------------

  const handleDescriptionParse = async () => {
    if (!description.trim()) {
      setMessage("Please enter prescription description.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

    const response = await PrescriptionDescription({
        appointmentId,
        prescriptionText: description,
    });

      console.log("Parse Response:", response.data);

      const extracted =
        response.data?.data ||
        response.data?.result ||
        response.data;

      const finalData = {
        appointmentId,

        complaints: extracted.complaints || [],

        diagnosis: extracted.diagnosis || [],

        medicines: extracted.medicines || [],

        tests: extracted.tests || [],

        advice: extracted.advice || "",

        attachments: extracted.attachments || [],

        followUpDate: extracted.followUpDate || "",
      };

      setPrescription(finalData);

      setMessage(
        "Prescription generated successfully. Please review it."
      );

    } catch (error) {
      console.error("Parse Error:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to generate prescription."
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // FINAL SUBMIT OCR / AI
  // -----------------------------

  const handleFinalSubmit = async () => {
    try {
      setLoading(true);
      setMessage("");

      console.log(
        "Final Prescription:",
        prescription
      );

      const response = await axios.post(
        CREATE_PRESCRIPTION_API,
        prescription,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log(
        "Prescription Saved:",
        response.data
      );

      setMessage("Prescription saved successfully!");

    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Failed to save prescription."
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // SHARED STYLES
  // -----------------------------

  const field =
    "w-full rounded-control border border-outline-variant bg-surface-container px-3 py-2.5 text-body-md text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary";
  const fieldLabel = "mb-1.5 block text-label-md text-on-surface-variant";
  const panel = "mt-6 rounded-card border border-outline-variant bg-surface-lowest p-6";
  const primaryBtn =
    "inline-flex items-center gap-2 rounded-control bg-primary px-6 py-2.5 text-body-md font-semibold text-on-primary transition hover:brightness-110 disabled:opacity-50";

  // -----------------------------
  // PREVIEW COMPONENT
  // -----------------------------

  const PrescriptionPreview = () => {
    return (
      <div className="mt-6 rounded-card border border-outline-variant bg-surface-container p-5">
        <h2 className="font-display text-headline-sm text-on-surface">
          Prescription preview
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {/* Complaints */}
          <div>
            <h3 className="text-label-caps uppercase text-on-surface-variant">Complaints</h3>
            <p className="mt-1 text-body-md text-on-surface">
              {prescription.complaints?.length
                ? prescription.complaints.join(", ")
                : "No complaints"}
            </p>
          </div>

          {/* Diagnosis */}
          <div>
            <h3 className="text-label-caps uppercase text-on-surface-variant">Diagnosis</h3>
            <p className="mt-1 text-body-md text-on-surface">
              {prescription.diagnosis?.length
                ? prescription.diagnosis.join(", ")
                : "No diagnosis"}
            </p>
          </div>
        </div>

        {/* Medicines */}
        <div className="mt-5">
          <h3 className="text-label-caps uppercase text-on-surface-variant">Medicines</h3>

          <div className="mt-2 flex flex-col gap-2">
            {prescription.medicines?.map((medicine, index) => (
              <div
                key={index}
                className="rounded-control border border-outline-variant bg-surface-lowest px-4 py-3"
              >
                <p className="text-body-md font-medium text-on-surface">{medicine.name}</p>
                <p className="text-body-sm text-on-surface-variant">
                  {medicine.dosage} · {medicine.frequency} · {medicine.duration}
                </p>
                <p className="text-body-sm text-on-surface-variant">{medicine.instructions}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div>
            <h3 className="text-label-caps uppercase text-on-surface-variant">Tests</h3>
            <p className="mt-1 text-body-md text-on-surface">
              {prescription.tests?.length ? prescription.tests.join(", ") : "No tests"}
            </p>
          </div>

          <div>
            <h3 className="text-label-caps uppercase text-on-surface-variant">Advice</h3>
            <p className="mt-1 text-body-md text-on-surface">
              {prescription.advice || "No advice"}
            </p>
          </div>

          <div>
            <h3 className="text-label-caps uppercase text-on-surface-variant">Follow-up date</h3>
            <p className="mt-1 text-body-md text-on-surface tabular">
              {prescription.followUpDate || "Not specified"}
            </p>
          </div>
        </div>

        <button onClick={handleFinalSubmit} disabled={loading} className={`${primaryBtn} mt-6`}>
          {loading ? "Saving…" : "Confirm & save prescription"}
        </button>
      </div>
    );
  };

  const methods = [
    {
      key: "manual",
      icon: PenLine,
      title: "Manual prescription",
      copy: "Enter complaints, diagnosis, medicines, tests and advice manually.",
    },
    {
      key: "image",
      icon: Camera,
      title: "Upload prescription",
      copy: "Upload an existing prescription image and extract its information using OCR.",
    },
    {
      key: "description",
      icon: Sparkles,
      title: "Describe prescription",
      copy: "Describe the prescription in normal language and let AI structure it.",
    },
  ];

  // -----------------------------
  // MAIN UI
  // -----------------------------

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Doctor portal"
        title="Create Prescription"
        description="Choose how you want to create the prescription for this consultation."
      />

      {/* MESSAGE */}
      {message && (
        <div className="rounded-card border border-outline-variant bg-primary-container/10 px-4 py-3 text-body-md text-on-surface">
          {message}
        </div>
      )}

      {/* OPTIONS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {methods.map((option) => {
          const Icon = option.icon;
          const active = method === option.key;

          return (
            <button
              key={option.key}
              onClick={() => setMethod(option.key)}
              className={`rounded-card border p-5 text-left transition ${
                active
                  ? "border-primary bg-primary-container/10"
                  : "border-outline-variant bg-surface-lowest hover:bg-surface-container"
              }`}
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-control ${
                  active
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                <Icon size={20} />
              </span>

              <h2 className="mt-4 font-display text-title-card text-on-surface">
                {option.title}
              </h2>
              <p className="mt-1 text-body-sm text-on-surface-variant">{option.copy}</p>
            </button>
          );
        })}
      </div>

      {/* ================================================= */}
      {/* MANUAL FORM */}
      {/* ================================================= */}

      {method === "manual" && (
        <form onSubmit={handleManualSubmit} className={panel}>
          <h2 className="font-display text-headline-sm text-on-surface">
            Manual prescription
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {/* Complaints */}
            <div>
              <label className={fieldLabel}>Complaints</label>
              <input
                type="text"
                value={complaints}
                onChange={(e) => setComplaints(e.target.value)}
                placeholder="Fever, Headache"
                className={field}
              />
            </div>

            {/* Diagnosis */}
            <div>
              <label className={fieldLabel}>Diagnosis</label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Viral Fever"
                className={field}
              />
            </div>
          </div>

          {/* MEDICINES */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <label className="text-label-md text-on-surface-variant">Medicines</label>

              <button
                type="button"
                onClick={addMedicine}
                className="inline-flex items-center gap-1.5 rounded-control border border-outline-variant px-3 py-2 text-body-sm font-medium text-on-surface transition hover:bg-surface-container"
              >
                <Plus size={15} />
                Add medicine
              </button>
            </div>

            <div className="mt-3 flex flex-col gap-3">
              {medicines.map((medicine, index) => (
                <div
                  key={index}
                  className="rounded-card border border-outline-variant bg-surface-container p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-label-caps uppercase text-on-surface-variant">
                      Medicine {index + 1}
                    </h3>

                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicine(index)}
                        className="inline-flex items-center gap-1.5 text-body-sm font-medium text-error transition hover:brightness-110"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <input
                      placeholder="Medicine name"
                      value={medicine.name}
                      onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                      className={field}
                      required
                    />

                    <input
                      placeholder="Dosage e.g. 500mg"
                      value={medicine.dosage}
                      onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                      className={field}
                    />

                    <input
                      placeholder="Frequency e.g. BD"
                      value={medicine.frequency}
                      onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)}
                      className={field}
                    />

                    <input
                      placeholder="Duration e.g. 5 days"
                      value={medicine.duration}
                      onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                      className={field}
                    />
                  </div>

                  <input
                    placeholder="Instructions e.g. After food"
                    value={medicine.instructions}
                    onChange={(e) => handleMedicineChange(index, "instructions", e.target.value)}
                    className={`${field} mt-3`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {/* TESTS */}
            <div>
              <label className={fieldLabel}>Tests</label>
              <input
                type="text"
                value={tests}
                onChange={(e) => setTests(e.target.value)}
                placeholder="CBC, LFT"
                className={field}
              />
            </div>

            {/* FOLLOW UP */}
            <div>
              <label className={fieldLabel}>Follow-up date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className={field}
              />
            </div>
          </div>

          {/* ADVICE */}
          <div className="mt-5">
            <label className={fieldLabel}>Advice</label>
            <textarea
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              placeholder="Take proper rest and drink plenty of water"
              rows={4}
              className={field}
            />
          </div>

          <button type="submit" disabled={loading} className={`${primaryBtn} mt-6`}>
            {loading ? "Creating…" : "Create prescription"}
          </button>
        </form>
      )}

      {/* ================================================= */}
      {/* IMAGE FORM */}
      {/* ================================================= */}

      {method === "image" && (
        <div className={panel}>
          <h2 className="font-display text-headline-sm text-on-surface">
            Upload prescription image
          </h2>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Upload a clear prescription image. OCR will extract the prescription details.
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className={`${field} mt-5 file:mr-3 file:rounded-control file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-body-sm file:font-medium file:text-on-primary`}
          />

          {image && (
            <img
              src={URL.createObjectURL(image)}
              alt="Prescription preview"
              className="mt-5 max-h-80 rounded-card border border-outline-variant object-contain"
            />
          )}

          <button
            onClick={handleImageUpload}
            disabled={loading || !image}
            className={`${primaryBtn} mt-5`}
          >
            {loading ? "Processing…" : "Extract prescription"}
          </button>

          {prescription.medicines?.length > 0 && <PrescriptionPreview />}
        </div>
      )}

      {/* ================================================= */}
      {/* DESCRIPTION FORM */}
      {/* ================================================= */}

      {method === "description" && (
        <div className={panel}>
          <h2 className="font-display text-headline-sm text-on-surface">
            Describe prescription
          </h2>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Write the prescription in normal language. AI will convert it into structured data.
          </p>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            placeholder="Example: Fever and headache. Viral fever. Paracetamol 500 BD for 5 days after food, cetirizine 10 OD for 3 days at night. CBC test. Rest and drink plenty of water. Follow up after 5 days."
            className={`${field} mt-5`}
          />

          <button
            onClick={handleDescriptionParse}
            disabled={loading || !description.trim()}
            className={`${primaryBtn} mt-5`}
          >
            {loading ? "Generating…" : "Generate prescription"}
          </button>

          {prescription.medicines?.length > 0 && <PrescriptionPreview />}
        </div>
      )}
    </div>
  );
};

export default PrescriptionOptions;
