import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { verifyOTP } from "./authSlice"; // Assuming you will create this action

const OTPPage = () => {
  const location = useLocation();
  const { email } = location.state || ""; // Email passed from login page
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    const resultAction = await dispatch(verifyOTP({ email, otp }));

    if (verifyOTP.fulfilled.match(resultAction)) {
      navigate("/upload"); // Redirect to upload page upon success
    } else {
      setError("Invalid OTP. Please try again.");
      console.error("OTP verification failed:", resultAction.error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleOtpSubmit}
        className="w-full max-w-md bg-white shadow-md rounded-lg p-8"
      >
        <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
          Enter OTP
        </h2>
        <div className="mb-4">
          <label htmlFor="otp" className="block text-gray-600 font-medium mb-2">
            OTP:
          </label>
          <input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Verify OTP
        </button>
      </form>
    </div>
  );
};

export default OTPPage;
