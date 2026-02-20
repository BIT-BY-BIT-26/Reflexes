import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { useState } from "react";
import { X } from "lucide-react";

export default function AddDepartmentPopup({ open, onClose }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post("http://localhost:3000/api/departments", {
        name,
        description,
      });

      alert("✅ Department created successfully");

      setName("");
      setDescription("");
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed z-50 inset-0 flex items-center justify-center"
          >
            <div
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-black"
              >
                <X />
              </button>

              <h2 className="text-2xl font-bold mb-4 text-teal-600">
                Add New Department
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">
                    Department Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full border rounded-xl px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="e.g. Cardiology"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="w-full border rounded-xl px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="Department description"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-500
                    text-white py-2 rounded-xl font-semibold hover:scale-105 transition"
                >
                  {loading ? "Creating..." : "Create Department"}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
