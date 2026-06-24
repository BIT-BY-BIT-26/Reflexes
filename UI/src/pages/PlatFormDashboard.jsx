import React from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Stethoscope,
  Pill,
  Bell,
  Settings,
  Search,
  Menu,
} from "lucide-react";

const PlatformDashboard = () => {
  return (
    <div className="min-h-screen bg-[#15192C] flex text-white">
      {/* Sidebar */}
      <aside className="w-72 bg-[#1B2038] border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-blue-400">
            MediReach
          </h1>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-6">
          <ul className="space-y-2 px-4">
            <li>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600">
                <LayoutDashboard size={18} />
                Dashboard
              </button>
            </li>

            <li>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#262D4D] transition">
                <Building2 size={18} />
                Hospitals
              </button>
            </li>

            <li>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#262D4D] transition">
                <Users size={18} />
                Users
              </button>
            </li>

            <li>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#262D4D] transition">
                <Stethoscope size={18} />
                Doctors
              </button>
            </li>

            <li>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#262D4D] transition">
                <Pill size={18} />
                Pharmacies
              </button>
            </li>

            <li>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#262D4D] transition">
                <Bell size={18} />
                Notifications
              </button>
            </li>

            <li>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#262D4D] transition">
                <Settings size={18} />
                Settings
              </button>
            </li>
          </ul>
        </nav>

        {/* Profile */}
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <img
              src="https://i.pravatar.cc/100"
              alt=""
              className="h-10 w-10 rounded-full"
            />
            <div>
              <p className="font-medium">Platform Admin</p>
              <p className="text-xs text-gray-400">
                admin@medireach.com
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1">
        {/* Topbar */}
        <header className="h-20 border-b border-gray-800 bg-[#1B2038] px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Menu />
            <h2 className="text-xl font-semibold">
              Platform Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                placeholder="Search..."
                className="bg-[#262D4D] rounded-xl pl-10 pr-4 py-2 outline-none"
              />
            </div>

            <Bell className="cursor-pointer" />
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Stats */}
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
            <div className="bg-[#1B2038] rounded-2xl p-6">
              <p className="text-gray-400">Total Hospitals</p>
              <h2 className="text-4xl font-bold mt-3">125</h2>
            </div>

            <div className="bg-[#1B2038] rounded-2xl p-6">
              <p className="text-gray-400">Doctors</p>
              <h2 className="text-4xl font-bold mt-3">2,750</h2>
            </div>

            <div className="bg-[#1B2038] rounded-2xl p-6">
              <p className="text-gray-400">Patients</p>
              <h2 className="text-4xl font-bold mt-3">58K</h2>
            </div>

            <div className="bg-[#1B2038] rounded-2xl p-6">
              <p className="text-gray-400">Appointments</p>
              <h2 className="text-4xl font-bold mt-3">13K</h2>
            </div>
          </div>

          {/* Analytics */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Income Graph */}
            <div className="lg:col-span-2 bg-[#1B2038] rounded-2xl p-6">
              <div className="flex justify-between mb-6">
                <h3 className="font-semibold text-lg">
                  Platform Growth
                </h3>

                <select className="bg-[#262D4D] rounded-lg px-3 py-2">
                  <option>Last 6 Months</option>
                </select>
              </div>

              <div className="h-80 rounded-xl bg-[#262D4D] flex items-center justify-center text-gray-400">
                Growth Chart Here
              </div>
            </div>

            {/* Analytics */}
            <div className="space-y-6">
              <div className="bg-[#1B2038] rounded-2xl p-6">
                <h3 className="mb-4 font-semibold">
                  Revenue
                </h3>

                <p className="text-4xl font-bold">
                  ₹6.7L
                </p>

                <p className="text-green-400 mt-2">
                  +18% this month
                </p>
              </div>

              <div className="bg-[#1B2038] rounded-2xl p-6">
                <h3 className="mb-4 font-semibold">
                  Active Hospitals
                </h3>

                <p className="text-4xl font-bold">
                  98%
                </p>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Pie Chart */}
            <div className="bg-[#1B2038] rounded-2xl p-6">
              <h3 className="mb-5 font-semibold">
                User Distribution
              </h3>

              <div className="h-64 rounded-full border-[30px] border-purple-500 flex items-center justify-center">
                <span>Pie Chart</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-orange-400 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-6">
                Broadcast Notice
              </h2>

              <input
                placeholder="Announcement title"
                className="w-full bg-white rounded-xl p-3 text-black mb-4"
              />

              <button className="bg-red-500 px-6 py-3 rounded-xl">
                Send Notification
              </button>
            </div>

            {/* Activity */}
            <div className="bg-[#1B2038] rounded-2xl p-6">
              <h3 className="font-semibold mb-5">
                Recent Activity
              </h3>

              <div className="space-y-4">
                <div className="bg-[#262D4D] p-3 rounded-lg">
                  New Hospital Registered
                </div>

                <div className="bg-[#262D4D] p-3 rounded-lg">
                  Doctor Verification Pending
                </div>

                <div className="bg-[#262D4D] p-3 rounded-lg">
                  Pharmacy Added
                </div>

                <div className="bg-[#262D4D] p-3 rounded-lg">
                  New Appointment Surge
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlatformDashboard;