import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [activeTab, setActiveTab] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepLogged, setKeepLogged] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem("userRole", activeTab);
    navigate("/dashboard");
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#FCF3EB" }}
    >
      {/* Corner Shapes */}
      <img
        src="/orange2.svg"
        alt="decoration"
        className="absolute top-0 left-0 w-48 md:w-104 select-none pointer-events-none"
      />
      <img
        src="/orange1.svg"
        alt="decoration"
        className="absolute top-0 left-0 w-20 md:w-42 select-none pointer-events-none"
      />
      <img
        src="/orange3.svg"
        alt="decoration"
        className="absolute -bottom-14 right-0 w-64 md:w-156 select-none pointer-events-none"
      />
      <img
        src="/orange4.svg"
        alt="decoration"
        className="absolute -bottom-6 right-0 w-40 md:w-96 select-none pointer-events-none"
      />

      {/* Main Login Card Wrapper to allow Logo positioning */}
      <div className="relative w-full max-w-150 px-4 sm:px-0 flex justify-center items-center">
        {/* Logo protruding from top */}
        <div className="absolute -top-20 left-0 right-0 z-10 flex justify-center w-full">
          <img
            src="/logo_whitebg.svg"
            alt="Logo"
            className="w-43 h-43 drop-shadow-sm rounded-full object-cover"
          />
        </div>

        {/* Card Component */}
        <div className="bg-white rounded-4xl shadow-xl p-8 pt-20 relative w-135 h-137.5 border border-gray-100 flex flex-col justify-center">
          {/* Tabs */}
          <div
            className="flex w-full mb-6 border rounded-xl border-[#F68E5F] p-2"
            style={{ fontFamily: "'Nunito Sans', sans-serif" }}
          >
            <button
              type="button"
              className={`flex-1 py-2 text-[16px] font-semibold font-['Nunito_Sans'] rounded-xl transition-colors duration-200 ${
                activeTab === "Admin"
                  ? "bg-[#F68E5F] text-white shadow-sm"
                  : "text-[#F68E5F] bg-transparent"
              }`}
              onClick={() => setActiveTab("Admin")}
            >
              Admin
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-[16px] font-semibold font-['Nunito_Sans'] rounded-xl transition-colors duration-200 ${
                activeTab === "Employee"
                  ? "bg-[#F68E5F] text-white shadow-sm"
                  : "text-[#F68E5F] bg-transparent"
              }`}
              onClick={() => setActiveTab("Employee")}
            >
              Employee
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-[16px] font-normal font-['Inter'] text-gray-700">
                Email
              </label>
              <input
                type="text"
                placeholder={
                  activeTab === "Admin"
                    ? "admin123@gmail.com"
                    : "employee123@gmail.com"
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-full text-gray-800 font-['Inter'] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F68E5F]/30 transition-colors"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-[16px] font-normal font-['Inter'] text-gray-700">
                Password
              </label>
              <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-full text-gray-800 font-['Inter'] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F68E5F]/30 transition-colors"
                required
              />
            </div>

            {/* Checkbox and Forgot Password */}
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input
                    type="checkbox"
                    checked={keepLogged}
                    onChange={(e) => setKeepLogged(e.target.checked)}
                    className="peer appearance-none w-5 h-5 border-2 border-gray-400 rounded bg-white checked:bg-[#F68E5F] checked:border-[#F68E5F] focus:outline-none focus:ring-2 focus:ring-[#F68E5F]/30 focus:ring-offset-1 transition-all"
                  />
                  <svg
                    className="absolute w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-sm font-normal font-['Inter'] text-[#757575] group-hover:text-gray-700 transition-colors">
                  Keep me logged in
                </span>
              </label>

              <button
                type="button"
                className="text-[16px] font-normal font-['Inter'] text-[#F68E5F] mt-5 hover:text-[#ff702d] transition-colors underline-offset-4 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 mt-14 text-white font-medium font-['Nunito_Sans'] rounded-full shadow-md transition-transform active:scale-[0.98] bg-[#F68E5F] hover:bg-[#ff702d] flex items-center justify-center gap-2"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
