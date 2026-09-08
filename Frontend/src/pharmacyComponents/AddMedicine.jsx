// import React, { useState } from "react";
// import api from "../api/axios";

// const AddMedicineModal = ({ closeModal, onMedicineAdded }) => {
//   const [form, setForm] = useState({
//   name: "",
//   brand: "",
//   category: "",
//   dosage: "",
//   description: "",
//   price: "",
//   quantity: "",
//   expiryDate: "",
// });
//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const res = await api.post("/pharmacy/add", {
//     name: form.name,
//     brand: form.brand,
//     category: form.category,
//     dosage: form.dosage,
//     description: form.description,
//     price: Number(form.price),
//     quantity: Number(form.quantity),
//     expiryDate: form.expiryDate,
//     });

//       alert("Medicine added ✅");

//       onMedicineAdded(res.data.newInventory); // update table
//       closeModal();
//     } catch (err) {
//       console.log(err.response.data);
//       alert("Failed to add medicine");
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
//       <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
//         <h2 className="text-xl font-bold mb-4">Add Medicine</h2>

//         <form onSubmit={handleSubmit} className="space-y-3">
//           <input
//             type="text"
//             name="name"
//             placeholder="Medicine Name"
//             required
//             className="w-full border p-2 rounded"
//             onChange={handleChange}
//           />
//         <input name="brand" placeholder="Brand" className="input" onChange={handleChange} />
//         <input name="category" placeholder="Category" className="input" onChange={handleChange} />
//         <input name="dosage" placeholder="Dosage (e.g. 500mg)" className="input" onChange={handleChange} />
//         <input name="description" placeholder="Description" className="input" onChange={handleChange} />
//           <input
//             type="number"
//             name="price"
//             placeholder="Price"
//             required
//             className="w-full border p-2 rounded"
//             onChange={handleChange}
//           />

//           <input
//             type="number"
//             name="quantity"
//             placeholder="Quantity"
//             required
//             className="w-full border p-2 rounded"
//             onChange={handleChange}
//           />

//           <input
//             type="date"
//             name="expiryDate"
//             required
//             className="w-full border p-2 rounded"
//             onChange={handleChange}
//           />

//           <div className="flex justify-end gap-3 mt-4">
//             <button
//               type="button"
//               onClick={closeModal}
//               className="px-4 py-2 bg-gray-300 rounded"
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               className="px-4 py-2 bg-blue-600 text-white rounded"
//             >
//               Add
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddMedicineModal;


import React, { useState } from "react";
import { X, Pill, Plus, Loader2 } from "lucide-react";
import api from "../api/axios";

const AddMedicineModal = ({ closeModal, onMedicineAdded }) => {
  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "",
    dosage: "",
    description: "",
    price: "",
    quantity: "",
    expiryDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/pharmacy/add", {
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity),
      });

      onMedicineAdded(res.data.newInventory);
      closeModal();
    } catch (err) {
      console.log(err.response?.data);

      setError(
        err.response?.data?.message ||
          "Failed to add medicine. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/50
        px-4
        py-6
        backdrop-blur-sm
      "
    >
      <div
        className="
          w-full max-w-xl
          max-h-[92vh]
          overflow-y-auto
          rounded-2xl
          border border-gray-200
          bg-white
          shadow-2xl
          transition-colors duration-300

          dark:border-slate-700
          dark:bg-slate-900
        "
      >
        {/* ================= HEADER ================= */}
        <div
          className="
            sticky top-0 z-10
            flex items-center justify-between
            border-b border-gray-200
            bg-white
            px-6 py-5

            dark:border-slate-700
            dark:bg-slate-900
          "
        >
          <div className="flex items-center gap-3">

            {/* Icon */}
            <div
              className="
                flex h-11 w-11
                items-center justify-center
                rounded-xl
                bg-blue-100
                text-blue-600

                dark:bg-blue-500/10
                dark:text-blue-400
              "
            >
              <Pill size={22} />
            </div>

            {/* Title */}
            <div>
              <h2
                className="
                  text-lg font-bold
                  text-slate-800
                  dark:text-white
                "
              >
                Add Medicine
              </h2>

              <p
                className="
                  text-xs
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Add a new medicine to your inventory
              </p>
            </div>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={closeModal}
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-lg
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700

              dark:hover:bg-slate-800
              dark:hover:text-white
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* ================= FORM ================= */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">

          {/* Error */}
          {error && (
            <div
              className="
                rounded-lg
                border border-red-200
                bg-red-50
                px-4 py-3
                text-sm text-red-600

                dark:border-red-900/50
                dark:bg-red-950/30
                dark:text-red-400
              "
            >
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3
              className="
                mb-3 text-sm font-semibold
                text-slate-800
                dark:text-white
              "
            >
              Basic Information
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <InputField
                name="name"
                label="Medicine Name"
                placeholder="e.g. Paracetamol"
                onChange={handleChange}
                required
              />

              <InputField
                name="brand"
                label="Brand"
                placeholder="e.g. Crocin"
                onChange={handleChange}
              />

              <InputField
                name="category"
                label="Category"
                placeholder="e.g. Pain Relief"
                onChange={handleChange}
              />

              <InputField
                name="dosage"
                label="Dosage"
                placeholder="e.g. 500mg"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Description */}
          <InputField
            name="description"
            label="Description"
            placeholder="Enter a short description of the medicine..."
            onChange={handleChange}
            textarea
          />

          {/* Inventory */}
          <div>
            <h3
              className="
                mb-3 text-sm font-semibold
                text-slate-800
                dark:text-white
              "
            >
              Inventory Details
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <InputField
                type="number"
                name="price"
                label="Price"
                placeholder="0.00"
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                prefix="₹"
              />

              <InputField
                type="number"
                name="quantity"
                label="Quantity"
                placeholder="Enter quantity"
                onChange={handleChange}
                required
                min="0"
              />
            </div>
          </div>

          {/* Expiry Date */}
          <InputField
            type="date"
            name="expiryDate"
            label="Expiry Date"
            onChange={handleChange}
            required
          />

          {/* ================= BUTTONS ================= */}
          <div
            className="
              flex flex-col-reverse gap-3
              border-t border-gray-200
              pt-5

              sm:flex-row sm:justify-end

              dark:border-slate-700
            "
          >
            <button
              type="button"
              onClick={closeModal}
              disabled={loading}
              className="
                rounded-lg
                border border-gray-200
                bg-white
                px-5 py-2.5
                text-sm font-medium
                text-slate-700
                transition
                hover:bg-gray-50
                disabled:cursor-not-allowed
                disabled:opacity-50

                dark:border-slate-700
                dark:bg-slate-800
                dark:text-slate-200
                dark:hover:bg-slate-700
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                flex items-center
                justify-center
                gap-2
                rounded-lg
                bg-blue-600
                px-5 py-2.5
                text-sm font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-blue-700
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={17} />
                  Add Medicine
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =====================================================
   REUSABLE INPUT FIELD
===================================================== */

const InputField = ({
  name,
  label,
  placeholder,
  type = "text",
  onChange,
  required,
  textarea = false,
  prefix,
  min,
  step,
}) => {
  const baseClass = `
    w-full
    rounded-lg
    border border-gray-300
    bg-white
    px-3 py-2.5
    text-sm
    text-slate-800
    outline-none
    transition

    placeholder:text-slate-400

    focus:border-blue-500
    focus:ring-2
    focus:ring-blue-100

    dark:border-slate-700
    dark:bg-slate-800
    dark:text-white
    dark:placeholder:text-slate-500
    dark:focus:border-blue-500
    dark:focus:ring-blue-500/20
  `;

  return (
    <div className="w-full">

      {/* Label */}
      <label
        htmlFor={name}
        className="
          mb-1.5 block
          text-xs font-semibold
          text-slate-700
          dark:text-slate-300
        "
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      {/* Input */}
      {textarea ? (
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          required={required}
          onChange={onChange}
          rows={3}
          className={`${baseClass} resize-none`}
        />
      ) : (
        <div className="relative">

          {prefix && (
            <span
              className="
                absolute left-3 top-1/2
                -translate-y-1/2
                text-sm font-medium
                text-slate-500
                dark:text-slate-400
              "
            >
              {prefix}
            </span>
          )}

          <input
            id={name}
            type={type}
            name={name}
            placeholder={placeholder}
            required={required}
            onChange={onChange}
            min={min}
            step={step}
            className={`${baseClass} ${prefix ? "pl-8" : ""}`}
          />
        </div>
      )}
    </div>
  );
};

export default AddMedicineModal;

