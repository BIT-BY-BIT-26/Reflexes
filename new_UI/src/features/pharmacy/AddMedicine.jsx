import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  FilePenLine,
  ShieldCheck,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import WebcamMedicineOCR from "./WebcamMedicineOCR";
import PageHeader from "../../components/layout/PageHeader";
import { addMedicine } from "../../api/backend";
import { queryKeys } from "../../hooks/queries/queryKeys";

/*
  Two ways into the inventory: type it in, or scan the strip.

  Field names match the Medicine schema exactly (medicineName / stock / price,
  not name / quantity / mrp) because both paths POST to the same
  /pharmacy/add-medicine route - the OCR screen already did, the manual form
  used to only console.log a differently-shaped object.

  Dates go as MM/YYYY: the server parses them with parseMonthYear and rejects
  anything else, so the same check runs here first.
*/

const initialMedicine = {
  medicineName: "",
  strength: "",
  batchNumber: "",
  manufacturingDate: "",
  expiryDate: "",
  price: "",
  stock: "",
  category: "",
  manufacturer: "",
  description: "",
};

const MONTH_YEAR = /^(0?[1-9]|1[0-2])[/.-]\d{4}$/;

const AddMedicine = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [method, setMethod] = useState(null);
  const [medicine, setMedicine] = useState(initialMedicine);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setMedicine((prev) => ({ ...prev, [name]: value }));
  };

  // The OCR screen saves the batch itself, so this only refreshes and exits.
  const handleOCRSaved = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.pharmacyInventory });
    setMedicine(initialMedicine);
    setMethod(null);
    navigate("/pharmacy-dashboard/medicines");
  };

  const validateMedicine = () => {
    if (!medicine.medicineName.trim()) {
      toast.error("Medicine name is required.");
      return false;
    }

    if (!medicine.batchNumber.trim()) {
      toast.error("Batch number is required.");
      return false;
    }

    if (!MONTH_YEAR.test(medicine.manufacturingDate.trim())) {
      toast.error("Manufacturing date must be in MM/YYYY format.");
      return false;
    }

    if (!MONTH_YEAR.test(medicine.expiryDate.trim())) {
      toast.error("Expiry date must be in MM/YYYY format.");
      return false;
    }

    if (medicine.price === "" || Number(medicine.price) < 0) {
      toast.error("Enter a valid price.");
      return false;
    }

    if (medicine.stock === "" || Number(medicine.stock) < 0) {
      toast.error("Enter a valid stock quantity.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateMedicine()) return;

    try {
      setSaving(true);

      await addMedicine({ ...medicine, addedVia: "MANUAL" });

      queryClient.invalidateQueries({ queryKey: queryKeys.pharmacyInventory });

      toast.success("Medicine added to inventory.");

      setMedicine(initialMedicine);
      setMethod(null);

      navigate("/pharmacy-dashboard/medicines");
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.msg ||
          error?.response?.data?.message ||
          "Failed to add medicine."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!method) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="Pharmacy"
          title="Add Medicine"
          description="Choose how this batch goes into the inventory. Either way it is stored per batch number."
        >
          <button
            onClick={() => navigate("/pharmacy-dashboard")}
            className="inline-flex items-center gap-2 rounded-control border border-outline-variant px-4 py-2.5 text-body-md font-medium text-on-surface transition hover:bg-surface-container"
          >
            <ArrowLeft size={16} />
            Back to overview
          </button>
        </PageHeader>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Manual */}
          <button
            onClick={() => setMethod("manual")}
            className="group flex flex-col rounded-card border border-outline-variant bg-surface-lowest p-6 text-left transition hover:border-primary"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-control bg-primary-container/20 text-primary">
              <FilePenLine size={22} />
            </span>

            <span className="mt-5 flex items-start justify-between gap-3">
              <span>
                <span className="block font-display text-headline-sm text-on-surface">
                  Enter manually
                </span>
                <span className="mt-1 block text-body-md text-on-surface-variant">
                  Type the batch details straight into the inventory.
                </span>
              </span>

              <ArrowRight
                size={20}
                className="mt-1 flex-none text-primary transition group-hover:translate-x-1"
              />
            </span>

            <span className="mt-5 flex flex-col gap-2">
              <Feature text="Full control over every field" />
              <Feature text="Price, stock, batch and expiry in one form" />
              <Feature text="Best for a single batch" />
            </span>
          </button>

          {/* OCR */}
          <button
            onClick={() => setMethod("ocr")}
            className="group relative flex flex-col rounded-card border border-outline-variant bg-surface-lowest p-6 text-left transition hover:border-primary"
          >
            <span className="absolute right-6 top-6 rounded-pill bg-secondary-container px-3 py-1 text-label-md font-medium text-on-secondary-container">
              Recommended
            </span>

            <span className="flex h-12 w-12 items-center justify-center rounded-control bg-secondary-container text-on-secondary-container">
              <Camera size={22} />
            </span>

            <span className="mt-5 flex items-start justify-between gap-3">
              <span>
                <span className="block font-display text-headline-sm text-on-surface">
                  Scan with the webcam
                </span>
                <span className="mt-1 block text-body-md text-on-surface-variant">
                  Capture the strip and let the analyser fill the fields in.
                </span>
              </span>

              <ArrowRight
                size={20}
                className="mt-1 flex-none text-secondary transition group-hover:translate-x-1"
              />
            </span>

            <span className="mt-5 flex flex-col gap-2">
              <Feature text="Capture the medicine package on camera" />
              <Feature text="Details are extracted automatically" />
              <Feature text="Review and correct before saving" />
            </span>
          </button>
        </div>

        <div className="flex gap-3 rounded-card border border-outline-variant bg-surface-container px-5 py-4">
          <ShieldCheck size={20} className="mt-0.5 flex-none text-primary" />

          <div>
            <h3 className="text-title-card text-on-surface">Review before saving</h3>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Scanned details are a starting point, not a source of truth. Check the batch number,
              expiry and strength against the pack before adding it to stock.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (method === "ocr") {
    return (
      <WebcamMedicineOCR
        onBack={() => setMethod(null)}
        onExtract={handleOCRSaved}
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
  <span className="flex items-center gap-2 text-body-sm text-on-surface-variant">
    <CheckCircle2 size={15} className="flex-none text-primary" />
    {text}
  </span>
);

const ManualMedicineForm = ({ medicine, handleChange, handleSubmit, saving, onBack }) => {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Pharmacy"
        title="Add Medicine Manually"
        description="Every batch is stored separately, so a batch number can only be used once."
      >
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-control border border-outline-variant px-4 py-2.5 text-body-md font-medium text-on-surface transition hover:bg-surface-container"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </PageHeader>

      <form
        onSubmit={handleSubmit}
        className="rounded-card border border-outline-variant bg-surface-lowest p-6"
      >
        <FormSection title="Medicine">
          <Input
            label="Medicine name"
            name="medicineName"
            value={medicine.medicineName}
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

          <Input
            label="Manufacturer"
            name="manufacturer"
            value={medicine.manufacturer}
            onChange={handleChange}
            placeholder="e.g. Cipla"
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
        </FormSection>

        <FormSection title="Batch & expiry">
          <Input
            label="Batch number"
            name="batchNumber"
            value={medicine.batchNumber}
            onChange={handleChange}
            placeholder="e.g. AB12345"
            required
          />

          <Input
            label="Manufacturing date"
            name="manufacturingDate"
            value={medicine.manufacturingDate}
            onChange={handleChange}
            placeholder="MM/YYYY"
            hint="Month and year, e.g. 03/2025"
            required
          />

          <Input
            label="Expiry date"
            name="expiryDate"
            value={medicine.expiryDate}
            onChange={handleChange}
            placeholder="MM/YYYY"
            hint="Month and year, e.g. 09/2027"
            required
          />
        </FormSection>

        <FormSection title="Stock & price">
          <Input
            label="Price per unit"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={medicine.price}
            onChange={handleChange}
            placeholder="0.00"
            required
          />

          <Input
            label="Stock quantity"
            name="stock"
            type="number"
            min="0"
            value={medicine.stock}
            onChange={handleChange}
            placeholder="Units in this batch"
            required
          />
        </FormSection>

        <section className="mb-6">
          <h2 className="mb-4 font-display text-headline-sm text-on-surface">Notes</h2>

          <label className="mb-2 block text-label-md font-medium text-on-surface-variant">
            Description
          </label>

          <textarea
            name="description"
            value={medicine.description}
            onChange={handleChange}
            rows={3}
            placeholder="Storage instructions, composition, anything worth recording"
            className="w-full resize-none rounded-control border border-outline-variant bg-surface-lowest px-4 py-2.5 text-body-md text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary"
          />
        </section>

        <div className="flex justify-end gap-3 border-t border-outline-variant pt-6">
          <button
            type="button"
            onClick={onBack}
            className="rounded-control border border-outline-variant px-5 py-2.5 text-body-md font-medium text-on-surface transition hover:bg-surface-container"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-control bg-primary px-6 py-2.5 text-body-md font-semibold text-on-primary transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving…" : "Add to inventory"}
          </button>
        </div>
      </form>
    </div>
  );
};

const FormSection = ({ title, children }) => (
  <section className="mb-6">
    <h2 className="mb-4 font-display text-headline-sm text-on-surface">{title}</h2>

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>
  </section>
);

const Input = ({ label, hint, required = false, type = "text", ...props }) => (
  <div>
    <label className="mb-2 block text-label-md font-medium text-on-surface-variant">
      {label}
      {required && <span className="ml-1 text-error">*</span>}
    </label>

    <input
      type={type}
      required={required}
      {...props}
      className="w-full rounded-control border border-outline-variant bg-surface-lowest px-4 py-2.5 text-body-md text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary"
    />

    {hint && <p className="mt-1.5 text-body-sm text-on-surface-variant">{hint}</p>}
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div>
    <label className="mb-2 block text-label-md font-medium text-on-surface-variant">{label}</label>

    <select
      {...props}
      className="w-full rounded-control border border-outline-variant bg-surface-lowest px-4 py-2.5 text-body-md text-on-surface outline-none transition focus:border-primary"
    >
      <option value="">Select a category</option>

      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

export default AddMedicine;
