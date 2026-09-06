import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { platformLogin } from "../../api/backend";
import { ROLE } from "../../constants/Role";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../../redux/slices/authSlice";

/*
  Platform owner sign-in (/admin/login). Separate endpoint from the role login:
  POST /platform/login, and it dispatches the same loginSuccess action.
  The already-signed-in redirect, the alert() on failure and the inert
  "Forgot Password?" button are all unchanged.
*/

const LoginPlatformAdmin = () => {
  const dispatch = useDispatch();
  const { token, role } = useSelector((state) => state.auth);

  if (token && role === ROLE.platform_admin) {
    return <Navigate to="/platform-dashboard" replace />;
  }


  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    try{
      const response = await platformLogin(
        formData.email,
        formData.password
      );
      console.log(response.data);
      if (response.data.success) {
      dispatch(loginSuccess({
        token: response.data.token,
        role: response.data.user.role,
        user: response.data.user,
      }));

      navigate("/platform-dashboard");
    }
    }catch(error){
      console.error(error);
      alert(error?.response?.data?.message || "Login Failed")
    }
  };

  const field =
    "w-full rounded-control border border-outline-variant bg-surface-container px-3.5 py-3 text-body-md text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary";

  return (
    <div className="min-h-screen bg-background px-4 py-8 text-on-background">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-card border border-outline-variant bg-surface-lowest lg:grid-cols-2">

        {/* Left Section */}
        <div className="hidden flex-col justify-between gap-10 border-r border-outline-variant bg-primary-container/10 px-10 py-12 lg:flex">
          <span className="flex h-12 w-12 items-center justify-center rounded-card bg-primary text-on-primary">
            <ShieldCheck size={24} />
          </span>

          <div>
            <p className="text-label-caps uppercase text-primary">Platform owner</p>
            <h1 className="mt-2 font-display text-hero text-balance text-on-surface">
              Welcome back, administrator
            </h1>
            <p className="mt-4 max-w-md text-body-lg text-on-surface-variant">
              Monitor hospitals, manage healthcare networks, oversee operations and drive
              mediReach from one centralized platform.
            </p>
          </div>

          <p className="text-body-sm text-on-surface-variant">
            This gateway is separate from the hospital, doctor and pharmacy sign-in.
          </p>
        </div>

        {/* Right Section */}
        <div className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <div className="flex flex-col items-center text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-primary-container/20 text-primary">
                <ShieldCheck size={26} />
              </span>

              <h2 className="mt-4 font-display text-headline-lg text-on-surface">Admin login</h2>
              <p className="mt-1 text-body-md text-on-surface-variant">
                Access the mediReach control center
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-label-md text-on-surface-variant">
                  Email address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@medireach.com"
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
                  placeholder="••••••••"
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
                className="w-full rounded-control bg-primary py-3 text-body-md font-semibold text-on-primary transition hover:brightness-110"
              >
                Sign in
              </button>
            </form>

            <p className="mt-8 text-center text-body-sm text-on-surface-variant">
              Authorized mediReach personnel only
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPlatformAdmin;
