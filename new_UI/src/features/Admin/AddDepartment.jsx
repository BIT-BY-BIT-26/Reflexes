import React, { useEffect, useState } from "react";
import { addDepartment, getDepartmentList } from "../../api/backend";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

/*
  Add-department modal. Unchanged: the master list comes from
  GET /departments/list, submit posts to POST /departments, and on success it
  toasts, clears the form and navigates to /hospital-dashboard. Close and Cancel
  both go back to /hospital-dashboard/departments, as before.
*/

const AddDepartment = () => {
    console.log("AddDepartment Rendered");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

useEffect(() => {
  const fetchDepartments = async () => {
    try {
      const res = await getDepartmentList();
      setDepartmentOptions(res.data.departments);
      console.log(res.data);
      console.log(departmentOptions);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingList(false);
    }
  };

  fetchDepartments();
}, []);


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res =await addDepartment(formData);
      console.log("Response:",res);
      if(res.data.success){
        toast.success(res.data.message || "Department created successfully");
        setFormData({ name: "", description: "" });
        // 🔥 navigate after success
        navigate("/hospital-dashboard");
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    }
  };

  const field =
    "w-full rounded-control border border-outline-variant bg-surface-container px-3 py-2.5 text-body-md text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-inverse-surface/60 backdrop-blur-sm" />

      {/* Modal Box */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-card border border-outline-variant bg-surface-lowest shadow-panel">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-outline-variant px-6 py-5">
          <div>
            <h2 className="font-display text-headline-sm text-on-surface">Add department</h2>
            <p className="mt-0.5 text-body-md text-on-surface-variant">
              Create a new hospital department
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={() => navigate("/hospital-dashboard/departments")}   // 🔥 FIX
            className="rounded-control p-1.5 text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5">

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-label-md text-on-surface-variant">
              Department name
            </label>
            <select
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={field}
              required
            >
              <option value="" disabled>{loadingList?"Loading departments...":"Select department"}</option>
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select >
          </div>

          {/* Description */}
          <div className="mt-4">
            <label className="mb-1.5 block text-label-md text-on-surface-variant">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={field}
            />
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-2">

            {/* Cancel */}
            <button
              type="button"
              onClick={() => navigate("/hospital-dashboard/departments")} // 🔥 FIX
              className="rounded-control border border-outline-variant px-4 py-2.5 text-body-md font-medium text-on-surface transition hover:bg-surface-container"
            >
              Cancel
            </button>

            {/* Submit */}
            <button
              type="submit"
              className="rounded-control bg-primary px-5 py-2.5 text-body-md font-semibold text-on-primary transition hover:brightness-110"
            >
              Create department
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default AddDepartment;
