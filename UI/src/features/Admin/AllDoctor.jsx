import { useEffect, useState } from "react";
import { getAllDoctors } from "../../api/backend";
export default function AllDoctor() {
  const [doctors, setDoctors] = useState([]);
  const [hospital, setHospital] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await getAllDoctors();
      setDoctors(res.data.doctors);
      setHospital(res.data.hospital);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-blue-950 p-6">

      {/* HEADER */}
      <div className="flex justify-between  items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-300 uppercase">
            All Doctors
          </h1>

          {hospital && (
            <p className="text-slate-400 text-lg mt-2">
              {hospital.name}
            </p>
          )}
        </div>

        <div className="text-right">
          <p className="text-green-300 font-bold text-2xl">Total Doctors</p>
          <p className="text-3xl font-bold text-white">{doctors.length}</p>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {doctors.map((doc) => (
          <div
            key={doc._id}
            className="relative bg-slate-900/60 border border-slate-700 rounded-2xl p-5 hover:border-blue-500 hover:shadow-blue-500/20 transition-all"
          >

            {/* TOP SECTION */}
            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-bold text-white">
                  Dr. {doc.userId?.name}
                </h2>

                <p className="text-blue-300 text-lg">
                  {doc.department?.name}
                </p>
              </div>

              {/* STATUS */}
              <span className={`px-3 py-1 text-xs rounded-full border ${
                doc.isActive
                  ? "bg-green-500/20 text-green-400 border-green-500"
                  : "bg-red-500/20 text-red-400 border-red-500"
              }`}>
                {doc.isActive ? "Active" : "Inactive"}
              </span>

            </div>

            {/* CONTACT */}
            <div className="mt-4 text-lg text-slate-300 space-y-1">
              <p>📧 {doc.userId?.email}</p>
              <p>📞 {doc.userId?.phone_number}</p>
            </div>

            {/* DETAILS */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-md text-slate-400">

              <div>
                <p className="text-slate-500">Experience</p>
                <p className="text-white font-semibold">{doc.experience} yrs</p>
              </div>

              <div>
                <p className="text-slate-500">Fee</p>
                <p className="text-white font-semibold">₹{doc.consultationFee}</p>
              </div>

              <div>
                <p className="text-slate-500">Reg No</p>
                <p className="text-white font-semibold">{doc.registrationNumber}</p>
              </div>

              <div>
                <p className="text-slate-500">Created</p>
                <p className="text-white font-semibold">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>

            </div>

            {/* OPD TIMING */}
            <div className="mt-4 p-2 bg-slate-800/50 rounded-lg text-md text-slate-300">
              🕒 OPD: {doc.opd_timing?.from || "--"} to {doc.opd_timing?.to || "--"}
            </div>

            {/* AVAILABLE DAYS */}
            <div className="mt-3 flex flex-wrap gap-1">
              {doc.availableDays?.map((day, i) => (
                <span
                  key={i}
                  className="px-3 py-2 text-md bg-blue-500/10 text-blue-300 rounded-md border border-blue-500/30"
                >
                  {day}
                </span>
              ))}
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}