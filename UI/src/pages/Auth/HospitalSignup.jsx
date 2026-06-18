import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { registerHospital } from "../../api/backend";
import { MdMyLocation } from "react-icons/md";
import { ROLE } from "../../constants/Role";

export default function HospitalSignup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    hospitalLicense: "",
    phone_number: "",
    city: "",
    state: "",
    pincode: "",
    lat: "",
    lng: "",
    adminName:"",
    adminEmail:"",
    adminPassword:"",
  });

  const [locationFetched, setLocationFetched] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGeoLocation = () => {
    setLocLoading(true);
  
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported ❌");
      setLocLoading(false);
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }));
  
        setLocationFetched(true);
        toast.success("Location captured 📍");
        setLocLoading(false);
      },
      (error) => {
        toast.error("Location access denied ❌");
        setLocLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.lat || !formData.lng) {
    toast.warning("Please fetch hospital location 📍");
    return;
  }

  const toastId = toast.loading("Registering hospital...");

  try {
    setLoading(true);

    
   
    const response = await registerHospital({
  name: formData.name,
  email: formData.email,
  hospitalLicense: formData.hospitalLicense,
  phone_number: formData.phone_number,
  city: formData.city,
  state: formData.state,
  pincode: formData.pincode,

  lat: Number(formData.lat),
  lng: Number(formData.lng),

  adminName: formData.adminName,
  adminEmail: formData.adminEmail,
  adminPassword: formData.adminPassword,
});
    console.log("API response:", response.data);
    // 2️⃣ TOKEN SAVE (ADMIN LOGIN AUTO)
    localStorage.setItem("token", response.data.accessToken);
    localStorage.setItem("role", ROLE.admin); // 🔥 THIS WAS MISSING
    localStorage.setItem("user", JSON.stringify(response.data.data.admin));

    // 3️⃣ SUCCESS TOAST
    toast.update(toastId, {
      render: "Hospital registered successfully 🎉",
      type: "success",
      isLoading: false,
      autoClose: 3000,
    });

    // 4️⃣ ADMIN DASHBOARD
    navigate("/hospital-dashboard");

  } catch (error) {
    toast.update(toastId, {
      render:
        error?.response?.data?.message || "Registration failed ❌",
      type: "error",
      isLoading: false,
      autoClose: 3000,
    });
  } finally {
    setLoading(false);
  }
};


    const handleGoogleAuth = async(req,res)=>{
      try{
        const provider = new GoogleAuthProvider()
        const result = await signInWithPopup(auth,provider)
        console.log(result);
      }catch(error){

      }
    }


  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Register Hospital</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Hospital Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="hospitalLicense"
          placeholder="Hospital License Number"
          value={formData.hospitalLicense}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="phone_number"
          placeholder="Phone Number"
          value={formData.phone_number}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="state"
          placeholder="State"
          value={formData.state}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="number"
          name="pincode"
          placeholder="Pincode"
          value={formData.pincode}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <button
            type="button"
            onClick={handleGeoLocation}
            disabled={locLoading}
            className="w-full mb-2 flex items-center justify-center gap-2 border border-blue-500 text-blue-500 px-4 py-2 rounded-md hover:bg-blue-50 transition disabled:opacity-50"
          >
            <MdMyLocation size={20} />
            {locLoading ? "Fetching Location..." : "Use Current Location"}
          </button>
          {locationFetched && (
          <p className="text-green-600 text-sm text-center mb-2">
            📍 Location captured successfully
          </p>
        )}


        <div className="grid grid-cols-1 gap-4">
  {/* Admin Name */}
  <div>
    <label className="block text-sm font-medium mb-1">
      Admin Name
    </label>
    <input
      type="text"
      name="adminName"
      onChange={handleChange}
      required
      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  </div>

  {/* Admin Email */}
  <div>
    <label className="block text-sm font-medium mb-1">
      Admin Email (Login)
    </label>
    <input
      type="email"
      name="adminEmail"
      onChange={handleChange}
      required
      autoComplete="off"
      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  </div>

  {/* Admin Password */}
  <div>
    <label className="block text-sm font-medium mb-1">
      Admin Password
    </label>
    <input
      type="password"
      name="adminPassword"
      onChange={handleChange}
      required
      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
</div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Register Hospital
        </button>
      </form>
    </div>
  );
}