
import React from "react";
import {
  Building2,
  Stethoscope,
  Pill,
  ArrowRight,
} from "lucide-react";
import { ROLE } from "../../constants/Role";
import { Navigate, useNavigate } from "react-router-dom";

const roles = [
  {
    title: "Hospital Admin",
    description:
      "Manage doctors, appointments, departments, and hospital operations.",
    icon: Building2,
    color: "from-blue-500 to-cyan-500",
    route: "/signup/hospital",
  },
  {
    title: "Doctor",
    description:
      "Access your patients, appointments, and prescriptions.",
    icon: Stethoscope,
    color: "from-violet-500 to-purple-500",
    route: "/login",
    loginOnly: true,
  },
  {
    title: "Medical Shop",
    description:
      "Manage medicines, inventory, availability, and orders.",
    icon: Pill,
    color: "from-emerald-500 to-green-500",
    route: "/pharmacy/signup",
  },
];

const SelectRole = () => {
    const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0B1020] relative overflow-hidden flex items-center justify-center px-6 py-12 bg-gradient-to-b from-[#00091E] to-[#000000]">

      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-violet-500/20 blur-[120px]" />

      <div className="relative z-10 w-full max-w-7xl">

        {/* Heading */}
        <div className="text-center mb-14">
          <h1 className="text-6xl font-bold text-white mb-10">
            Join <span className="text-cyan-400">MediReach</span>
          </h1>

          <p className="text-white text-xl max-w-2xl mx-auto">
            Empowering healthcare providers with a unified platform for appointments, doctor management, medicine availability, and patient care — all in one place.
          </p>
        </div>

        {/* Cards */}
        <div className="grid lg:grid-cols-3 gap-8">

          {roles.map((role, index) => {
            const Icon = role.icon;

            return (
              <button
                key={index}
                onClick={()=>navigate(`${role.route}`)}
                className="group text-left relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/50 hover:shadow-[0_0_40px_rgba(34,211,238,0.15)]"
              >
                {/* Gradient Circle */}
                <div
                  className={`absolute top-0 right-0 h-40 w-40 bg-gradient-to-br ${role.color} opacity-20 blur-3xl`}
                />

                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-6`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-2xl font-semibold text-white">
                    {role.title}
                  </h2>

                  {role.loginOnly && (
                    <span className="text-xs px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      Login Only
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-slate-400 leading-relaxed mb-8">
                  {role.description}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-2 text-cyan-400 font-medium">
                  {role.loginOnly ? "Login" : "Continue"}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-12">
          <p className="text-slate-500 text-xl">
            Already have an account?{" "}
            <span onClick={()=>navigate('/login')} className="text-cyan-400 cursor-pointer hover:underline">
              Sign In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;
