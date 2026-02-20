import React, { useState } from 'react';
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { ClipLoader } from 'react-spinners';
import api from '../api/axios';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err,setErr] = useState("")
  const [loading,setLoading] = useState(false);

  const navigate = useNavigate();
  const handleSendOtp = async () => {
    setLoading(true)
    try {
      const result = await api.post(
        'auth/send-otp',
        { email },
        { withCredentials: true }
      );
      console.log(result);
      setErr("")
      setLoading(false)
      setStep(2);
    } catch (error) {
      setErr(error?.response?.data?.message);
      setLoading(false);
    }
  };

  // STEP 2 -> VERIFY OTP
  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const result = await api.post(
        '/auth/verify-otp',
        { email, otp },
        { withCredentials: true }
      );
      console.log(result);
      setErr("")
      setStep(3);
      setLoading(false);
    } catch (error) {
      setErr(error?.response?.data?.message);
      setLoading(false);
    }
  };

  // STEP 3 -> RESET PASSWORD
  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
  setLoading(true);
    try {
      const result = await api.post(
        `/auth/reset-password`,
        { email, newPassword },
        { withCredentials: true }
      );

      console.log(result);
      setErr("")
      setLoading(false);
      navigate('/signin');
    } catch (error) {
      setErr(error?.response?.data?.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full items-center min-h-screen p-4">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6 w-full max-w-md">
        <IoMdArrowRoundBack
          className="text-2xl cursor-pointer"
          onClick={() => navigate('/signin')}
        />
        <h1 className="text-2xl font-bold text-[#ff4d2d]">Forgot Password</h1>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="w-full max-w-md bg-white shadow-md rounded-xl p-5">
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
          />
          <button
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-2 rounded-lg"
          >
            {loading?<ClipLoader size={20} color='white'/>:"send otp"}
          </button>

         <p className='text-red-500 text-center my-[10px]'>{err}</p>

        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="w-full max-w-md bg-white shadow-md rounded-xl p-5">
          <label className="block text-gray-700 font-medium mb-1">Enter OTP</label>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
            required
          />
          <button
            onClick={handleVerifyOtp}
            className="w-full bg-orange-500 text-white py-2 rounded-lg"
          >{loading?<ClipLoader size={20} color='white'/>:"Verifyotp"}
            Verify OTP
          </button>
           <p className='text-red-500 text-center my-[10px]'>{err}</p>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="w-full max-w-md bg-white shadow-md rounded-xl p-5">
          <label className="block text-gray-700 font-medium mb-1">New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
            required
          />

          <label className="block text-gray-700 font-medium mb-1">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
            required
          />

          <button
            onClick={handleResetPassword}
            className="w-full bg-orange-500 text-white py-2 rounded-lg"
          >{loading?<ClipLoader size={20} color='white'/>:"reset password"}
            Reset Password
          </button>
           <p className='text-red-500 text-center my-[10px]'>{err}</p>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
