import { useEffect, useState } from "react";
import api from "../api/axios";
import { motion } from "framer-motion";

export default function AllDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/doctors/get-doctors");
      console.log(res);
      setDoctors(res.data.doctors || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading doctors...</p>;
  }

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-6 mb-10">
      <h2 className="text-2xl font-bold mb-6">All Doctors</h2>

      <table className="w-full text-sm">
        <thead className="text-left text-gray-500 border-b">
          <tr>
            <th className="p-4">Name</th>
            <th className="p-4">Email</th>
            <th className="p-4">Phone</th>
            <th className="p-4">Status</th>
          </tr>
        </thead>
        
        <tbody>
            {doctors.map((doc, i) => (
                <motion.tr
                key={doc._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ backgroundColor: "#f0fdfa" }}
                className="border-b"
                >
                <td className="p-4 font-medium">
                    {doc.userId?.name || "N/A"}
                </td>

                <td className="p-4">
                    {doc.userId?.email || "N/A"}
                </td>

                <td className="p-4">
                    {doc.userId?.phone_number || "N/A"}
                </td>

                <td className="p-4">
                    <span
                    className={`px-3 py-1 rounded-full text-xs
                    ${
                        doc.isActive
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                    >
                    {doc.isActive ? "Active" : "Inactive"}
                    </span>
                </td>
                </motion.tr>
            ))}
            </tbody>
      </table>
    </div>
  );
}
