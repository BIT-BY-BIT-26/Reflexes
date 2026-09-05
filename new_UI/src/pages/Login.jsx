import React from "react";

import {
  Building2,
  Lock,
  Pill,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { loginUser } from "../api/backend";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ROLE } from "../constants/Role";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/slices/authSlice";

/*
  Single sign-in for all four roles - the server decides which one you are and
  the switch below routes accordingly.

  Preserved exactly, including the bug: `ROLE.hospital_admin` is undefined
  (constants/Role.js calls it `admin`), so hospital admins fall through to
  navigate("/") and only reach their dashboard because PublicRoute bounces them
  there. Left alone per the brief.

  The Hospital/Doctor tabs, "Forgot Password?" and "Continue with Google" have
  no handlers in the current UI and remain inert here.
*/

const audiences = [
  { icon: Building2, label: "Hospitals", copy: "Departments, staff and OPD scheduling" },
  { icon: Stethoscope, label: "Doctors", copy: "Live token queue and consultations" },
  { icon: Pill, label: "Pharmacies", copy: "Batch inventory and expiry tracking" },
  { icon: UserRound, label: "Patients", copy: "Bookings, reports and prescriptions" },
];

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  const field =
    "w-full rounded-control border border-outline-variant bg-surface-container px-3.5 py-3 text-body-md text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary";

  return (
    <div className="min-h-screen bg-background px-4 py-8 text-on-background">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-card border border-outline-variant bg-surface-lowest lg:grid-cols-[1.05fr_1fr]">

        {/* Brand panel */}
        <div className="flex flex-col justify-between gap-10 border-b border-outline-variant bg-primary-container/10 px-8 py-10 lg:border-b-0 lg:border-r lg:px-10 lg:py-12">
          <div>
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-card bg-primary text-on-primary">
                <Stethoscope size={20} />
              </span>
              <span>
                <span className="block font-display text-title-card text-on-surface">
                  mediReach
                </span>
                <span className="block text-label-caps uppercase text-on-surface-variant">
                  Clinical Gateway
                </span>
              </span>
            </span>

            <h1 className="mt-10 max-w-md font-display text-hero text-balance text-on-surface">
              Your healthcare network, in one place.
            </h1>

            <p className="mt-4 max-w-md text-body-lg text-on-surface-variant">
              One sign-in for every role on the platform. Where you land is decided by the
              account, not by this page.
            </p>
          </div>

          <ul className="flex flex-col gap-3">
            {audiences.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.label}
                  className="flex items-center gap-3 rounded-card border border-outline-variant bg-surface-lowest px-4 py-3"
                >
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-control bg-primary-container/20 text-primary">
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-body-md font-medium text-on-surface">
                      {item.label}
                    </span>
                    <span className="block text-body-sm text-on-surface-variant">
                      {item.copy}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="flex flex-wrap items-center gap-x-5 gap-y-2 text-body-sm text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} />
              Role-scoped access
            </span>
            <span className="flex items-center gap-1.5">
              <Lock size={14} />
              Sessions expire after 7 days
            </span>
          </p>
        </div>

        {/* Sign-in card */}
        <div className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <p className="text-label-caps uppercase text-primary">Sign in</p>
            <h2 className="mt-1 font-display text-headline-lg text-on-surface">Welcome back</h2>
            <p className="mt-2 text-body-md text-on-surface-variant">
              Secure, fast and reliable healthcare access.
            </p>

            {/* Role tabs - decorative in the current UI, left inert */}
            <div className="mt-6 grid grid-cols-2 gap-1 rounded-control border border-outline-variant bg-surface-container p-1">
              <button className="rounded-control py-2 text-body-md text-on-surface-variant">
                Hospital
              </button>
              <button className="rounded-control bg-surface-lowest py-2 text-body-md font-medium text-primary">
                Doctor
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-label-md text-on-surface-variant">
                  Email / phone number
                </label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  className={field}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-label-md text-on-surface-variant">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="********"
                  className={field}
                />
              </div>

              <div className="text-right">
                <button
                  type="button"
                  className="text-body-sm font-medium text-primary hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-control bg-primary py-3 text-body-md font-semibold text-on-primary transition hover:brightness-110 disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <button
                type="button"
                className="w-full rounded-control border border-outline-variant py-3 text-body-md font-medium text-on-surface transition hover:bg-surface-container"
              >
                Continue with Google
              </button>
            </form>

            <p className="mt-6 text-center text-body-md text-on-surface-variant">
              Don't have an account?{" "}
              <span
                onClick={() => navigate("/signup")}
                className="cursor-pointer font-medium text-primary hover:underline"
              >
                Sign Up
              </span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
