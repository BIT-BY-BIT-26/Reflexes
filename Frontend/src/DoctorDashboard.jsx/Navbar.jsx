import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import socket from "../socket/socket";   // ✅ socket import
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {  toggleDoctorOnline, toggleDoctorOpd } from "../redux/doctor/doctorThunk";


const Navbar = () => {
  const {isOnline,opdStarted,doctor,toggleLoading} = useSelector(state=> state.doctor);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const handleStartOPD = ()=>{
    
    if(!isOnline){
      return;
    }
    console.log("opd started");
    dispatch(toggleDoctorOpd());
  }
  const handleStopOPD = ()=>{
    console.log("opd stoped");
    dispatch(toggleDoctorOpd());
  }
  // ✅ Logout function shifted here
  const handleLogout = () => {
    socket.disconnect();
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="w-full bg-white shadow-md px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* LEFT → Logo */}
      <div className="flex items-center gap-3">
        <img
          src="/medireach-logo.png"
          alt="Medireach"
          className="w-10 h-10"
        />

        <div className="leading-tight">
          <h1 className="font-semibold text-lg text-gray-800">
            Medireach
          </h1>
          <p className="text-xs text-gray-500">
            Doctor Panel
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">

        {/* Availability Toggle */}
        <div className="flex items-center gap-2">

          <span
            className={`text-sm font-medium ${
              isOnline ? "text-green-600" : "text-red-500"
            }`}
          >
            {isOnline ? "Online" : "Offline"}
          </span>

          <button
          type="button"
          disabled={toggleLoading}
            onClick={() => dispatch(toggleDoctorOnline())}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300
              ${isOnline ? "bg-green-500" : "bg-red-400"}
              ${toggleLoading?"opacity-50 cursor-not-allowed":""}
            `}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300
                ${isOnline ? "translate-x-6" : ""}
              `}
            />
          </button>
        </div>

        <button
        type="button"
          disabled={!isOnline || toggleLoading}
          onClick={opdStarted?handleStopOPD:handleStartOPD}
          className={`px-4 py-2 rounded-lg text-black font-medium transition ${(!isOnline || toggleLoading)?"bg-gray-400 cursor-not-allowed"
            :opdStarted?"bg-red-500 hover:bg-red-600":"bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {toggleLoading?"Updating...":!isOnline?"Offline":opdStarted?"Stop OPD":"Start OPD"}
        </button>

        {/* Profile Dropdown */}
        <div className="relative">

          <button
          type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2"
          >
          <img
          src={
            doctor?.profile_photo
              ? doctor.profile_photo + "?t=" + Date.now()
              : "/default-doctor.png"
          }
          alt="profile"
          className="w-10 h-10 rounded-full border object-cover"
        />


            <ChevronDown size={18} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-3 w-40 bg-white shadow-lg rounded-lg border">

              <button
              type="button"
                onClick={() => navigate("/doctor/profile")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-black"
              >
                View Profile
              </button>

              <button
              type="button"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
              >
                Logout
              </button>

            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;