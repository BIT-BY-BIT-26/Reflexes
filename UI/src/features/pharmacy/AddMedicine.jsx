import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Camera,
  CheckCircle2,
  FilePenLine,
  Pill,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import WebcamMedicineOCR from "./WebcamMedicineOCR";
import api from "../../api/axiosInstance";

// Matches exactly what MedicineModel + addMedicine controller accept/store
const initialMedicine = {
  name: "",
  strength: "",
  category: "",
  manufacturer: "",
  description: "",
  batchNumber: "",
  manufacturingDate: "",
  expiryDate: "",
  price: "",
  stock: "",
};

// Mirrors the backend's parseMonthYear() check in the pharmacy controller
const MONTH_YEAR_PATTERN = /^(\d{1,2})[\/.-](\d{4})$/;

const isValidMonthYear = (value) => {
  const match = value.match(MONTH_YEAR_PATTERN);
  if (!match) return false;
  const month = Number(match[1]);
  return month >= 1 && month <= 12;
};

const AddMedicine = () => {
  const navigate = useNavigate();

  const [method, setMethod] = useState(null);
  const [medicine, setMedicine] = useState(initialMedicine);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setMedicine((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOCRResult = (ocrData) => {
    setMedicine((prev) => ({
      ...prev,
      ...ocrData,
    }));

    setMethod("ocr");
  };

  const validateMedicine = () => {
    if (!medicine.name.trim()) {
      alert("Medicine name is required.");
      return false;
    }

    if (!medicine.batchNumber.trim()) {
      alert("Batch number is required.");
      return false;
    }

    if (!isValidMonthYear(medicine.manufacturingDate.trim())) {
      alert("Manufacturing date must be in MM/YYYY format.");
      return false;
    }

    if (!isValidMonthYear(medicine.expiryDate.trim())) {
      alert("Expiry date must be in MM/YYYY format.");
      return false;
    }

    if (
      medicine.price === "" ||
      Number.isNaN(Number(medicine.price)) ||
      Number(medicine.price) < 0
    ) {
      alert("A valid price is required.");
      return false;
    }

    if (
      medicine.stock === "" ||
      Number.isNaN(Number(medicine.stock)) ||
      Number(medicine.stock) < 0
    ) {
      alert("A valid stock quantity is required.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateMedicine()) return;

    try {
      setSaving(true);

      const response = await api.post("/pharmacy/add-medicine", {
        medicineName: medicine.name.trim(),
        strength: medicine.strength.trim(),
        batchNumber: medicine.batchNumber.trim(),
        manufacturingDate: medicine.manufacturingDate.trim(),
        expiryDate: medicine.expiryDate.trim(),
        price: Number(medicine.price),
        stock: Number(medicine.stock),
        category: medicine.category.trim(),
        manufacturer: medicine.manufacturer.trim(),
        description: medicine.description.trim(),
        addedVia: method === "ocr" ? "OCR" : "MANUAL",
      });

      if (!response.data?.success) {
        throw new Error(response.data?.msg || "Failed to add medicine");
      }

      alert("Medicine added successfully.");
      setMedicine(initialMedicine);
      setMethod(null);
      navigate("/pharmacy-dashboard");

    } catch (error) {
      console.error(error);
      alert("Failed to add medicine.");
    } finally {
      setSaving(false);
    }
  };

  if (!method) {
    return (
      <div className="min-h-[calc(100vh-120px)] text-gray-900 dark:text-white">

        {/* Header */}
        <div className="mb-8 flex items-center gap-4">

          <button
            onClick={() => navigate("/pharmacy-dashboard")}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-gray-800 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Add Medicine
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-gray-500">
              Choose how you want to add medicine to your inventory
            </p>
          </div>

        </div>

        {/* Options */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Manual */}
          <button
            onClick={() => setMethod("manual")}
            className="group rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-8 text-left transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-green-900/25 dark:from-green-900/10 dark:to-white/[0.02] dark:hover:shadow-green-950/40"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-800/25">
              <FilePenLine size={29} className="text-green-600 dark:text-green-400" />
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  Add Manually
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-gray-500">
                  Enter medicine details manually into the inventory.
                </p>
              </div>
              <ArrowRight size={20} className="text-green-600 transition group-hover:translate-x-1 dark:text-green-400" />
            </div>

            <div className="mt-7 space-y-3">
              <Feature text="Enter medicine information step by step" />
              <Feature text="Add price, stock, expiry date and more" />
              <Feature text="Best for single medicine entry" />
            </div>

            <div className="mt-7 inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white transition group-hover:bg-green-700">
              Add Manually
              <ArrowRight size={17} />
            </div>
          </button>

          {/* OCR */}
          <button
            onClick={() => setMethod("ocr")}
            className="group relative rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-8 text-left transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#418AFF] dark:border-blue-900/25 dark:from-blue-900/10 dark:to-white/[0.02] dark:hover:shadow-blue-950/40"
          >
            <span className="absolute right-6 top-6 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-800/25 dark:text-[#7fb1ff]">
              Recommended
            </span>

            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800/25">
              <Camera size={29} className="text-blue-600 dark:text-[#7fb1ff]" />
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  Upload via Webcam OCR
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-gray-500">
                  Scan the medicine strip and automatically extract details.
                </p>
              </div>
              <ArrowRight size={20} className="text-blue-600 transition group-hover:translate-x-1 dark:text-[#7fb1ff]" />
            </div>

            <div className="mt-7 space-y-3">
              <Feature text="Use webcam to capture medicine strip" />
              <Feature text="OCR extracts medicine information automatically" />
              <Feature text="Review and edit before saving" />
            </div>

            <div className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#3979E2] px-5 py-3 text-sm font-semibold text-white transition group-hover:bg-[#2d64c2]">
              Start Webcam OCR
              <ArrowRight size={17} />
            </div>
          </button>

        </div>

        {/* Security */}
        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900/25 dark:bg-blue-900/10">
          <div className="flex gap-3">
            <ShieldCheck size={22} className="mt-0.5 text-blue-600 dark:text-[#7fb1ff]" />
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                Review before saving
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-gray-500">
                OCR extracted information should always be reviewed by the
                pharmacy staff before adding it to inventory.
              </p>
            </div>
          </div>
        </div>

      </div>
    );
  }

  if (method === "ocr") {
    return (
      <WebcamMedicineOCR
        onBack={() => setMethod(null)}
        onExtract={handleOCRResult}
        initialData={medicine}
      />
    );
  }

  return (
    <ManualMedicineForm
      medicine={medicine}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      saving={saving}
      onBack={() => setMethod(null)}
    />
  );
};

const Feature = ({ text }) => (
  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-gray-400">
    <CheckCircle2 size={17} className="shrink-0 text-green-600 dark:text-green-400" />
    {text}
  </div>
);

const ManualMedicineForm = ({
  medicine,
  handleChange,
  handleSubmit,
  saving,
  onBack,
}) => {
  return (
    <div className="text-gray-900 dark:text-white">

      {/* Header */}
      <div className="mb-7 flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-gray-800 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
        >
          <ArrowLeft size={19} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Add Medicine Manually
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-500">
            Enter complete medicine and inventory details.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] dark:shadow-none sm:p-8"
      >

        {/* Basic Information */}
        <FormSection title="Basic Information" icon={Pill}>

          <Input
            label="Medicine Name"
            name="name"
            value={medicine.name}
            onChange={handleChange}
            placeholder="e.g. Paracetamol"
            required
          />

          <Input
            label="Strength"
            name="strength"
            value={medicine.strength}
            onChange={handleChange}
            placeholder="e.g. 650 mg"
          />

          <Select
            label="Category"
            name="category"
            value={medicine.category}
            onChange={handleChange}
            options={[
              "Tablet",
              "Capsule",
              "Syrup",
              "Injection",
              "Cream",
              "Ointment",
              "Drops",
              "Powder",
              "Other",
            ]}
          />

          <Input
            label="Manufacturer"
            name="manufacturer"
            value={medicine.manufacturer}
            onChange={handleChange}
            placeholder="Manufacturer name"
          />

          <Textarea
            label="Description"
            name="description"
            value={medicine.description}
            onChange={handleChange}
            placeholder="Optional notes, generic name, composition, etc."
          />

        </FormSection>

        {/* Batch */}
        <FormSection title="Batch & Expiry" icon={CalendarClock} divider>

          <Input
            label="Batch Number"
            name="batchNumber"
            value={medicine.batchNumber}
            onChange={handleChange}
            placeholder="e.g. AB12345"
            required
          />

          <Input
            label="Manufacturing Date"
            name="manufacturingDate"
            value={medicine.manufacturingDate}
            onChange={handleChange}
            placeholder="MM/YYYY"
            required
          />

          <Input
            label="Expiry Date"
            name="expiryDate"
            value={medicine.expiryDate}
            onChange={handleChange}
            placeholder="MM/YYYY"
            required
          />

        </FormSection>

        {/* Pricing & Stock */}
        <FormSection title="Pricing & Stock" icon={Wallet} divider cols="sm:grid-cols-2">

          <Input
            label="Price"
            name="price"
            type="number"
            value={medicine.price}
            onChange={handleChange}
            placeholder="0.00"
            prefix="₹"
            required
          />

          <Input
            label="Stock Quantity"
            name="stock"
            type="number"
            value={medicine.stock}
            onChange={handleChange}
            placeholder="Enter stock quantity"
            required
          />

        </FormSection>

        {/* Actions */}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 dark:border-gray-800 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Back
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#3979E2] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2d64c2] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Add to Inventory"}
          </button>
        </div>

      </form>

    </div>
  );
};

const FormSection = ({ title, icon: Icon, divider = false, cols = "md:grid-cols-2 lg:grid-cols-3", children }) => (
  <section className={`mb-8 ${divider ? "border-t border-slate-100 pt-8 dark:border-gray-800" : ""}`}>

    <div className="mb-4 flex items-center gap-3">
      {Icon && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#3979E2] dark:bg-blue-900/20 dark:text-[#7fb1ff]">
          <Icon size={16} />
        </span>
      )}
      <h2 className="text-base font-semibold text-slate-800 dark:text-white">
        {title}
      </h2>
    </div>

    <div className={`grid gap-5 ${cols}`}>
      {children}
    </div>

  </section>
);

const Input = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  prefix,
}) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-gray-300">
      {label}
      {required && <span className="ml-1 text-red-500 dark:text-red-400">*</span>}
    </label>

    <div className="relative">
      {prefix && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-gray-500">
          {prefix}
        </span>
      )}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full rounded-lg border border-slate-200 bg-white py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#3979E2] focus:ring-2 focus:ring-blue-100 dark:border-gray-800 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-600 dark:focus:border-[#418AFF] dark:focus:ring-blue-900/30 ${
          prefix ? "pl-7 pr-4" : "px-4"
        }`}
      />
    </div>
  </div>
);

const Textarea = ({ label, name, value, onChange, placeholder, rows = 3 }) => (
  <div className="md:col-span-2 lg:col-span-3">
    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-gray-300">
      {label}
    </label>

    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#3979E2] focus:ring-2 focus:ring-blue-100 dark:border-gray-800 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-600 dark:focus:border-[#418AFF] dark:focus:ring-blue-900/30"
    />
  </div>
);

const Select = ({
  label,
  name,
  value,
  onChange,
  options,
}) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-gray-300">
      {label}
    </label>

    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#3979E2] focus:ring-2 focus:ring-blue-100 dark:border-gray-800 dark:bg-white/5 dark:text-white dark:focus:border-[#418AFF] dark:focus:ring-blue-900/30"
    >
      <option value="" className="dark:bg-[#00091E]">Select category</option>

      {options.map((option) => (
        <option key={option} value={option} className="dark:bg-[#00091E]">
          {option}
        </option>
      ))}
    </select>
  </div>
);

export default AddMedicine;