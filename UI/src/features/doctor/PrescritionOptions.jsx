
import React, { useState } from "react";
import axios from "axios";
import { addPrescriptionImage, ManualPrescription, PrescriptionDescription } from "../../api/backend";

const PrescriptionOptions = ({ appointmentId }) => {
  const [method, setMethod] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Final prescription data
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

  // -----------------------------
  // MANUAL FORM STATE
  // -----------------------------

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

  // -----------------------------
  // MANUAL PRESCRIPTION
  // -----------------------------

  const handleManualSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const data = {
        appointmentId: appointmentId,

        complaints: complaints
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        diagnosis: diagnosis
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        medicines,

        tests: tests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        advice,

        attachments: [],

        followUpDate,
      };

      console.log("Manual Prescription:", data);

      const response = await ManualPrescription(data);
      console.log(response.data);
      console.log("Prescription Created:", response.data);

      setPrescription(data);

      setMessage("Prescription created successfully!");

    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Failed to create prescription."
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // IMAGE OCR
  // -----------------------------

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

      /*
        Depending on your OCR API response,
        extracted data may be directly in response.data
        or inside response.data.data/result.

        Adjust this if your backend response differs.
      */

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
  // PREVIEW COMPONENT
  // -----------------------------

  const PrescriptionPreview = () => {
    return (
      <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">

        <h2 className="mb-5 text-xl font-semibold text-gray-800">
          Prescription Preview
        </h2>

        {/* Complaints */}

        <div className="mb-4">
          <h3 className="font-semibold text-gray-700">
            Complaints
          </h3>

          <p className="text-gray-600">
            {prescription.complaints?.length
              ? prescription.complaints.join(", ")
              : "No complaints"}
          </p>
        </div>

        {/* Diagnosis */}

        <div className="mb-4">
          <h3 className="font-semibold text-gray-700">
            Diagnosis
          </h3>

          <p className="text-gray-600">
            {prescription.diagnosis?.length
              ? prescription.diagnosis.join(", ")
              : "No diagnosis"}
          </p>
        </div>

        {/* Medicines */}

        <div className="mb-4">

          <h3 className="mb-2 font-semibold text-gray-700">
            Medicines
          </h3>

          <div className="space-y-3">

            {prescription.medicines?.map(
              (medicine, index) => (
                <div
                  key={index}
                  className="rounded-lg bg-gray-50 p-4"
                >

                  <p className="font-medium">
                    {medicine.name}
                  </p>

                  <p className="text-sm text-gray-600">
                    {medicine.dosage} •{" "}
                    {medicine.frequency} •{" "}
                    {medicine.duration}
                  </p>

                  <p className="text-sm text-gray-500">
                    {medicine.instructions}
                  </p>

                </div>
              )
            )}

          </div>
        </div>

        {/* Tests */}

        <div className="mb-4">

          <h3 className="font-semibold text-gray-700">
            Tests
          </h3>

          <p className="text-gray-600">
            {prescription.tests?.length
              ? prescription.tests.join(", ")
              : "No tests"}
          </p>

        </div>

        {/* Advice */}

        <div className="mb-4">

          <h3 className="font-semibold text-gray-700">
            Advice
          </h3>

          <p className="text-gray-600">
            {prescription.advice || "No advice"}
          </p>

        </div>

        {/* Follow Up */}

        <div className="mb-5">

          <h3 className="font-semibold text-gray-700">
            Follow-up Date
          </h3>

          <p className="text-gray-600">
            {prescription.followUpDate ||
              "Not specified"}
          </p>

        </div>

        <button
          onClick={handleFinalSubmit}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : "Confirm & Save Prescription"}
        </button>

      </div>
    );
  };

  // -----------------------------
  // MAIN UI
  // -----------------------------

  return (
    <div className="mx-auto max-w-5xl p-6">

      <h1 className="mb-2 text-2xl font-bold text-gray-800">
        Create Prescription
      </h1>

      <p className="mb-6 text-gray-500">
        Choose how you want to create the prescription.
      </p>

      {/* MESSAGE */}

      {message && (
        <div className="mb-5 rounded-lg bg-blue-50 p-3 text-blue-700">
          {message}
        </div>
      )}

      {/* OPTIONS */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

        {/* MANUAL */}

        <button
          onClick={() => setMethod("manual")}
          className={`rounded-xl border p-6 text-left transition hover:border-blue-500 hover:shadow-md ${
            method === "manual"
              ? "border-blue-500 bg-blue-50"
              : "bg-white"
          }`}
        >

          <div className="mb-3 text-3xl">
            ✍️
          </div>

          <h2 className="text-lg font-semibold">
            Manual Prescription
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Enter complaints, diagnosis, medicines,
            tests and advice manually.
          </p>

        </button>

        {/* IMAGE */}

        <button
          onClick={() => setMethod("image")}
          className={`rounded-xl border p-6 text-left transition hover:border-blue-500 hover:shadow-md ${
            method === "image"
              ? "border-blue-500 bg-blue-50"
              : "bg-white"
          }`}
        >

          <div className="mb-3 text-3xl">
            📷
          </div>

          <h2 className="text-lg font-semibold">
            Upload Prescription
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Upload an existing prescription image
            and extract its information using OCR.
          </p>

        </button>

        {/* DESCRIPTION */}

        <button
          onClick={() => setMethod("description")}
          className={`rounded-xl border p-6 text-left transition hover:border-blue-500 hover:shadow-md ${
            method === "description"
              ? "border-blue-500 bg-blue-50"
              : "bg-white"
          }`}
        >

          <div className="mb-3 text-3xl">
            🤖
          </div>

          <h2 className="text-lg font-semibold">
            Describe Prescription
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Describe the prescription in normal language
            and let AI structure it.
          </p>

        </button>

      </div>

      {/* ================================================= */}
      {/* MANUAL FORM */}
      {/* ================================================= */}

      {method === "manual" && (

        <form
          onSubmit={handleManualSubmit}
          className="mt-8 rounded-xl border bg-white p-6 shadow-sm"
        >

          <h2 className="mb-6 text-xl font-semibold">
            Manual Prescription
          </h2>

          {/* Complaints */}

          <div className="mb-5">

            <label className="mb-2 block font-medium">
              Complaints
            </label>

            <input
              type="text"
              value={complaints}
              onChange={(e) =>
                setComplaints(e.target.value)
              }
              placeholder="Fever, Headache"
              className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
            />

          </div>

          {/* Diagnosis */}

          <div className="mb-5">

            <label className="mb-2 block font-medium">
              Diagnosis
            </label>

            <input
              type="text"
              value={diagnosis}
              onChange={(e) =>
                setDiagnosis(e.target.value)
              }
              placeholder="Viral Fever"
              className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
            />

          </div>

          {/* MEDICINES */}

          <div className="mb-6">

            <div className="mb-3 flex items-center justify-between">

              <label className="font-medium">
                Medicines
              </label>

              <button
                type="button"
                onClick={addMedicine}
                className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white"
              >
                + Add Medicine
              </button>

            </div>

            <div className="space-y-4">

              {medicines.map(
                (medicine, index) => (

                  <div
                    key={index}
                    className="rounded-lg border bg-gray-50 p-4"
                  >

                    <div className="mb-3 flex justify-between">

                      <h3 className="font-medium">
                        Medicine {index + 1}
                      </h3>

                      {medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeMedicine(index)
                          }
                          className="text-sm text-red-600"
                        >
                          Remove
                        </button>
                      )}

                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                      <input
                        placeholder="Medicine name"
                        value={medicine.name}
                        onChange={(e) =>
                          handleMedicineChange(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        className="rounded-lg border p-3"
                        required
                      />

                      <input
                        placeholder="Dosage e.g. 500mg"
                        value={medicine.dosage}
                        onChange={(e) =>
                          handleMedicineChange(
                            index,
                            "dosage",
                            e.target.value
                          )
                        }
                        className="rounded-lg border p-3"
                      />

                      <input
                        placeholder="Frequency e.g. BD"
                        value={medicine.frequency}
                        onChange={(e) =>
                          handleMedicineChange(
                            index,
                            "frequency",
                            e.target.value
                          )
                        }
                        className="rounded-lg border p-3"
                      />

                      <input
                        placeholder="Duration e.g. 5 days"
                        value={medicine.duration}
                        onChange={(e) =>
                          handleMedicineChange(
                            index,
                            "duration",
                            e.target.value
                          )
                        }
                        className="rounded-lg border p-3"
                      />

                    </div>

                    <input
                      placeholder="Instructions e.g. After food"
                      value={medicine.instructions}
                      onChange={(e) =>
                        handleMedicineChange(
                          index,
                          "instructions",
                          e.target.value
                        )
                      }
                      className="mt-3 w-full rounded-lg border p-3"
                    />

                  </div>

                )
              )}

            </div>

          </div>

          {/* TESTS */}

          <div className="mb-5">

            <label className="mb-2 block font-medium">
              Tests
            </label>

            <input
              type="text"
              value={tests}
              onChange={(e) =>
                setTests(e.target.value)
              }
              placeholder="CBC, LFT"
              className="w-full rounded-lg border p-3"
            />

          </div>

          {/* ADVICE */}

          <div className="mb-5">

            <label className="mb-2 block font-medium">
              Advice
            </label>

            <textarea
              value={advice}
              onChange={(e) =>
                setAdvice(e.target.value)
              }
              placeholder="Take proper rest and drink plenty of water"
              rows={4}
              className="w-full rounded-lg border p-3"
            />

          </div>

          {/* FOLLOW UP */}

          <div className="mb-6">

            <label className="mb-2 block font-medium">
              Follow-up Date
            </label>

            <input
              type="date"
              value={followUpDate}
              onChange={(e) =>
                setFollowUpDate(e.target.value)
              }
              className="rounded-lg border p-3"
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "Creating..."
              : "Create Prescription"}
          </button>

        </form>

      )}

      {/* ================================================= */}
      {/* IMAGE FORM */}
      {/* ================================================= */}

      {method === "image" && (

        <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">

          <h2 className="mb-2 text-xl font-semibold">
            Upload Prescription Image
          </h2>

          <p className="mb-5 text-sm text-gray-500">
            Upload a clear prescription image. OCR will
            extract the prescription details.
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImage(e.target.files[0])
            }
            className="mb-5 block w-full rounded-lg border p-3"
          />

          {image && (
            <img
              src={URL.createObjectURL(image)}
              alt="Prescription preview"
              className="mb-5 max-h-80 rounded-lg border object-contain"
            />
          )}

          <button
            onClick={handleImageUpload}
            disabled={loading || !image}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : "Extract Prescription"}
          </button>

          {prescription.medicines?.length > 0 && (
            <PrescriptionPreview />
          )}

        </div>

      )}

      {/* ================================================= */}
      {/* DESCRIPTION FORM */}
      {/* ================================================= */}

      {method === "description" && (

        <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">

          <h2 className="mb-2 text-xl font-semibold">
            Describe Prescription
          </h2>

          <p className="mb-5 text-sm text-gray-500">
            Write the prescription in normal language.
            AI will convert it into structured data.
          </p>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            rows={8}
            placeholder="Example: Fever and headache. Viral fever. Paracetamol 500 BD for 5 days after food, cetirizine 10 OD for 3 days at night. CBC test. Rest and drink plenty of water. Follow up after 5 days."
            className="mb-5 w-full rounded-lg border p-4 outline-none focus:border-blue-500"
          />

          <button
            onClick={handleDescriptionParse}
            disabled={loading || !description.trim()}
            className="rounded-lg bg-purple-600 px-6 py-3 font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {loading
              ? "Generating..."
              : "Generate Prescription"}
          </button>

          {prescription.medicines?.length > 0 && (
            <PrescriptionPreview />
          )}

        </div>

      )}

    </div>
  );
};

export default PrescriptionOptions;

