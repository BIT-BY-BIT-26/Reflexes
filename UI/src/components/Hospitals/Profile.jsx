import { useEffect, useState } from "react";
import {
  MapPin,
  Phone,
  Clock3,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { getHospitalProfile } from "../../api/backend";

export default function Profile() {
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getHospitalProfile();

      setHospital(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[500px] text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-[#061B45] min-h-screen p-6">
      <div className="max-w-3xl mx-auto bg-[#08275E] border border-blue-800 rounded-3xl p-6 shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-3xl font-semibold">
            Hospital Profile Overview
          </h2>

          <button className="border border-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
            Edit Profile
          </button>
        </div>

        {/* Main Section */}
        <div className="grid md:grid-cols-[280px_1fr] gap-8">

          {/* Left Image */}
          <div className="relative">

            <img
                src={hospital.coverImage}
                alt="Cover"
                className="w-full h-80 object-cover rounded-2xl"
            />
            </div>

          {/* Right Content */}
          <div>

            {/* Name */}
            <div className="flex items-center gap-2">
                <img
                src={hospital.logo}
                alt="Logo"
                className="
                w-10
                h-10
                rounded-2xl
                border-4
                border-[#08275E]
                object-cover
                bg-white
                "
            />
                <h1 className="text-xl text-white font-bold">
                    {hospital.name}
                </h1>
                

              <ShieldCheck
                size={18}
                className="text-sky-400"
              />
            </div>

            {/* Badge */}
            <div className="inline-block mt-3 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-sm">
              {hospital.description}
            </div>

            {/* Information */}
            <div className="mt-8 space-y-5">

              {/* Address */}
              <div className="flex gap-4">
                <div className="flex gap-1 items-center justify-center">
                    <MapPin className="text-cyan-400 mt-1" size={18} />
                    <p className="text-gray-300 font-bold">
                        Address
                    </p>
                </div>
                <p className="text-white">
                    {hospital.address}
                  </p>
              </div>

              {/* Contact */}
              <div className="flex gap-4">
               <div className="flex gap-1 font-bold">
                 <Phone className="text-cyan-400 mt-1" size={18} />
                 <p className="text-gray-300 ">
                    Contact
                  </p>
               </div>


                <div>
                 
                  <p className="text-white">
                    {hospital.phone_number}
                  </p>

                  <p className="text-gray-400 text-sm">
                    {hospital.email}
                  </p>
                </div>
              </div>

              {/* Timings */}
              <div className="flex gap-4">
                <div className="flex gap-1 font-bold">
                    <Clock3 className="text-cyan-400 mt-1" size={18} />
                  <p className="text-gray-300">
                    Timings
                  </p>
                </div>

                <div>
                

                  {Object.entries(
                    hospital.timings || {}
                  ).map(([day, time]) => (
                    <p
                      key={day}
                      className="text-white text-sm"
                    >
                      <span className="capitalize font-medium">
                        {day}
                      </span>
                      {" : "}
                      {time}
                    </p>
                  ))}
                </div>
              </div>

              {/* Facilities */}
              <div className="flex gap-4">
                <div className="flex gap-1 font-bold">
                    <Building2
                  className="text-cyan-400 mt-1"
                  size={18}
                />
                <p className="text-gray-300 mb-2">
                    Facilities
                </p>
                </div>

                <div>
                  

                  <div className="flex flex-wrap gap-2">
                    {hospital.facilities?.map(
                      (facility, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-md text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-700"
                        >
                          {facility}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
          {/* Gallery */}
            <div className="mt-10">
            <h3 className="text-white text-lg font-semibold mb-4">
                Hospital Gallery
            </h3>

            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-blue-600">
                {hospital.galleryImages?.map((img, index) => (
                <img
                    key={index}
                    src={img}
                    alt={`gallery-${index}`}
                    className="w-72 h-48 object-cover rounded-xl border border-blue-700 flex-shrink-0 hover:scale-105 transition duration-300"
                />
                ))}
            </div>
            </div>
      </div>
    </div>
  );
}