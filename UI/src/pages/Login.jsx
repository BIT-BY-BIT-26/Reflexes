import React from "react";
import {
  Building2,
  Stethoscope,
  Pill,
  UserRound,
} from "lucide-react";

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#03131f] via-[#02111d] to-[#123b59] flex items-center justify-center px-4">
      <div className="w-full max-w-6xl bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid md:grid-cols-2 min-h-[650px]">
          
          {/* Left Section */}
          <div className="flex flex-col justify-center px-12 py-10 text-white">
            <h1 className="text-5xl font-bold leading-tight mb-10">
              Your Healthcare
              <br />
              Network,
              <span className="text-blue-500"> Simplified.</span>
            </h1>

            <div className="space-y-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                  <Building2 className="text-blue-600" size={28} />
                </div>
                <span className="text-2xl font-semibold">Hospitals</span>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                  <Pill className="text-blue-600" size={28} />
                </div>
                <span className="text-2xl font-semibold">Pharmacies</span>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                  <Stethoscope className="text-blue-600" size={28} />
                </div>
                <span className="text-2xl font-semibold">Doctors</span>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                  <UserRound className="text-blue-600" size={28} />
                </div>
                <span className="text-2xl font-semibold">Patients</span>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center justify-center p-8">
            <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-xl">
              
              {/* Logo */}
              <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  +
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  MediReach
                </h2>
              </div>

              {/* User Type */}
              <div className="grid grid-cols-2 bg-gray-100 rounded-lg p-1 mb-8">
                <button className="py-2 rounded-md text-gray-600">
                  Hospital
                </button>
                <button className="py-2 rounded-md bg-white text-blue-600 font-semibold shadow">
                  Doctor
                </button>
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome Back
              </h3>

              <p className="text-gray-500 text-sm mb-6">
                Secure, fast and reliable healthcare access.
              </p>

              <form className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Email / Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter email or phone"
                    className="w-full mt-2 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="********"
                    className="w-full mt-2 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Login
                </button>

                <button
                  type="button"
                  className="w-full border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50"
                >
                  Continue with Google
                </button>
              </form>

              <p className="text-center text-gray-500 text-sm mt-6">
                Don't have an account?{" "}
                <span className="text-blue-600 font-medium cursor-pointer">
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