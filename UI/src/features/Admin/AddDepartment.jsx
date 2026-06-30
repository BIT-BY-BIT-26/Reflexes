import React, { useState } from "react";
import { addDepartment } from "../../api/backend";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AddDepartment = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDepartment(formData);
      setFormData({ name: "", description: "" });

      // 🔥 navigate after success
      navigate("/hospital-dashboard");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

      {/* Modal Box */}
      <div className="w-full max-w-lg bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 p-6 relative animate-fadeIn">

        {/* Close Button */}
        <button
          onClick={() => navigate("/hospital-dashboard/departments")}   // 🔥 FIX
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold text-blue-400">
          Add Department
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Create a new hospital department
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">

          {/* Name */}
          <div>
            <label className="text-sm text-slate-300">Department Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-slate-300">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3">

            {/* Cancel */}
            <button
              type="button"
              onClick={() => navigate("/hospital-dashboard/departments")} // 🔥 FIX
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition"
            >
              Cancel
            </button>

            {/* Submit */}
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold"
            >
              Create Department
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default AddDepartment;