import {
  LayoutDashboard,
  Building2,
  Users,
  ListOrdered,
  Activity,
  Eye,
  Plus
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import AddDoctorModal from "./AddDoctorModal";
import logout from "../utils/logout";
import AllDepartments from "../AdminDashBoard/AllDepartments";
import AllDoctors from "../AdminDashBoard/AllDoctors";
import AddDepartmentPopup from "../AdminDashBoard/DepartmentPopUp";

/* ------------------ Dummy Data ------------------ */

const stats = [
  { title: "Total Departments", value: 8, subtitle: "Active departments" },
  { title: "Total Doctors", value: 24, subtitle: "Registered doctors" },
  {
    title: "Patients Today",
    value: 156,
    subtitle: "+12% from yesterday",
    highlight: true
  },
  { title: "Active Queues", value: 12, subtitle: "Currently running" }
];

const queues = [
  {
    doctor: "Dr. Sarah Johnson",
    department: "Cardiology",
    waiting: 5,
    token: "T-023"
  },
  {
    doctor: "Dr. Michael Chen",
    department: "Orthopedics",
    waiting: 8,
    token: "T-045"
  },
  {
    doctor: "Dr. Emily Davis",
    department: "Pediatrics",
    waiting: 3,
    token: "T-012"
  }
];

/* ------------------ Main Component ------------------ */

export default function AdminDashboard() {
  const [open, setOpen] = useState(false);
  const [openDept, setOpenDept] = useState(false);
  const [page,setPage] = useState("dashboard");
  return (
    <div className="flex min-h-screen w-screen text-black bg-gradient-to-br from-slate-50 to-teal-50">

      {/* ---------------- Sidebar ---------------- */}
      <motion.aside
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-64 bg-white/70 backdrop-blur-xl border-r shadow-xl"
      >
        <div className="p-6 text-xl font-bold bg-gradient-to-r from-teal-500 to-emerald-400 bg-clip-text text-transparent">
          OPD Queue
        </div>

        <nav className="px-4 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active />
          <SidebarItem icon={Building2} label="Departments" onClick={()=> setPage("departments")} />
          <SidebarItem icon={Users} label="Doctors" onClick={()=>setPage("doctors")}/>
          <SidebarItem icon={ListOrdered} label="Queue Management" />
          <SidebarItem icon={Activity} label="Live Monitoring" />
        </nav>

        <div className="p-4 mt-auto">
          <button
            onClick={logout}
            className="w-full border border-red-200 text-red-600 py-2 rounded-xl hover:bg-red-50 transition"
          >
            Logout
          </button>
        </div>
      </motion.aside>

      {/* ---------------- Main ---------------- */}
      <main className="flex-1 p-8">
        
        {page === "departments" && <AllDepartments />}
        {page === "doctors" && <AllDoctors />}
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-500">
              Welcome back! Here's your hospital overview.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 border border-teal-200 px-4 py-2 rounded-xl hover:bg-teal-50 transition">
              <Eye size={18} /> Live Monitor
            </button>

            <button className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-500
              text-white px-5 py-2 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition">
              <Plus size={18} /> New Queue
            </button>
          </div>
        </div>

        {/* ---------------- Stats ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {stats.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, scale: 1.03 }}
              className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-lg hover:shadow-2xl"
            >
              <p className="text-gray-500">{item.title}</p>
              <h2 className="text-4xl font-extrabold mt-2 bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                {item.value}
              </h2>
              <p
                className={`text-sm mt-1 ${
                  item.highlight ? "text-green-600" : "text-gray-400"
                }`}
              >
                {item.subtitle}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ---------------- Quick Actions ---------------- */}
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <QuickCard title="Add Department" desc="Create a new department"
            onClick={()=> setOpenDept(true)}
          />
          <AddDepartmentPopup
            open={openDept}
            onClose={() => setOpenDept(false)}
          />

          <QuickCard
            title="Add Doctor"
            desc="Register a new doctor"
            onClick={() => setOpen(true)}
          />

          <QuickCard
            title="View Live Queues"
            desc="Monitor all active queues"
          />
        </div>

        {/* ---------------- Active Queues ---------------- */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg">
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <h3 className="font-semibold">Active Queues</h3>
            <button className="text-teal-600 text-sm">View All</button>
          </div>

          <table className="w-full text-sm">
            <thead className="text-left text-gray-500 border-b">
              <tr>
                <th className="p-4">Doctor</th>
                <th className="p-4">Department</th>
                <th className="p-4">Waiting</th>
                <th className="p-4">Current Token</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {queues.map((q, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ backgroundColor: "#f0fdfa" }}
                  className="border-b"
                >
                  <td className="p-4 font-medium">{q.doctor}</td>
                  <td className="p-4">{q.department}</td>
                  <td className="p-4">
                    <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
                      {q.waiting}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="bg-teal-100 text-teal-600 px-3 py-1 rounded-full">
                      {q.token}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-teal-600 font-medium">
                      Manage
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      <AddDoctorModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

/* ------------------ Components ------------------ */
function SidebarItem({ icon: Icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer
      ${
        active
          ? "bg-teal-50 text-teal-600 font-medium"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <Icon size={18} />
      {label}
    </div>
  );
}


function QuickCard({ title, desc, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.97 }}
      className="bg-gradient-to-br from-teal-500/10 to-emerald-400/10
        backdrop-blur-xl p-6 rounded-2xl shadow-md hover:shadow-xl cursor-pointer"
    >
      <h4 className="font-semibold text-lg">{title}</h4>
      <p className="text-gray-600 text-sm mt-1">{desc}</p>
    </motion.div>
  );
}
