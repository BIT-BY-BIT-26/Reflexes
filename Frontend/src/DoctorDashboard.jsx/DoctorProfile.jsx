// import { useEffect, useState } from "react";
// import api from "../api/axios";
// import { motion } from "framer-motion";

// const DoctorProfile = () => {
//   const [doctor, setDoctor] = useState(null);
//   const [formData, setFormData] = useState({});
//   const [isEditing, setIsEditing] = useState(false);
//   const [photo, setPhoto] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [appointments, setAppointments] = useState([]);
//   const [showAppointments, setShowAppointments] = useState(false);

//   const fetchDoctorProfile = async () => {
//     try {
//       const res = await api.get("/doctors/me");
//       setDoctor(res.data.doctor);
//       setFormData(res.data.doctor);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const fetchAppointments = async () => {
//     if (showAppointments) return setShowAppointments(false);
//     try {
//       const res = await api.get("/doctors/appointments/completed");
//       setAppointments(res.data.appointments);
//       setShowAppointments(true);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   useEffect(() => {
//     fetchDoctorProfile();
//   }, []);

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handlePhotoChange = (e) => {
//     const file = e.target.files[0];
//     setPhoto(file);
//     setPreview(URL.createObjectURL(file));
//   };

//   const uploadPhoto = async () => {
//     if (!photo) return alert("Select photo first");
//     const data = new FormData();
//     data.append("photo", photo);

//     try {
//       await api.patch("/doctors/upload-photo", data);
//       await fetchDoctorProfile();
//       setPreview(null);
//       setPhoto(null);
//       alert("Photo updated");
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const handleSave = async () => {
//     try {
//       await api.patch("/doctors/update-profile", formData);
//       setDoctor({ ...doctor, ...formData });
//       setIsEditing(false);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   if (!doctor)
//     return <div className="text-white p-6 animate-pulse">Loading...</div>;

//   return (
//     <div className="p-6 max-w-6xl mx-auto text-white">

//       {/* ================= PROFILE CARD ================= */}
//       <motion.div
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 
//         rounded-2xl shadow-xl p-8"
//       >
//         {/* Header */}
//         <div className="flex flex-col md:flex-row items-center md:items-start gap-6">

//           {/* Avatar */}
//           <div className="flex flex-col items-center">
//             <img
//               src={
//                 preview ||
//                 (doctor.profile_photo
//                   ? doctor.profile_photo + "?t=" + Date.now()
//                   : "/default-doctor.png")
//               }
//               alt="doctor"
//               className="w-32 h-32 rounded-full object-cover border-4 border-blue-400 shadow-lg"
//             />

//             {isEditing && (
//               <>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handlePhotoChange}
//                   className="mt-3 text-sm"
//                 />
//                 {photo && (
//                   <button
//                     onClick={uploadPhoto}
//                     className="mt-2 bg-blue-600 px-4 py-1 rounded-lg hover:bg-blue-500"
//                   >
//                     Upload
//                   </button>
//                 )}
//               </>
//             )}
//           </div>

//           {/* Doctor Info */}
//           <div className="flex-1 text-center md:text-left">
//             <h2 className="text-3xl font-bold">
//               Dr. {doctor.userId?.name}
//             </h2>

//             <p className="text-blue-200 mt-1">
//               {doctor.department?.name} • {doctor.hospital?.name}
//             </p>

//             <span className="inline-block mt-2 bg-blue-700 px-3 py-1 rounded-full text-sm">
//               {doctor.specialisation}
//             </span>
//           </div>

//           {/* Edit Button */}
//           <button
//             onClick={() => setIsEditing(!isEditing)}
//             className="bg-purple-600 px-5 py-2 rounded-lg hover:bg-purple-500 transition"
//           >
//             {isEditing ? "Cancel" : "Edit"}
//           </button>
//         </div>

//         {/* ===== DETAILS GRID ===== */}
//         <div className="grid md:grid-cols-2 gap-5 mt-8">

//           <Field label="Position">
//             {isEditing ? (
//               <input
//                 name="position"
//                 value={formData.position || ""}
//                 onChange={handleChange}
//                 className="input"
//               />
//             ) : doctor.position}
//           </Field>

//           <Field label="Experience">
//             {isEditing ? (
//               <input
//                 name="experience"
//                 value={formData.experience || ""}
//                 onChange={handleChange}
//                 className="input"
//               />
//             ) : `${doctor.experience} years`}
//           </Field>

//           <Field label="Specialisation">
//             {isEditing ? (
//               <input
//                 name="specialisation"
//                 value={formData.specialisation || ""}
//                 onChange={handleChange}
//                 className="input"
//               />
//             ) : doctor.specialisation}
//           </Field>

//           <Field label="OPD Timing">
//             {doctor.opd_timing?.from} - {doctor.opd_timing?.to}
//           </Field>

//         </div>

//         {isEditing && (
//           <button
//             onClick={handleSave}
//             className="mt-6 bg-green-500 px-6 py-2 rounded-lg hover:bg-green-400"
//           >
//             Save Changes
//           </button>
//         )}
//       </motion.div>

//       {/* ================= COMPLETED APPOINTMENTS ================= */}
//       <div className="mt-8">

//         <button
//           onClick={fetchAppointments}
//           className="bg-purple-700 px-6 py-2 rounded-lg hover:bg-purple-600"
//         >
//           {showAppointments ? "Hide Completed" : "View Completed Appointments"}
//         </button>

//         {showAppointments && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="bg-blue-950 rounded-2xl shadow-xl p-6 mt-4 overflow-x-auto"
//           >
//             <h3 className="text-xl font-semibold mb-4">
//               Completed Appointments
//             </h3>

//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="text-blue-300 border-b border-blue-800">
//                   <th className="py-2">Token</th>
//                   <th>Patient</th>
//                   <th>Email</th>
//                   <th>Date</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {appointments.map((appt) => (
//                   <tr
//                     key={appt._id}
//                     className="border-b border-blue-900 hover:bg-blue-900/40"
//                   >
//                     <td className="py-2">{appt.token}</td>
//                     <td>{appt.patient?.userId?.name}</td>
//                     <td>{appt.patient?.userId?.email}</td>
//                     <td>
//                       {new Date(appt.date).toLocaleDateString()}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// };

// const Field = ({ label, children }) => (
//   <div className="bg-white/10 backdrop-blur rounded-xl p-4">
//     <p className="text-sm text-blue-200">{label}</p>
//     <div className="font-semibold mt-1">{children}</div>
//   </div>
// );

// export default DoctorProfile;



import { useEffect, useState } from "react";
import api from "../api/axios";
import { motion } from "framer-motion";

const DoctorProfile = () => {
  const [doctor, setDoctor] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [showAppointments, setShowAppointments] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  const fetchDoctorProfile = async () => {
    try {
      const res = await api.get("/doctors/me");
      setDoctor(res.data.doctor);
      setFormData(res.data.doctor);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchAppointments = async () => {
    if (showAppointments) return setShowAppointments(false);

    setLoadingAppointments(true);
    try {
      const res = await api.get("/doctors/appointments/completed");
      setAppointments(res.data.appointments);
      setShowAppointments(true);
    } catch (err) {
      console.log(err);
    }
    setLoadingAppointments(false);
  };

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadPhoto = async () => {
    if (!photo) return;

    const data = new FormData();
    data.append("photo", photo);

    try {
      await api.patch("/doctors/upload-photo", data);
      await fetchDoctorProfile();
      setPreview(null);
      setPhoto(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSave = async () => {
    try {
      await api.patch("/doctors/update-profile", formData);
      setDoctor({ ...doctor, ...formData });
      setIsEditing(false);
    } catch (err) {
      console.log(err);
    }
  };

  if (!doctor)
    return (
      <div className="text-white p-6 animate-pulse text-center">
        Loading profile...
      </div>
    );

  return (
    <div className="p-6 max-w-6xl mx-auto text-white">
      {/* ================= PROFILE CARD ================= */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl shadow-2xl p-8
        bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800"
      >
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <img
              src={
                preview ||
                (doctor.profile_photo
                  ? doctor.profile_photo + "?t=" + Date.now()
                  : "/default-doctor.png")
              }
              alt="doctor"
              className="w-36 h-36 rounded-full object-cover border-4 border-blue-400 shadow-lg"
            />

            {isEditing && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="mt-3 text-sm"
                />
                {photo && (
                  <button
                    onClick={uploadPhoto}
                    className="mt-2 bg-blue-600 px-4 py-1 rounded-lg hover:bg-blue-500"
                  >
                    Upload
                  </button>
                )}
              </>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold">
              Dr. {doctor.userId?.name}
            </h2>

            <p className="text-blue-200 mt-1">
              {doctor.department?.name} • {doctor.hospital?.name}
            </p>

            <span className="inline-block mt-3 bg-blue-700 px-4 py-1 rounded-full text-sm">
              {doctor.specialisation}
            </span>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-purple-600 px-6 py-2 rounded-xl hover:bg-purple-500 transition"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {/* ===== DETAILS GRID ===== */}
        <div className="grid md:grid-cols-2 gap-5 mt-10">
          <Field label="Position">
            {isEditing ? (
              <Input name="position" value={formData.position} onChange={handleChange} />
            ) : (
              doctor.position
            )}
          </Field>

          <Field label="Experience">
            {isEditing ? (
              <Input name="experience" value={formData.experience} onChange={handleChange} />
            ) : (
              `${doctor.experience} years`
            )}
          </Field>

          <Field label="Specialisation">
            {isEditing ? (
              <Input name="specialisation" value={formData.specialisation} onChange={handleChange} />
            ) : (
              doctor.specialisation
            )}
          </Field>

          <Field label="OPD Timing">
            {doctor.opd_timing?.from} - {doctor.opd_timing?.to}
          </Field>
        </div>

        {isEditing && (
          <button
            onClick={handleSave}
            className="mt-8 bg-green-500 px-8 py-3 rounded-xl hover:bg-green-400 font-semibold shadow-lg"
          >
            Save Changes
          </button>
        )}
      </motion.div>

      {/* ================= COMPLETED APPOINTMENTS ================= */}
      <div className="mt-10">
        <button
          onClick={fetchAppointments}
          className="bg-purple-700 px-6 py-3 rounded-xl hover:bg-purple-600 font-semibold shadow-lg"
        >
          {showAppointments ? "Hide Completed" : "View Completed Appointments"}
        </button>

        {loadingAppointments && (
          <p className="mt-4 text-blue-200 animate-pulse">Loading appointments...</p>
        )}

        {showAppointments && !loadingAppointments && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl shadow-xl p-6 mt-5 bg-blue-950 overflow-x-auto"
          >
            <h3 className="text-xl font-semibold mb-4">
              Completed Appointments
            </h3>

            {appointments.length === 0 ? (
              <p className="text-blue-200">No completed appointments</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-blue-300 border-b border-blue-800">
                    <th className="py-2">Token</th>
                    <th>Patient</th>
                    <th>Email</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {appointments.map((appt) => (
                    <tr
                      key={appt._id}
                      className="border-b border-blue-900 hover:bg-blue-900/40"
                    >
                      <td className="py-2">{appt.token}</td>
                      <td>{appt.patient?.userId?.name}</td>
                      <td>{appt.patient?.userId?.email}</td>
                      <td>
                        {new Date(appt.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div className="bg-white/10 backdrop-blur rounded-xl p-4">
    <p className="text-sm text-blue-200">{label}</p>
    <div className="font-semibold mt-1">{children}</div>
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className="mt-1 w-full bg-white/10 border border-blue-400/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
  />
);

export default DoctorProfile;