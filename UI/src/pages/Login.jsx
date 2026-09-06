import React from "react";

import {
  Building2,
  Stethoscope,
  Pill,
  UserRound,
  Sun,
  Moon,
} from "lucide-react";
import { loginUser } from "../api/backend";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ROLE } from "../constants/Role";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../redux/slices/authSlice";
import { toggleTheme } from "../redux/slices/themeSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    const res = await loginUser(formData);
    const data = res.data;

    console.log("FULL RESPONSE:", res);
    console.log("RES.DATA:", res.data);
    console.log("USER FROM RESPONSE:", res.data.user);
    console.log("BEFORE DISPATCH:", data.user);

    dispatch(
      loginSuccess({
        token: data.token,
        role: data.role,
        user: data.user,
      })
    );
    console.log("DATA USER:", data.user);

    toast.success("Login Successful 🎉");
    console.log("ROLE FROM API:", data.role);
    console.log("EXPECTED ROLE:", ROLE.pharmacy);
    console.log("ROLE MATCH:", data.role === ROLE.pharmacy);

    switch (data.role) {
      case ROLE.hospital_admin:
        navigate("/hospital-dashboard");
        break;

      case ROLE.doctor:
        navigate("/doctor-dashboard");
        break;

      case ROLE.patient:
        navigate("/patient-dashboard");
        break;

      case ROLE.pharmacy:
        navigate("/pharmacy-dashboard");
        break;

      default:
        navigate("/");
    }
  } catch (error) {
    toast.error(
      error?.response?.data?.msg || "Login failed"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gradient-to-r dark:from-[#03131f] dark:via-[#02111d] dark:to-[#123b59] flex items-center justify-center px-4">

      {/* Theme Toggle - this route has no navbar, so it rides the page. */}
      <button
        type="button"
        onClick={() => dispatch(toggleTheme())}
        aria-label="Toggle theme"
        title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className="absolute right-6 top-6 z-10 rounded-lg border border-gray-200 bg-white p-2 text-gray-600 shadow-sm transition hover:bg-gray-100 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
      >
        {mode === "dark" ? <Sun size={22} /> : <Moon size={22} />}
      </button>

      <div className="w-full max-w-6xl bg-white dark:bg-black/40 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid md:grid-cols-2 min-h-[650px]">
          
          {/* Left Section */}
          <div className="flex flex-col justify-center px-12 py-10 text-gray-900 dark:text-white">
            <h1 className="text-5xl font-bold leading-tight mb-10">
              Your Healthcare
              <br />
              Network,
              <span className="text-blue-500"> Simplified.</span>
            </h1>

            <div className="space-y-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-100 dark:bg-white rounded-full flex items-center justify-center">
                  <Building2 className="text-blue-600" size={28} />
                </div>
                <span className="text-2xl font-semibold">Hospitals</span>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-100 dark:bg-white rounded-full flex items-center justify-center">
                  <Pill className="text-blue-600" size={28} />
                </div>
                <span className="text-2xl font-semibold">Pharmacies</span>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-100 dark:bg-white rounded-full flex items-center justify-center">
                  <Stethoscope className="text-blue-600" size={28} />
                </div>
                <span className="text-2xl font-semibold">Doctors</span>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-100 dark:bg-white rounded-full flex items-center justify-center">
                  <UserRound className="text-blue-600" size={28} />
                </div>
                <span className="text-2xl font-semibold">Patients</span>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center justify-center p-8">
            <div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white w-full max-w-md rounded-3xl p-8 shadow-xl">
              
              {/* Logo */}
              <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  +
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  MediReach
                </h2>
              </div>

              {/* User Type */}
              <div className="grid grid-cols-2 bg-gray-100 dark:bg-slate-800 rounded-lg p-1 mb-8">
                <button className="py-2 rounded-md text-gray-600 dark:text-slate-300">
                  Hospital
                </button>
                <button className="py-2 rounded-md bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold shadow">
                  Doctor
                </button>
              </div>

              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Welcome Back
              </h3>

              <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
                Secure, fast and reliable healthcare access.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-slate-300">
                    Email / Phone Number
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    className="w-full mt-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-slate-300">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="********"
                    className="w-full mt-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

                <button
                  type="button"
                  className="w-full border border-gray-300 dark:border-slate-700 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  Continue with Google
                </button>
              </form>

              <p className="text-center text-gray-500 dark:text-slate-400 text-sm mt-6">
                Don't have an account?{" "}
                  {/* <Link
                    to="/signup"
                    className="text-blue-600 font-medium cursor-pointer"
                  ></Link> */}
                <span onClick={()=>navigate('/signup')} className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer">
                  Sign Up
                </span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;