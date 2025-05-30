import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useLocation } from "react-router-dom";
import { config } from "../../config";

const ResetPassword = () => {
  console.log("ResetPassword");
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [type, setType] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userType = params.get("type"); // Get type from URL

    if (token) setUserId(token);
    if (userType) setType(userType);
  }, [location.search]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password !== newPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      setMessage(
        "Password must be at least 8 characters long and include an uppercase letter, a number, and a special character."
      );
      return;
    }

    try {
      const response = await fetch(`${config.REACT_APP_API_URL}/Organization/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: userId, newPassword, type }), // Pass type to backend
      });

      const data = await response.json();
      setMessage(data.message);
      if (data.success) {
        window.location.href = "/organization-login";
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center mt-10">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-teal-100">
            <Lock className="h-6 w-6 text-teal-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {type === "usercreatepass" ? "Create Your Password" : "Set a new password"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {message || 
              (type === "usercreatepass" 
                ? "Set up your password for the first time." 
                : "Create a new password. Ensure it differs from previous ones for security.")}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {type === "usercreatepass" ? "Create Password" : "New Password"}
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
                placeholder={type === "usercreatepass" ? "Create your password" : "Enter your new password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-600 mt-5" /> : <Eye className="h-5 w-5 text-gray-600 mt-5" />}
              </button>
            </div>
            <div className="relative">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
                placeholder="Re-enter password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5 mt-5 text-gray-600" /> : <Eye className="h-5 w-5 text-gray-600 mt-5" />}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
            >
              {type === "usercreatepass" ? "Create Password" : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
