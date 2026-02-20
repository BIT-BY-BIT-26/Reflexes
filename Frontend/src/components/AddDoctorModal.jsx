import { useState } from "react";
import api from "../api/axios";

export default function AddDoctorModal({ open, onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const res = await api.post("/doctors/add-doctor", form);

      alert(res.data.msg || "Doctor added successfully");
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Unauthorized");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">
          Register New Doctor
        </h2>

        <input name="name" placeholder="Doctor Name" onChange={handleChange} className="w-full border p-2 mb-3" />
        <input name="email" placeholder="Email" onChange={handleChange} className="w-full border p-2 mb-3" />
        <input name="phone_number" placeholder="Phone Number" onChange={handleChange} className="w-full border p-2 mb-4" />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="border px-4 py-2 rounded">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="bg-teal-600 text-white px-4 py-2 rounded">
            {loading ? "Adding..." : "Add Doctor"}
          </button>
        </div>
      </div>
    </div>
  );
}
