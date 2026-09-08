import React, { useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { addDoctor } from "../../api/backend";
import { toast } from "react-toastify";

/*
  Add-doctor modal. Same POST /doctors/add-doctor, same three fields, same
  success path (toast → clear → navigate to the directory).

  Email and phone are now single-line <input>s rather than <textarea>s - same
  name/value/onChange wiring and the same payload, they just no longer accept
  line breaks.
*/

const AddDoctor = () => {
  console.log("enterred");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number:""
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
      const res = await addDoctor(formData);
      if (res.data.success) {
        toast.success(res.data.message || "Doctor created successfully"
        );
      setFormData({ name: "", email: "", phone_number: "" });
      navigate("/hospital-dashboard/doctors");
    }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || error.message || "Soemthing went wrong"
      )
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
            <h2 className="font-display text-headline-sm text-on-surface">Add doctor</h2>
            <p className="mt-0.5 text-body-md text-on-surface-variant">
              Create a new doctor account for this hospital
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={() => navigate("/hospital-dashboard/doctors")}   // 🔥 FIX
            className="rounded-control p-1.5 text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5">

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-label-md text-on-surface-variant">Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ananya Rao"
              className={field}
              required
            />
          </div>

          {/* Email */}
          <div className="mt-4">
            <label className="mb-1.5 block text-label-md text-on-surface-variant">Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ananya.rao@hospital.in"
              className={field}
            />
          </div>

          {/* Phone number */}
          <div className="mt-4">
            <label className="mb-1.5 block text-label-md text-on-surface-variant">
              Phone number
            </label>
            <input
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+91 98200 41122"
              className={field}
            />
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-2">

            {/* Cancel */}
            <button
              type="button"
              onClick={() => navigate("/hospital-dashboard/doctors")} // 🔥 FIX
              className="rounded-control border border-outline-variant px-4 py-2.5 text-body-md font-medium text-on-surface transition hover:bg-surface-container"
            >
              Cancel
            </button>

            {/* Submit */}
            <button
              type="submit"
              className="rounded-control bg-primary px-5 py-2.5 text-body-md font-semibold text-on-primary transition hover:brightness-110"
            >
              Create doctor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctor;
