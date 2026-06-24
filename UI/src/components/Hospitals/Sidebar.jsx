

// import { useState } from "react";
// import {
//   Stethoscope,
//   Users,
//   FileText,
//   Settings,
//   ChevronDown,
//   ChevronRight,
// } from "lucide-react";

// export default function Sidebar() {
//   const [openMenus, setOpenMenus] = useState({});
//   const [expanded, setExpanded] = useState(false);

//   const menus = [
//     {
//       id: "doctor",
//       icon: <Stethoscope size={22} />,
//       items: ["Add Doctor", "All Doctors"],
//     },
//     {
//       id: "patient",
//       icon: <Users size={22} />,
//       items: ["Add Patient", "All Patients"],
//     },
//     {
//       id: "report",
//       icon: <FileText size={22} />,
//       items: ["Upload Report", "All Reports"],
//     },
//     {
//       id: "settings",
//       icon: <Settings size={22} />,
//       items: ["Profile", "Settings"],
//     },
//   ];

//   const toggleMenu = (id) => {
//     setOpenMenus((prev) => ({
//       ...prev,
//       [id]: !prev[id],
//     }));
//   };


//   const openAllMenus = () => {
//   const allOpen = {};

//   menus.forEach((menu) => {
//     allOpen[menu.id] = true;
//   });

//   setOpenMenus(allOpen);
// };


//   // 🔥 reset function
//   const handleMouseLeave = () => {
//     setExpanded(false);

//     // reset all menus (default state = all closed)
//     setOpenMenus({});
//   };

//   return (
//     <div
//       onMouseEnter={() => {
//   setExpanded(true);
//   openAllMenus(); // 👈 sab true
// }}
//       onMouseLeave={handleMouseLeave}
//       className={`bg-slate-900 min-h-screen text-white py-4 transition-all ${
//         expanded ? "w-60" : "w-20"
//       }`}
//     >
//       {menus.map((menu) => {
//         const isOpen = openMenus[menu.id];

//         return (
//           <div key={menu.id} className="relative mb-4">
//             <div className="flex items-center justify-between px-2">
              
//               {/* Icon button */}
//               <button
//                 onClick={() => toggleMenu(menu.id)}
//                 className="flex items-center gap-2 p-3 hover:bg-slate-800 rounded-lg w-full"
//               >
//                 {menu.icon}
//               </button>

//               {/* Chevron toggle */}
//               {expanded && (
//                 <button onClick={() => toggleMenu(menu.id)}>
//                   {isOpen ? (
//                     <ChevronDown size={16} />
//                   ) : (
//                     <ChevronRight size={16} />
//                   )}
//                 </button>
//               )}
//             </div>

//             {/* Submenu */}
//             {expanded && isOpen && (
//               <div className="ml-20 mt-2 w-40 space-y-2">
//                 {menu.items.map((item) => (
//                   <div
//                     key={item}
//                     className="text-sm cursor-pointer hover:text-blue-400"
//                   >
//                     {item}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// }







import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import menuItems from "./MenuItem";
import { IoMdArrowDropup } from "react-icons/io";
import { IoMdArrowDropdown } from "react-icons/io";

import logo from '../../images/logo.png'


export default function Sidebar() {
  const [openMenus, setOpenMenus] = useState({});
  const [expanded, setExpanded] = useState(false);

  const toggleMenu = (id) => {
    setOpenMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const openAllMenus = () => {
    const allOpen = {};
    menuItems.forEach((menu) => {
      allOpen[menu.id] = true;
    });
    setOpenMenus(allOpen);
  };

  const handleMouseLeave = () => {
    setExpanded(false);
    setOpenMenus({});
  };

  return (
    <div
      onMouseEnter={() => {
        setExpanded(true);
        openAllMenus();
      }}
      onMouseLeave={handleMouseLeave}
      className={`bg-slate-900 h-screen fixed left-0 top-0 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 text-white py-4 transition-all ${
        expanded ? "w-80" : "w-20"
      }`}
    >

    <div className="flex items-center px-1 mb-2 w-28 h-28">
  <img
    src={logo}
    alt="MediReach"
    className="w-18 h-18 object-contain flex-shrink-0"
  />

  {expanded && (
    <span className="ml-3 text-3xl font-bold text-[#61B126] whitespace-nowrap">
      Medi <span className="text-3xl font-bold text-[#00C9EE]">Reach</span>
    </span>
  )}
</div>
      {menuItems.map((menu) => {
        const isOpen = openMenus[menu.id];
        const Icon = menu.icon; // 🔥 IMPORTANT FIX

        return (
          <div key={menu.id} className="relative mb-4">
            
            {/* Parent Menu */}
            <div className="flex items-center justify-between px-2">
              
              <button
                onClick={() => toggleMenu(menu.id)}
                className="flex items-center gap-2 p-3 hover:bg-slate-800 rounded-lg w-full"
              >
                <Icon strokeWidth={3.5} className="text-slate-400 " size={25} />
                {expanded && <span className="text-blue-300  text-xl font-bold uppercase">{menu.title}</span>}
              </button>

              {expanded && (
                <button onClick={() => toggleMenu(menu.id)}>
                  {isOpen ? (
                    <IoMdArrowDropdown size={16} />
                  ) : (
                    <IoMdArrowDropup  size={16} />
                  )}
                </button>
              )}
            </div>

            {/* Submenu */}
            {expanded && isOpen && menu.children && (
              <div className="ml-11 mt-2 w-65 space-y-2">
                {menu.children.map((child, index) => (
                  <div
                    key={index}
                    className="text-xl cursor-pointer p-2 hover:bg-slate-600 hover:rounded-lg"
                  >
                    {child.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}