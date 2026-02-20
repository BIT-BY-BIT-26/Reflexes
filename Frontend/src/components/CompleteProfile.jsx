import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import api from "../api/axios";

const CompleteProfile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    position: "",
    specialisation: "",
    experience: "",
    opdFrom: "",
    opdTo: "",
    departmentId: "", // ⚠️ required
  });

  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [departments,setDepartments] = useState([]);
  

  // 🔢 Completion %
  useEffect(() => {
    let filled = 0;
    Object.values(formData).forEach((v) => v && filled++);
    setCompletion(Math.round((filled / 6) * 100));
  }, [formData]);
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get("http://localhost:3000/api/departments");
        setDepartments(res.data.departments);
      } catch (error) {
        console.log("Department fetch error", error);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const token = localStorage.getItem("token");
        if (!token) {
            alert("You are not logged in!");
            navigate("/login");
            return;
            }
      await axios.post(
        "http://localhost:3000/api/doctors/doctor-profile",
        {
          position: formData.position,
          specialisation: formData.specialisation,
          experience: Number(formData.experience),
          departmentId: formData.departmentId,
          opd_timing: {
            from: formData.opdFrom,
            to: formData.opdTo,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("✅ Profile completed successfully");
      navigate("/doctor/dashboard");
    } catch (err) {
      alert(
        err?.response?.data?.message || "Profile submission failed"
      );
    } finally {
      setLoading(false);
    }
  };
  const options = departments.map((dept) => ({
  value: dept._id,
  label: dept.name
}));

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6">

        <h1 className="text-2xl font-semibold mb-1">
          Complete Your Profile
        </h1>
        <p className="text-gray-500 text-sm mb-4">
          Finish profile to start OPD queue
        </p>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span>Profile Completion</span>
            <span>{completion}%</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded">
            <div
              className="bg-teal-600 h-2 rounded"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="position"
            placeholder="Position"
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            name="specialisation"
            placeholder="Specialisation"
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="number"
            name="experience"
            placeholder="Experience (years)"
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />

       <Select
        options={options}
        onChange={(selected) =>
          setFormData({ ...formData, departmentId: selected.value })
        }
        maxMenuHeight={150}
      />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="time"
              name="opdFrom"
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="time"
              name="opdTo"
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <button
            disabled={completion < 100 || loading}
            className={`w-full py-3 rounded-lg text-white font-medium
              ${
                completion === 100
                  ? "bg-teal-600 hover:bg-teal-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            {loading ? "Submitting..." : "Save & Continue →"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
