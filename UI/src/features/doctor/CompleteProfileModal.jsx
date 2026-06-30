import { useEffect, useState } from "react";
import { TbBadgeFilled } from "react-icons/tb";
import { getAllDepartments, submitProfile } from "../../api/backend";

export default function CompleteProfileModal({onClose,refreshDoctorStatus}) {
    const [departments,setDepartments] = useState([]);
    useEffect(()=>{
        fetchDepartments();
    },[]);
    const fetchDepartments = async()=>{
        try{
            const res = await getAllDepartments();
            setDepartments(res.data.departments);
        }catch(error){
            console.log(error);
        }
    }
    const [formData,setFormData] =useState({
        position: "",
        department: "",

        experience: "",
        registrationNumber: "",
        consultationFee: "",

        opdFrom: "",
        opdTo: "",

        specialisations: "",
        languages: "",

        availableDays: [],
    });
    const handleChange = (e)=>{
        const {name,value} = e.target;
        setFormData((prev)=>({
            ...prev,
            [name]:value,
        }))
    }

    const handleSubmit = async(e)=>{
        e.preventDefault();
        const payload = {
            position:formData.position,
            department:formData.department,
            experience : Number(formData.experience),
            opd_timing:{
                from:formData.opdFrom,
                to:formData.opdTo,
            },
            specialisations: formData.specialisations
            .split(",")
            .map(item => item.trim())
            .filter(Boolean),
            languages:formData.languages.split(",").map((lang)=>lang.trim()),
            registrationNumber:formData.registrationNumber,
            consultationFee:Number(formData.consultationFee),
            availableDays:formData.availableDays,
        }
        try{
            const res = await submitProfile(payload);
            await refreshDoctorStatus();
            onClose();
        }catch(error){
            console.log(error);
        }
    }


    const toggleDay = (day)=>{
        setFormData((prev)=>({
            ...prev,
            availableDays:prev.availableDays.includes(day)
            ?prev.availableDays.filter((d)=>d!==day):[...prev.availableDays,day],
        }));
    };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Modal */}
      <div className="relative w-full max-w-4xl mx-4 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          ✕
        </button>
        {/* Header */}
        <div className="border-b border-slate-800 p-8">
          <div className="flex items-center gap-4">
            <TbBadgeFilled
              size={35}
              className="text-blue-400"
            />

            <div>
              <h2 className="text-2xl font-bold text-white">
                Complete Your Profile
              </h2>

              <p className="text-slate-400 mt-1">
                Complete your profile to unlock OPD,
                appointments and patient management.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">

          <div className="grid md:grid-cols-2 gap-5">

            {/* Position */}
            <InputField
            name="position"
            value={formData.position}
            onChange={handleChange}
              label="Position"
              placeholder="Senior Consultant"
            />

            <div>
                <label htmlFor="" className="block text-sm text-slate-400 mb-2">
                    Department
                </label>
                <select name="department" value={formData.department || ""} onChange={handleChange} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white" id="">
                    <option value="">Select Department</option>
                    {departments.map((dept)=>(
                        <option key={dept._id} value={dept._id}>
                            {dept.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Experience */}
            <InputField
            name="experience"
            onChange={handleChange}
            value={formData.experience}
              label="Experience (Years)"
              type="number"
              placeholder="10"
            />

            {/* Registration */}
            <InputField
            name="registrationNumber"
            onChange={handleChange}
            value={formData.registrationNumber}
              label="Registration Number"
              placeholder="NMC123456"
            />

            {/* Fee */}
            <InputField
            name="consultationFee"
            value={formData.consultationFee}
            onChange={handleChange}
              label="Consultation Fee"
              type="number"
              placeholder="500"
            />

            {/* OPD Timing */}
            <InputField
            name="opdFrom"
            value={formData.opdFrom}
            onChange={handleChange}
              label="OPD From"
              type="time"
            />

            <InputField
            name="opdTo"
            value={formData.opdTo}
            onChange={handleChange}
              label="OPD To"
              type="time"
            />

            {/* Specialisations */}
            <div className="md:col-span-2">
              <InputField
                value={formData.specialisations}
                onChange={handleChange}
                name="specialisations"
                label="Specialisations"
                placeholder="Cardiology, Neurology"
              />
            </div>

            {/* Languages */}
            <div className="md:col-span-2">
              <InputField
                name="languages"
                value={formData.languages}
                onChange={handleChange}
                label="Languages"
                placeholder="Hindi, English"
              />
            </div>

            {/* Available Days */}
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-400 mb-2">
                Available Days
              </label>

              <div className="flex flex-wrap gap-3">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <button
                  onClick={()=>toggleDay(day)}
                    key={day}
                    type="button"
                    className={`px-4 py-2 rounded-xl border transition ${
                        formData.availableDays.includes(day)
                        ? "border-blue-500 text-blue-400"
                        : "border-slate-700 text-slate-300"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-white font-semibold"
            >
              Complete Profile
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-2">
        {label}
      </label>

      <input
        name={name}
        value={value || ""}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className="
          w-full
          bg-slate-900
          border
          border-slate-800
          rounded-xl
          px-4
          py-3
          text-white
          placeholder:text-slate-500
          focus:outline-none
          focus:border-blue-500
        "
      />
    </div>
  );
}