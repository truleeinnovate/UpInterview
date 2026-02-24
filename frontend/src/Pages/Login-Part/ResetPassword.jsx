import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useLocation } from "react-router-dom";
import { config } from "../../config";

const ResetPassword = () => {
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" }); // { text: string, type: 'error' | 'success' }
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [type, setType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userType = params.get("type");

    //   console.log("Extracted token:", token); // Log the token
    // console.log("Extracted type:", userType); // Log the type

    if (token) setUserId(token);
    if (userType) setType(userType);
  }, [location.search]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    if (password !== confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      setIsSubmitting(false);
      return;
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      setMessage({
        text: "Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.",
        type: "error",
      });
      setIsSubmitting(false);
      return;
    }

    if (!userId) {
      setMessage({
        text: "Reset link is missing or invalid. Please request a new one.",
        type: "error",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${config.REACT_APP_API_URL}/Organization/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: userId, newPassword: password, type }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: data.message || "Password updated successfully!", type: "success" });
        setTimeout(() => {
          window.location.href = "/organization-login"; // ← simplified — same for both cases
        }, 1800);
      } else {
        // ── Most important part ──
        let errorMessage = "Failed to reset password. Please try again.";

        if (response.status === 400) {
          if (data.message?.toLowerCase().includes("invalid or expired token")) {
            errorMessage = "This reset link has expired or is invalid. Please request a new password reset link.";
          } else if (data.message?.toLowerCase().includes("different from the old password")) {
            errorMessage = "New password must be different from your current password.";
          } else {
            errorMessage = data.message || errorMessage;
          }
        } else if (response.status === 404) {
          errorMessage = "User not found. The link may be invalid or expired.";
        } else if (response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }

        setMessage({ text: errorMessage, type: "error" });
      }
    } catch (error) {
      console.error("Network / fetch error:", error);
      setMessage({
        text: "Could not connect to the server. Please check your internet connection.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            {/* <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-custom-blue">
              <Lock className="h-6 w-6 text-white" />
            </div> */}
            <div className="flex justify-center">
              <img
                src="https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099243/upinterviewLogo_ng1wit.webp"
                alt="Logo"
                className="w-32"
              />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {type === "usercreatepass" ? "Create Your Password" : "Reset Your Password"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {type === "usercreatepass"
                ? "Set up your password for the first time."
                : "Create a new password. Ensure it differs from previous ones."}
            </p>
          </div>

          {message.text && (
            <div className={`mt-4 p-3 rounded-md text-center ${message.type === "error"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
              }`}>
              {message.text}
            </div>
          )}

          <form className="mt-6 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {type === "usercreatepass" ? "Create Password" : "New Password"}
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-custom-blue focus:border-custom-blue pr-10"
                  placeholder={type === "usercreatepass" ? "Create your password" : "Enter new password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\s/g, ""))}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center pt-5"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-custom-blue focus:border-custom-blue pr-10"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value.replace(/\s/g, ""))}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center pt-5"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors ${isSubmitting ? 'bg-custom-blue cursor-not-allowed' : 'bg-custom-blue hover:bg-custom-blue'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {type === "usercreatepass" ? 'Creating...' : 'Resetting...'}
                  </>
                ) : type === "usercreatepass" ? (
                  'Create Password'
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;