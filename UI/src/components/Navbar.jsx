import { useEffect, useState } from "react";
import {
  Menu,
  Search,
  Bell,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { getHospitalProfile } from "../api/backend";
import { useNavigate } from "react-router-dom";
import { ROLE } from "../constants/Role";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [logo,setLogo] = useState("");
  const [profileOpen,setProfileOpen] = useState(false);
  const navigate = useNavigate();
useEffect(() => {
  const getLogo = async () => {
    try {
      const res = await getHospitalProfile();
      setLogo(res.data.data.logo); // URL hona chahiye
    } catch (error) {
      console.log(`error occured ${error}`);
    }
  };

  getLogo();
}, []);

  return (
    <header className="relative z-30 sticky top-0  w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="flex items-center justify-between px-4 md:px-6 py-7">

        {/* Left - Hamburger + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
                console.log("clicked me")
                setOpen(!open)
            }}
            className="p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full  flex items-center justify-center font-bold text-black">
              {logo?<img src={logo} className="w-full rounded-full h-full object-cover"/>:(<span className="text-xs font-bold text-white">HC</span>)}
            </div>
            <div className="leading-tight">
              <h1 className="text-lg font-semibold">City Care Hospital</h1>
              <p className="text-md text-slate-400">Smart healthcare system</p>
            </div>
          </div>
        </div>

        {/* Center - Search */}
        <div className="hidden md:flex flex-1 max-w-xl mx-6">
          <div className="relative w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={24}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search patients, doctors, appointments..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-4">

          {/* Notification */}
          <button className="relative p-2 rounded-lg hover:bg-slate-800 transition">
            <Bell size={24} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="p-2 rounded-lg hover:bg-slate-800 transition">
            <Settings size={24} />
          </button>

          {/* Profile */}
          <button
    onClick={() => setProfileOpen(!profileOpen)}
    className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-800 transition"
  >
    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
      <User size={24} />
    </div>
    {localStorage.getItem("role")==ROLE.doctor?<span className="text-lg hidden md:block">Doctor</span>:<span className="text-lg hidden md:block">Admin</span>}
    
  </button>

    {profileOpen && (
      <div className="absolute right-0 mt-40 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
        <button
          onClick={() => {
            navigate("/hospital-dashboard/hospital-profile");
            setProfileOpen(false);
          }}
          className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-700 transition"
        >
          <User size={18} />
          See Profile
        </button>

        <button
          onClick={() => {
            // logout logic
            setProfileOpen(false);
          }}
          className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-red-500/20 hover:text-red-400 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    )}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="absolute left-0 top-20 rounded-md text-white bg-slate-800">
            <button
                onClick={() => {
                navigate("/hospital-dashboard/profile");
                setOpen(false);
                }}
                className="text-left p-2 rounded-lg hover:bg-blue-600/20 hover:text-blue-400"
            >
                Complete Profile
            </button>
        </div>
      )}
    </header>
  );
}