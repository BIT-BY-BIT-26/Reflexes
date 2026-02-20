import { useEffect, useState } from "react";
import api from "../api/axios";
import { motion } from "framer-motion";

export default function AllDepartments() {
  const [loading, setLoading] = useState(true);
  const [hospital, setHospital] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectDept, setSelectDept] = useState(null);
  const [formData,setFormData] = useState({
    name:"",
    description:"",
    isActive:true,
  });
  const handleUpdate = async()=>{
    try{
        await api.patch(`/departments/${selectDept._id}`,formData);
        setShowModal(false);
        fetchDepartments();
    }catch(err){
         res.status(500).json({
      success: false,
      message: err.message,
         })
    }
  }
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/departments/");

      setHospital(res.data.hospital);
      setDepartments(res.data.departments);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-gray-500 text-center">
        Loading departments...
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Departments</h1>
        {hospital && (
          <p className="text-gray-500">
            Hospital: <span className="font-medium">{hospital.name}</span>
          </p>
        )}
      </div>

      {/* Empty State */}
      {departments.length === 0 && (
        <div className="text-gray-400 text-center mt-10">
          No departments created yet
        </div>
      )}

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {departments.map((dept, index) => (
          <motion.div
            key={dept._id}
            onClick={()=>{
                setSelectDept(dept);
                setFormData({
                    name:dept.name,
                    description:dept.description || "",
                    isActive:dept.isActive
                })
                setShowModal(true);
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold capitalize">
              {dept.name}
            </h3>

            <p className="text-sm text-gray-400 mt-1">
              Created on{" "}
              {new Date(dept.createdAt).toLocaleDateString()}
            </p>
             {dept.description && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                {dept.description}
                </p>
            )}
            <span
              className={`inline-block mt-3 px-3 py-1 rounded-full text-xs
              ${
                dept.isActive
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {dept.isActive ? "Active" : "Inactive"}
            </span>
          </motion.div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Update Department</h2>

            {/* Name */}
            <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border p-2 rounded mb-3"
                placeholder="Department name"
            />

            {/* Description */}
            <textarea
                value={formData.description}
                onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
                }
                className="w-full border p-2 rounded mb-3"
                placeholder="Description"
            />

            {/* Status */}
            <select
                value={formData.isActive}
                onChange={(e) =>
                setFormData({
                    ...formData,
                    isActive: e.target.value === "true",
                })
                }
                className="w-full border p-2 rounded mb-4"
            >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
            </select>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
                <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
                >
                Cancel
                </button>

                <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                Update
                </button>
            </div>
            </div>
        </div>
        )}

    </div>
    
  );
}
