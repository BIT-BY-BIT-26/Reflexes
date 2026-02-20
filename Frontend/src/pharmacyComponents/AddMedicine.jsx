import React, { useState } from "react";
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
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/pharmacy/add", {
    name: form.name,
    brand: form.brand,
    category: form.category,
    dosage: form.dosage,
    description: form.description,
    price: Number(form.price),
    quantity: Number(form.quantity),
    expiryDate: form.expiryDate,
    });

      alert("Medicine added ✅");

      onMedicineAdded(res.data.newInventory); // update table
      closeModal();
    } catch (err) {
      console.log(err.response.data);
      alert("Failed to add medicine");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4">Add Medicine</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="name"
            placeholder="Medicine Name"
            required
            className="w-full border p-2 rounded"
            onChange={handleChange}
          />
        <input name="brand" placeholder="Brand" className="input" onChange={handleChange} />
        <input name="category" placeholder="Category" className="input" onChange={handleChange} />
        <input name="dosage" placeholder="Dosage (e.g. 500mg)" className="input" onChange={handleChange} />
        <input name="description" placeholder="Description" className="input" onChange={handleChange} />
          <input
            type="number"
            name="price"
            placeholder="Price"
            required
            className="w-full border p-2 rounded"
            onChange={handleChange}
          />

          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            required
            className="w-full border p-2 rounded"
            onChange={handleChange}
          />

          <input
            type="date"
            name="expiryDate"
            required
            className="w-full border p-2 rounded"
            onChange={handleChange}
          />

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicineModal;