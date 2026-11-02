import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../Pages/translation/LanguageContext";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [token, setToken] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    isValid: false,
    metCount: 0,
    totalRequired: 5,
    missingRequirements: [],
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();
  const { translate } = useLanguage();

  // Extract token from URL when component mounts
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenParam = queryParams.get("token");

    if (!tokenParam) {
      setError(
        "Invalid or missing reset token. Please request a new password reset.",
      );
    } else {
      setToken(tokenParam);
    }
  }, [location]);

  // Check password strength in real-time
  const checkPasswordStrength = (pwd) => {
    const requirements = {
      minLength: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      digit: /[0-9]/.test(pwd),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };

    const missing = [];
    if (!requirements.minLength) missing.push("At least 8 characters");
    if (!requirements.uppercase) missing.push("One uppercase letter (A-Z)");
    if (!requirements.lowercase) missing.push("One lowercase letter (a-z)");
    if (!requirements.digit) missing.push("One number (0-9)");
    if (!requirements.specialChar)
      missing.push("One special character (!@#$%^&* etc.)");

    const metCount = Object.values(requirements).filter(Boolean).length;
    const isValid = metCount === 5;

    return {
      isValid,
      metCount,
      totalRequired: 5,
      missingRequirements: missing,
      strengthPercent: (metCount * 100) / 5,
    };
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));

    // Clear errors when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (!passwordStrength.isValid) {
      setError(
        `Password is too weak. ${passwordStrength.missingRequirements.join(", ")}`,
      );
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await resetPassword({
        token: token,
        newPassword: password,
        confirmPassword: confirmPassword,
      });

      if (response.status) {
        setSuccess("Password reset successful! Redirecting to login...");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(
          response.message || "Failed to reset password. Please try again.",
        );
      }
    } catch (err) {
      setError(
        err.message || "An error occurred. Please request a new reset link.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Get strength color and text
  const getStrengthInfo = () => {
    const percent = passwordStrength.strengthPercent;
    if (percent === 0)
      return {
        color: "bg-gray-200",
        text: "Not started",
        textColor: "text-gray-500",
      };
    if (percent <= 20)
      return {
        color: "bg-red-500",
        text: "Very Weak",
        textColor: "text-red-500",
      };
    if (percent <= 40)
      return {
        color: "bg-orange-500",
        text: "Weak",
        textColor: "text-orange-500",
      };
    if (percent <= 60)
      return {
        color: "bg-yellow-500",
        text: "Fair",
        textColor: "text-yellow-600",
      };
    if (percent <= 80)
      return {
        color: "bg-blue-500",
        text: "Strong",
        textColor: "text-blue-500",
      };
    return {
      color: "bg-green-500",
      text: "Very Strong",
      textColor: "text-green-500",
    };
  };

  const strengthInfo = getStrengthInfo();

  return (
    <div className="w-full flex justify-center items-center bg-gray-50 py-10">
      <div className="w-full max-w-[500px] px-4">
        <form
          onSubmit={handleSubmit}
          className="pt-[55px] pb-[65px] px-[38px] border border-[#FDC700] bg-white max-sm:p-2 max-sm:border-none"
        >
          <p className="mb-[29px] text-[24px] font-bold leading-[32px] text-center">
            Reset Your Password
          </p>

          <p className="text-[14px] text-gray-600 mb-[20px] text-center">
            Please enter your new password below.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-center">
              {success}
            </div>
          )}

          <div className="flex flex-col mb-[23px]">
            {/* New Password Field */}
            <div className="flex flex-col mb-[15px]">
              <label className="text-[13px] mb-[5px] font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                required
                disabled={loading || !token}
                placeholder="Enter your new password"
                className="p-[13px] border border-[#c4c4c4] outline-none w-full focus:border-[#FDC700] transition rounded"
              />

              {/* Password Strength Meter */}
              {password && (
                <div className="mt-3">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strengthInfo.color} transition-all duration-300`}
                      style={{ width: `${passwordStrength.strengthPercent}%` }}
                    />
                  </div>
                  <p
                    className={`text-[11px] mt-1 ${strengthInfo.textColor} font-medium`}
                  >
                    Password strength: {strengthInfo.text}
                  </p>

                  {/* Requirements list */}
                  <div className="mt-3 space-y-1">
                    <p className="text-[11px] font-medium text-gray-600 mb-1">
                      Password must contain:
                    </p>
                    <ul className="text-[11px] space-y-1">
                      <li
                        className={
                          passwordStrength.missingRequirements.includes(
                            "At least 8 characters",
                          )
                            ? "text-red-500"
                            : "text-green-500"
                        }
                      >
                        ✓{" "}
                        {passwordStrength.missingRequirements.includes(
                          "At least 8 characters",
                        )
                          ? "❌"
                          : "✅"}{" "}
                        At least 8 characters
                      </li>
                      <li
                        className={
                          passwordStrength.missingRequirements.includes(
                            "One uppercase letter (A-Z)",
                          )
                            ? "text-red-500"
                            : "text-green-500"
                        }
                      >
                        ✓{" "}
                        {passwordStrength.missingRequirements.includes(
                          "One uppercase letter (A-Z)",
                        )
                          ? "❌"
                          : "✅"}{" "}
                        One uppercase letter (A-Z)
                      </li>
                      <li
                        className={
                          passwordStrength.missingRequirements.includes(
                            "One lowercase letter (a-z)",
                          )
                            ? "text-red-500"
                            : "text-green-500"
                        }
                      >
                        ✓{" "}
                        {passwordStrength.missingRequirements.includes(
                          "One lowercase letter (a-z)",
                        )
                          ? "❌"
                          : "✅"}{" "}
                        One lowercase letter (a-z)
                      </li>
                      <li
                        className={
                          passwordStrength.missingRequirements.includes(
                            "One number (0-9)",
                          )
                            ? "text-red-500"
                            : "text-green-500"
                        }
                      >
                        ✓{" "}
                        {passwordStrength.missingRequirements.includes(
                          "One number (0-9)",
                        )
                          ? "❌"
                          : "✅"}{" "}
                        One number (0-9)
                      </li>
                      <li
                        className={
                          passwordStrength.missingRequirements.includes(
                            "One special character (!@#$%^&* etc.)",
                          )
                            ? "text-red-500"
                            : "text-green-500"
                        }
                      >
                        ✓{" "}
                        {passwordStrength.missingRequirements.includes(
                          "One special character (!@#$%^&* etc.)",
                        )
                          ? "❌"
                          : "✅"}{" "}
                        One special character (!@#$%^&* etc.)
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col mb-[15px]">
              <label className="text-[13px] mb-[5px] font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error && error.includes("match")) setError("");
                }}
                required
                disabled={loading || !token}
                placeholder="Confirm your new password"
                className="p-[13px] border border-[#c4c4c4] outline-none w-full focus:border-[#FDC700] transition rounded"
              />

              {/* Show match indicator */}
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-[11px] mt-1">
                  Passwords do not match
                </p>
              )}
              {confirmPassword &&
                password === confirmPassword &&
                password.length > 0 && (
                  <p className="text-green-500 text-[11px] mt-1">
                    ✓ Passwords match
                  </p>
                )}
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                !token ||
                !passwordStrength.isValid ||
                password !== confirmPassword
              }
              className="bg-[#FDC700] text-[16px] mb-[15px] p-[14px] font-bold disabled:opacity-50 hover:bg-[#e5b300] transition rounded"
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-[14px] text-[#2096D8] underline hover:text-[#167ab3] transition text-center"
            >
              Return to login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
