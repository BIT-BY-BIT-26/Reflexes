
import { useState } from "react";
import { Bell, Activity, ClipboardList, Video } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const menuItems = [
    { name: "OPD Stats", icon: <Activity size={22} />, path: "/doctor-dashboard" },
    { name: "Notifications", icon: <Bell size={22} />, path: "/notifications" },
    { name: "Appointments", icon: <ClipboardList size={22} />, path: "/appointments" },
    { name: "Online Assessment", icon: <Video size={22} />, path: "/online-assessment" },
  ];

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className={`fixed left-0 top-0 h-screen bg-gray-900 text-white transition-all duration-300 z-[60]
      ${open ? "w-56" : "w-16"}`}
    >
      <div className="flex flex-col gap-6 p-3 mt-5">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;

          return (
            <div
              key={index}
              onClick={() => item.path && navigate(item.path)}
              className={`flex items-center gap-4 p-2 rounded-lg cursor-pointer transition
              ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`}
            >
              {item.icon}
              {open && <span>{item.name}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
