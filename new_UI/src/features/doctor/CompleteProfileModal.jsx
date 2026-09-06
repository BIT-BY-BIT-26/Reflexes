import { useEffect, useState } from "react";
import { BadgeCheck, X } from "lucide-react";
import { getAllDepartments, submitProfile } from "../../api/backend";

/*
  Doctor profile form. Field names, the comma-splitting, the Number() casts, the
  onlineAvailability shape and the submit → refreshDoctorStatus() → onClose()
  sequence are all unchanged; only the markup is new.
*/

export default function CompleteProfileModal({ onClose, refreshDoctorStatus }) {
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    position: "",
    department: "",
    experience: "",
    registrationNumber: "",
    consultationFee: "",
    specialisations: "",
    languages: "",

    onlineAvailability: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
  });

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await getAllDepartments();
      setDepartments(res.data.departments);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleDay = (day) => {
    setFormData((prev) => ({
      ...prev,
      onlineAvailability: {
        ...prev.onlineAvailability,
        [day]: !prev.onlineAvailability[day],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      position: formData.position,
      department: formData.department,
      experience: Number(formData.experience),

      specialisations: formData.specialisations
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),

      onlineAvailability: formData.onlineAvailability,

      registrationNumber: formData.registrationNumber,

      consultationFee: Number(formData.consultationFee),

      languages: formData.languages
        .split(",")
        .map((lang) => lang.trim())
        .filter(Boolean),
    };

    console.log("PROFILE PAYLOAD:", payload);

    try {
      await submitProfile(payload);
      await refreshDoctorStatus();
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-inverse-surface/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-card border border-outline-variant bg-surface-lowest shadow-panel">
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-outline-variant px-6 py-5">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-control bg-primary text-on-primary">
            <BadgeCheck size={20} />
          </span>

          <div className="min-w-0 flex-1">
            <h2 className="font-display text-headline-sm text-on-surface">
              Complete your profile
            </h2>
            <p className="mt-0.5 text-body-md text-on-surface-variant">
              Unlocks OPD, appointments and patient management.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-control p-1.5 text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              name="position"
              value={formData.position}
              onChange={handleChange}
              label="Position"
              placeholder="Junior Consultant"
            />

            <div>
              <label className="mb-1.5 block text-label-md text-on-surface-variant">
                Department
              </label>

              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full rounded-control border border-outline-variant bg-surface-container px-3 py-2.5 text-body-md text-on-surface outline-none transition focus:border-primary"
              >
                <option value="">Select Department</option>

                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <InputField
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              label="Experience (Years)"
              type="number"
              placeholder="5"
            />

            <InputField
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              label="Registration Number"
              placeholder="MED-1256"
            />

            <InputField
              name="consultationFee"
              value={formData.consultationFee}
              onChange={handleChange}
              label="Consultation Fee"
              type="number"
              placeholder="800"
            />

            <InputField
              name="specialisations"
              value={formData.specialisations}
              onChange={handleChange}
              label="Specialisations"
              placeholder="Cardiology, Interventional Cardiology"
            />

            <InputField
              name="languages"
              value={formData.languages}
              onChange={handleChange}
              label="Languages"
              placeholder="English, Hindi"
            />

            {/* Online availability */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-label-md text-on-surface-variant">
                Online consultation availability
              </label>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {days.map((day) => {
                  const active = formData.onlineAvailability[day];

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`flex items-center justify-between gap-2 rounded-control border px-3 py-2.5 text-body-md capitalize transition ${
                        active
                          ? "border-primary bg-primary-container/15 text-primary"
                          : "border-outline-variant bg-surface-container text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span>{day}</span>
                      <span
                        className={`h-3.5 w-3.5 rounded-pill ${
                          active ? "bg-primary" : "bg-outline-variant"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <p className="mt-2 text-body-sm text-on-surface-variant">
                Select the days on which you accept online consultations.
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-outline-variant px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-control border border-outline-variant px-4 py-2.5 text-body-md font-medium text-on-surface transition hover:bg-surface-container"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-control bg-primary px-6 py-2.5 text-body-md font-semibold text-on-primary transition hover:brightness-110"
          >
            Complete Profile
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="mb-1.5 block text-label-md text-on-surface-variant">{label}</label>

      <input
        name={name}
        value={value || ""}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-control border border-outline-variant bg-surface-container px-3 py-2.5 text-body-md text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary"
      />
    </div>
  );
}
