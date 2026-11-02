import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { FaApple } from "react-icons/fa";
import { IoCheckmarkSharp } from "react-icons/io5";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../translation/LanguageContext";

export default function Login() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [accountType, setAccountType] = useState("natural");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  // Password strength state for registration
  const [passwordStrength, setPasswordStrength] = useState({
    isValid: false,
    metCount: 0,
    totalRequired: 5,
    missingRequirements: [],
    strengthPercent: 0,
  });

  const { login, register, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const { translate } = useLanguage();

  // Login form state
  const [loginForm, setLoginForm] = useState({
    User_Email: "",
    Password: "",
  });

  // Register form state for natural person
  const [registerForm, setRegisterForm] = useState({
    User_FullName: "",
    User_Email: "",
    Password: "",
    PasswordConfirm: "",
    User_IsCompany: false,
    // Company specific fields
    Company_Name: "",
    Company_Address: "",
    Company_TaxNumber: "",
    Company_PostCode: "",
    Company_City: "",
    Company_Country: "",
    Company_Phone: "",
  });
  const handlePrivacyPolicyNavigation = () => {
    window.scrollTo(0, 0);
    navigate("/privacy-policy");
  };

  // Check password strength function
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
    const strengthPercent = (metCount * 100) / 5;

    return {
      isValid,
      metCount,
      totalRequired: 5,
      missingRequirements: missing,
      strengthPercent,
      requirements,
    };
  };

  // Get strength color and text
  const getStrengthInfo = (strengthPercent) => {
    if (strengthPercent === 0)
      return {
        color: "bg-gray-200",
        text: "Not started",
        textColor: "text-gray-500",
      };
    if (strengthPercent <= 20)
      return {
        color: "bg-red-500",
        text: "Very Weak",
        textColor: "text-red-500",
      };
    if (strengthPercent <= 40)
      return {
        color: "bg-orange-500",
        text: "Weak",
        textColor: "text-orange-500",
      };
    if (strengthPercent <= 60)
      return {
        color: "bg-yellow-500",
        text: "Fair",
        textColor: "text-yellow-600",
      };
    if (strengthPercent <= 80)
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

  // Handle password change with real-time strength check
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setRegisterForm({
      ...registerForm,
      Password: newPassword,
    });
    const strength = checkPasswordStrength(newPassword);
    setPasswordStrength(strength);

    // Clear password-related errors
    if (error && (error.includes("Password") || error.includes("password"))) {
      setError("");
    }
  };

  // List of countries
  const countries = [
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bhutan",
    "Bolivia",
    "Bosnia and Herzegovina",
    "Botswana",
    "Brazil",
    "Brunei",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cabo Verde",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Central African Republic",
    "Chad",
    "Chile",
    "China",
    "Colombia",
    "Comoros",
    "Congo",
    "Costa Rica",
    "Croatia",
    "Cuba",
    "Cyprus",
    "Czech Republic",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Eswatini",
    "Ethiopia",
    "Fiji",
    "Finland",
    "France",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Greece",
    "Grenada",
    "Guatemala",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Honduras",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Korea, North",
    "Korea, South",
    "Kosovo",
    "Kuwait",
    "Kyrgyzstan",
    "Laos",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Mauritania",
    "Mauritius",
    "Mexico",
    "Micronesia",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Morocco",
    "Mozambique",
    "Myanmar",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "North Macedonia",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Palestine",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Qatar",
    "Romania",
    "Russia",
    "Rwanda",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Vincent and the Grenadines",
    "Samoa",
    "San Marino",
    "Sao Tome and Principe",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "South Africa",
    "South Sudan",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Suriname",
    "Sweden",
    "Switzerland",
    "Syria",
    "Taiwan",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Timor-Leste",
    "Togo",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Vatican City",
    "Venezuela",
    "Vietnam",
    "Yemen",
    "Zambia",
    "Zimbabwe",
  ];

  // Handle login input changes
  const handleLoginChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value,
    });
  };

  // Handle register input changes
  const handleRegisterChange = (e) => {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value,
    });
  };

  // Handle login submit
  // Handle login submit
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login({
        User_Email: loginForm.User_Email,
        Password: loginForm.Password,
      });

      if (response.status) {
        // Check if maintenance mode is on and user is not SuperAdmin
        const isMaintenanceMode =
          localStorage.getItem("maintenance_mode") === "true";
        const isSuperAdmin =
          response.user?.superAdmin === true ||
          response.user?.SuperAdmin === true;

        if (isMaintenanceMode && !isSuperAdmin) {
          // Redirect to maintenance page
          navigate("/maintenance");
        } else {
          // Redirect to profile
          navigate("/profile");
        }
        setLoginForm({ User_Email: "", Password: "" });
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password submit
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordError("");
    setForgotPasswordMessage("");
    setForgotPasswordLoading(true);

    try {
      const response = await forgotPassword({
        User_Email: forgotPasswordEmail,
      });

      if (response.status) {
        setForgotPasswordMessage(
          "If an account with that email exists, password reset instructions have been sent.",
        );
        setTimeout(() => {
          setForgotPasswordEmail("");
        }, 3000);
      } else {
        setForgotPasswordError(
          response.message || "Something went wrong. Please try again.",
        );
      }
    } catch (err) {
      setForgotPasswordError(
        err.message || "Failed to send reset email. Please try again.",
      );
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Return to login from forgot password
  const handleReturnToLogin = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail("");
    setForgotPasswordMessage("");
    setForgotPasswordError("");
  };

  // Handle register submit
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Check if passwords match
    if (registerForm.Password !== registerForm.PasswordConfirm) {
      setError("Passwords do not match");
      return;
    }

    // Check password strength
    if (!passwordStrength.isValid) {
      setError(
        `Password is too weak. ${passwordStrength.missingRequirements.join(", ")}`,
      );
      return;
    }

    // Validate company fields if registering as company
    if (accountType === "company") {
      if (!registerForm.Company_Name) {
        setError("Company name is required");
        return;
      }
      if (!registerForm.Company_Address) {
        setError("Company address is required");
        return;
      }
      if (!registerForm.Company_TaxNumber) {
        setError("Tax number is required");
        return;
      }
      if (!registerForm.Company_PostCode) {
        setError("Post code is required");
        return;
      }
      if (!registerForm.Company_City) {
        setError("City is required");
        return;
      }
      if (!registerForm.Company_Country) {
        setError("Country is required");
        return;
      }
      if (!registerForm.Company_Phone) {
        setError("Phone number is required");
        return;
      }
    }

    setLoading(true);

    try {
      let userData;

      if (accountType === "company") {
        userData = {
          user_Email: registerForm.User_Email,
          password: registerForm.Password,
          passwordConfirm: registerForm.PasswordConfirm,
          user_IsCompany: true,
          user_Phone: registerForm.Company_Phone || "",
          company_Name: registerForm.Company_Name,
          company_Address: registerForm.Company_Address,
          company_TaxNumber: registerForm.Company_TaxNumber,
          company_PostCode: registerForm.Company_PostCode,
          company_City: registerForm.Company_City,
          company_Country: registerForm.Company_Country,
          company_Phone: registerForm.Company_Phone,
        };
      } else {
        userData = {
          user_FullName: registerForm.User_FullName,
          user_Email: registerForm.User_Email,
          password: registerForm.Password,
          passwordConfirm: registerForm.PasswordConfirm,
          user_IsCompany: false,
          user_Phone: registerForm.User_Phone || "",
        };
      }
      const response = await register(userData);

      if (response.status && response.token) {
        alert("Registration successful! Please login.");

        // Switch back to login view
        setIsLoginView(true);

        // Clear register form
        setRegisterForm({
          User_FullName: "",
          User_Email: "",
          Password: "",
          PasswordConfirm: "",
          User_IsCompany: false,
          Company_Name: "",
          Company_Address: "",
          Company_TaxNumber: "",
          Company_PostCode: "",
          Company_City: "",
          Company_Country: "",
          Company_Phone: "",
        });

        // Reset password strength
        setPasswordStrength({
          isValid: false,
          metCount: 0,
          totalRequired: 5,
          missingRequirements: [],
          strengthPercent: 0,
        });

        // Pre-fill login email
        setLoginForm({
          User_Email: registerForm.User_Email,
          Password: "",
        });
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError("");
    setLoginForm({ User_Email: "", Password: "" });
    setRegisterForm({
      User_FullName: "",
      User_Email: "",
      Password: "",
      PasswordConfirm: "",
      User_IsCompany: false,
      Company_Name: "",
      Company_Address: "",
      Company_TaxNumber: "",
      Company_PostCode: "",
      Company_City: "",
      Company_Country: "",
      Company_Phone: "",
    });
    // Reset password strength when switching views
    setPasswordStrength({
      isValid: false,
      metCount: 0,
      totalRequired: 5,
      missingRequirements: [],
      strengthPercent: 0,
    });
  };

  // FORGOT PASSWORD MODAL VIEW
  if (showForgotPassword) {
    return (
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[1240px] flex max-lg:flex-col justify-center my-[20px] items-start">
          <div className="w-full max-w-[500px]">
            <form
              onSubmit={handleForgotPassword}
              className="pt-[55px] pb-[65px] px-[38px] border border-[#FDC700] w-full max-sm:border-none"
            >
              <p className="mb-[29px] text-[24px] font-bold leading-[32px] text-center">
                Forgot your password?
              </p>

              <p className="text-[14px] text-gray-600 mb-[20px] text-center">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>

              {forgotPasswordMessage && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-center">
                  {forgotPasswordMessage}
                </div>
              )}

              {forgotPasswordError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">
                  {forgotPasswordError}
                </div>
              )}

              <div className="flex flex-col mb-[23px]">
                <div className="flex flex-col mb-[11px]">
                  <label className="text-[13px] mb-[5px] font-medium">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    className="p-[13px] border border-[#c4c4c4] outline-none w-full focus:border-[#FDC700] transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className="bg-[#FDC700] text-[16px] mb-[15px] p-[14px] font-bold disabled:opacity-50 hover:bg-[#e5b300] transition"
                >
                  {forgotPasswordLoading ? "Sending..." : "Send reset link"}
                </button>

                <button
                  type="button"
                  onClick={handleReturnToLogin}
                  className="text-[12px] underline hover:text-[#2096D8] transition text-center"
                >
                  Return to login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[1240px] flex max-md:flex-col max-md:gap-16 gap-4 justify-center my-[20px] items-center">
        {isLoginView ? (
          // LOGIN VIEW
          <>
            {/* Left Side - Login Form */}
            <form
              onSubmit={handleLogin}
              className="mr-[50px] max-lg:mr-0 pt-[55px] max-sm:p-4  pb-[65px] px-[38px] border border-[#FDC700] max-sm:border-none max-w-[643px] w-full"
            >
              <p className="mb-[29px] text-[21px] font-bold leading-[26px]">
                {translate("signInTo")}
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="flex flex-col mb-[23px]">
                <div className="flex items-center mb-[11px] max-sm:flex-col max-sm:items-start">
                  <span className="text-[13px] w-full max-w-[124px]">
                    {translate("eMail")}
                  </span>
                  <input
                    type="email"
                    name="User_Email"
                    value={loginForm.User_Email}
                    onChange={handleLoginChange}
                    required
                    className="p-[13px] border border-[#c4c4c4] outline-none w-full"
                  />
                </div>
                <div className="flex items-center mb-[11px] max-sm:flex-col max-sm:items-start">
                  <span className="text-[13px] w-full max-w-[124px]">
                    {translate("password")}
                  </span>
                  <input
                    type="password"
                    name="Password"
                    value={loginForm.Password}
                    onChange={handleLoginChange}
                    required
                    className="p-[13px] border border-[#c4c4c4] outline-none w-full"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#FDC700] text-[16px] mb-[5px] p-[14px] font-bold disabled:opacity-50"
                >
                  {loading ? translate("loggingIn") : translate("login")}
                </button>
              </div>
              <div className="flex max-sm:flex-col justify-between mb-[30px] max-sm:gap-6">
                <div className="flex items-end max-sm:items-center gap-2 pr-[15px] max-sm:border-b max-sm:border-b-[#E5E5E5] pb-3">
                  <FcGoogle size={28} />
                  <p className="text-[11px] text-[#828282]">
                    {translate("signInWithGoogle")}
                  </p>
                </div>
                <div className="flex items-end max-sm:items-center gap-2 px-[15px] max-sm:border-b max-sm:border-b-[#E5E5E5] pb-3 max-sm:px-0">
                  <FaFacebook size={28} color="#4267B2" />
                  <p className="text-[11px] text-[#828282]">
                    {translate("signInWithFb")}
                  </p>
                </div>
                <div className="flex items-end max-sm:items-center gap-2 px-[15px] max-sm:border-b max-sm:border-b-[#E5E5E5] pb-3 max-sm:px-0">
                  <FaApple size={28} />
                  <p className="text-[11px] text-[#828282]">
                    {translate("signInWithApple")}
                  </p>
                </div>
              </div>
              <div>
                <p
                  onClick={() => setShowForgotPassword(true)}
                  className="text-[12px] underline mb-[20px] cursor-pointer hover:text-[#2096D8] transition"
                >
                  {translate("forgotPassword")}
                </p>
                <div className="flex gap-1">
                  <p className="mb-[20px] text-[12px] text-[#828282]">
                    {translate("weCareAndProcess")}{" "}
                    <a
                      onClick={handlePrivacyPolicyNavigation}
                      className="text-[12px] underline cursor-pointer"
                    >
                      {translate("privacyPolicy")}
                    </a>
                  </p>
                </div>
              </div>
            </form>

            {/* Right Side - Register Prompt */}
            <div className="w-full max-w-[343px] flex flex-col justify-center">
              <p className="text-[20px] mb-[20px] font-bold">
                {translate("dontHaveAnAccountYet")}
              </p>
              <p className="text-[16px] mb-[23px]">
                {translate("proteiniSiAllows")}
              </p>
              <div className="mb-[33px]">
                <div className="flex gap-2 mb-[17px]">
                  <IoCheckmarkSharp size={24} color="#0000008A" />
                  <p className="text-[16px] text-[#0B0B0B] font-bold">
                    {translate("exclusiveBenefits1")}
                  </p>
                </div>
                <div className="flex gap-2 mb-[17px]">
                  <IoCheckmarkSharp size={24} color="#0000008A" />
                  <p className="text-[16px] text-[#0B0B0B] font-bold">
                    {translate("fasterPurchase")}
                  </p>
                </div>
                <div className="flex gap-2 mb-[17px]">
                  <IoCheckmarkSharp size={24} color="#0000008A" />
                  <p className="text-[16px] text-[#0B0B0B] font-bold">
                    {translate("trackOrderStatus")}
                  </p>
                </div>
                <div className="flex gap-2 mb-[17px]">
                  <IoCheckmarkSharp size={24} color="#0000008A" />
                  <p className="text-[16px] text-[#0B0B0B] font-bold">
                    {translate("favoriteProductList")}
                  </p>
                </div>
                <div className="flex gap-2 mb-[17px]">
                  <IoCheckmarkSharp size={24} color="#0000008A" />
                  <p className="text-[16px] text-[#0B0B0B] font-bold">
                    {translate("collectAndUseLoyalty")}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleView}
                className="bg-[#2096D8] p-[14px] text-[16px] text-white w-full font-bold"
              >
                {translate("createAnAcc")}
              </button>
            </div>
          </>
        ) : (
          // REGISTER VIEW
          <>
            {/* Left Side - Login Prompt */}
            <div className="ml-[50px] px-8 pt-[50px] pb-[30px] max-w-[413px] w-full flex flex-col justify-center max-sm:m-0">
              <p className="text-[20px] mb-[20px] font-bold leading-[26px]">
                {translate("advatagesOfCreating")}
              </p>
              <p className="text-[16px] mb-[23px]">
                {translate("proteiniSiAllows")}
              </p>
              <div className="mb-[33px]">
                <div className="flex gap-2 mb-[17px]">
                  <IoCheckmarkSharp size={24} color="#2096D8" />
                  <p className="text-[16px] text-[#0B0B0B] font-bold">
                    {translate("exclusiveBenefits1")}
                  </p>
                </div>
                <div className="flex gap-2 mb-[17px]">
                  <IoCheckmarkSharp size={24} color="#2096D8" />
                  <p className="text-[16px] text-[#0B0B0B] font-bold">
                    {translate("fasterPurchase")}
                  </p>
                </div>
                <div className="flex gap-2 mb-[17px]">
                  <IoCheckmarkSharp size={24} color="#2096D8" />
                  <p className="text-[16px] text-[#0B0B0B] font-bold">
                    {translate("trackOrderStatus")}
                  </p>
                </div>
                <div className="flex gap-2 mb-[17px]">
                  <IoCheckmarkSharp size={24} color="#2096D8" />
                  <p className="text-[16px] text-[#0B0B0B] font-bold">
                    {translate("collectAndUseLoyalty")}
                  </p>
                </div>
                <div className="flex gap-2 mb-[17px]">
                  <IoCheckmarkSharp size={24} color="#2096D8" />
                  <p className="text-[16px] text-[#0B0B0B] font-bold">
                    {translate("favoriteProductList")}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleView}
                className="bg-[#FDC700] p-[14px] text-[16px] w-full font-bold"
              >
                {translate("alreadyHaveAnAccount")}
              </button>
            </div>

            {/* Right Side - Register Form */}
            <form
              onSubmit={handleRegister}
              className="ml-[50px] pt-[20px] pb-[65px] px-[28px] max-sm:p-4 border border-[#2096D8] max-w-[643px] w-full max-sm:m-0 max-sm:border-none"
            >
              <p className="mb-[29px] text-[21px] font-bold leading-[26px]">
                {translate("createYourAccount")}
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="flex flex-col mb-[23px]">
                <div className="flex items-center mb-[11px] max-sm:mb-[20px] max-sm:flex-col max-sm:items-start max-sm:gap-2">
                  <span className="text-[13px] w-full max-w-[124px]">
                    {translate("status")}
                  </span>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-1 text-[13px]">
                      {translate("neutralPerson")}
                      <input
                        type="radio"
                        name="accountType"
                        className="ml-2"
                        checked={accountType === "natural"}
                        onChange={() => setAccountType("natural")}
                      />
                    </label>
                    <label className="flex items-center gap-1 text-[13px]">
                      {translate("company")}
                      <input
                        type="radio"
                        name="accountType"
                        className="ml-2"
                        checked={accountType === "company"}
                        onChange={() => setAccountType("company")}
                      />
                    </label>
                  </div>
                </div>

                {/* Natural Person Fields */}
                {accountType === "natural" && (
                  <>
                    <div className="flex items-center mb-[11px] max-sm:mb-[20px] max-sm:flex-col max-sm:items-start max-sm:gap-2">
                      <span className="text-[13px] w-full max-w-[124px] max-sm:text-nowrap">
                        {translate("nameAndSurname")}
                      </span>
                      <input
                        type="text"
                        name="User_FullName"
                        value={registerForm.User_FullName}
                        onChange={handleRegisterChange}
                        required
                        className="p-[13px] border border-[#c4c4c4] outline-none w-full"
                      />
                    </div>
                    <div className="flex items-center mb-[11px] max-sm:mb-[20px] max-sm:flex-col max-sm:items-start max-sm:gap-2">
                      <span className="text-[13px] w-full max-w-[124px]">
                        {translate("email1")}
                      </span>
                      <input
                        type="email"
                        name="User_Email"
                        value={registerForm.User_Email}
                        onChange={handleRegisterChange}
                        required
                        className="p-[13px] border border-[#c4c4c4] outline-none w-full"
                      />
                    </div>

                    {/* Password Field with Strength Meter */}
                    <div className="flex flex-col mb-[11px]">
                      <div className="flex items-center max-sm:mb-[20px] max-sm:flex-col max-sm:items-start max-sm:gap-2">
                        <span className="text-[13px] w-full max-w-[124px]">
                          {translate("password")}
                        </span>
                        <input
                          type="password"
                          name="Password"
                          value={registerForm.Password}
                          onChange={handlePasswordChange}
                          required
                          className="p-[13px] border border-[#c4c4c4] outline-none w-full"
                          placeholder={translate("passwordShouldBeAtLeast")}
                        />
                      </div>

                      {/* Password Strength Meter */}
                      {registerForm.Password && (
                        <div className="mt-3 ml-[124px]">
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getStrengthInfo(passwordStrength.strengthPercent).color} transition-all duration-300`}
                              style={{
                                width: `${passwordStrength.strengthPercent}%`,
                              }}
                            />
                          </div>
                          <p
                            className={`text-[11px] mt-1 ${getStrengthInfo(passwordStrength.strengthPercent).textColor} font-medium`}
                          >
                            Password strength:{" "}
                            {
                              getStrengthInfo(passwordStrength.strengthPercent)
                                .text
                            }
                          </p>

                          {/* Requirements list */}
                          <div className="mt-2 space-y-1">
                            <p className="text-[11px] font-medium text-gray-600 mb-1">
                              Password must contain:
                            </p>
                            <ul className="text-[11px] space-y-1">
                              <li
                                className={
                                  !passwordStrength.missingRequirements.includes(
                                    "At least 8 characters",
                                  )
                                    ? "text-green-500"
                                    : "text-red-500"
                                }
                              >
                                {!passwordStrength.missingRequirements.includes(
                                  "At least 8 characters",
                                )
                                  ? "✅"
                                  : "❌"}{" "}
                                At least 8 characters
                              </li>
                              <li
                                className={
                                  !passwordStrength.missingRequirements.includes(
                                    "One uppercase letter (A-Z)",
                                  )
                                    ? "text-green-500"
                                    : "text-red-500"
                                }
                              >
                                {!passwordStrength.missingRequirements.includes(
                                  "One uppercase letter (A-Z)",
                                )
                                  ? "✅"
                                  : "❌"}{" "}
                                One uppercase letter (A-Z)
                              </li>
                              <li
                                className={
                                  !passwordStrength.missingRequirements.includes(
                                    "One lowercase letter (a-z)",
                                  )
                                    ? "text-green-500"
                                    : "text-red-500"
                                }
                              >
                                {!passwordStrength.missingRequirements.includes(
                                  "One lowercase letter (a-z)",
                                )
                                  ? "✅"
                                  : "❌"}{" "}
                                One lowercase letter (a-z)
                              </li>
                              <li
                                className={
                                  !passwordStrength.missingRequirements.includes(
                                    "One number (0-9)",
                                  )
                                    ? "text-green-500"
                                    : "text-red-500"
                                }
                              >
                                {!passwordStrength.missingRequirements.includes(
                                  "One number (0-9)",
                                )
                                  ? "✅"
                                  : "❌"}{" "}
                                One number (0-9)
                              </li>
                              <li
                                className={
                                  !passwordStrength.missingRequirements.includes(
                                    "One special character (!@#$%^&* etc.)",
                                  )
                                    ? "text-green-500"
                                    : "text-red-500"
                                }
                              >
                                {!passwordStrength.missingRequirements.includes(
                                  "One special character (!@#$%^&* etc.)",
                                )
                                  ? "✅"
                                  : "❌"}{" "}
                                One special character (!@#$%^&* etc.)
                              </li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="flex items-center mb-[11px] max-sm:mb-[20px] max-sm:flex-col max-sm:items-start max-sm:gap-2">
                      <span className="text-[13px] w-full max-w-[124px] max-sm:text-nowrap">
                        {translate("confirmYour")}
                      </span>
                      <div className="w-full">
                        <input
                          type="password"
                          name="PasswordConfirm"
                          value={registerForm.PasswordConfirm}
                          onChange={handleRegisterChange}
                          required
                          className="p-[13px] border border-[#c4c4c4] outline-none w-full"
                          placeholder={translate("confirmYour")}
                        />
                        {registerForm.PasswordConfirm &&
                          registerForm.Password !==
                            registerForm.PasswordConfirm && (
                            <p className="text-red-500 text-[11px] mt-1">
                              Passwords do not match
                            </p>
                          )}
                        {registerForm.PasswordConfirm &&
                          registerForm.Password ===
                            registerForm.PasswordConfirm &&
                          registerForm.Password.length > 0 && (
                            <p className="text-green-500 text-[11px] mt-1">
                              ✓ Passwords match
                            </p>
                          )}
                      </div>
                    </div>
                  </>
                )}

                {/* Company Fields */}
                {accountType === "company" && (
                  <>
                    <div className="flex items-center mb-[11px]">
                      <span className="text-[13px] w-full max-w-[124px]">
                        {translate("companyName")}
                      </span>
                      <input
                        type="text"
                        name="Company_Name"
                        value={registerForm.Company_Name}
                        onChange={handleRegisterChange}
                        required
                        className="p-[13px] border border-[#c4c4c4] outline-none w-full"
                      />
                    </div>
                    <div className="flex items-center mb-[11px]">
                      <span className="text-[13px] w-full max-w-[124px]">
                        {translate("companyAddress")}
                      </span>
                      <input
                        type="text"
                        name="Company_Address"
                        value={registerForm.Company_Address}
                        onChange={handleRegisterChange}
                        required
                        className="p-[13px] border border-[#c4c4c4] outline-none w-full"
                        placeholder={translate("streetName")}
                      />
                    </div>
                    <div className="flex items-center mb-[11px]">
                      <span className="text-[13px] w-full max-w-[124px]">
                        {translate("taxNumber")}
                      </span>
                      <input
                        type="text"
                        name="Company_TaxNumber"
                        value={registerForm.Company_TaxNumber}
                        onChange={handleRegisterChange}
                        required
                        className="p-[13px] border border-[#c4c4c4] outline-none w-full"
                        placeholder="123456789"
                      />
                    </div>
                    <div className="flex items-center mb-[11px]">
                      <span className="text-[13px] w-full max-w-[124px]">
                        {translate("postCode")}
                      </span>
                      <input
                        type="text"
                        name="Company_PostCode"
                        value={registerForm.Company_PostCode}
                        onChange={handleRegisterChange}
                        required
                        className="p-[13px] border border-[#c4c4c4] outline-none w-full"
                        placeholder="1000"
                      />
                    </div>
                    <div className="flex items-center mb-[11px]">
                      <span className="text-[13px] w-full max-w-[124px]">
                        {translate("city")}
                      </span>
                      <input
                        type="text"
                        name="Company_City"
                        value={registerForm.Company_City}
                        onChange={handleRegisterChange}
                        required
                        className="p-[13px] border border-[#c4c4c4] outline-none w-full"
                        placeholder="Skopje"
                      />
                    </div>
                    <div className="flex items-center mb-[11px]">
                      <span className="text-[13px] w-full max-w-[124px]">
                        {translate("country")}
                      </span>
                      <select
                        name="Company_Country"
                        value={registerForm.Company_Country}
                        onChange={handleRegisterChange}
                        required
                        className="p-[13px] border border-[#c4c4c4] outline-none w-full bg-white"
                      >
                        <option value="">{translate("selectACountry")}</option>
                        {countries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center mb-[11px]">
                      <span className="text-[13px] w-full max-w-[124px]">
                        {translate("phone")}
                      </span>
                      <input
                        type="tel"
                        name="Company_Phone"
                        value={registerForm.Company_Phone}
                        onChange={handleRegisterChange}
                        required
                        className="p-[13px] border border-[#c4c4c4] outline-none w-full"
                        placeholder="+1234567890"
                      />
                    </div>
                    <div className="flex items-center mb-[11px]">
                      <span className="text-[13px] w-full max-w-[124px]">
                        {translate("email1")}
                      </span>
                      <input
                        type="email"
                        name="User_Email"
                        value={registerForm.User_Email}
                        onChange={handleRegisterChange}
                        required
                        placeholder="johndoe@gmail.com"
                        className="p-[13px] border border-[#c4c4c4] outline-none w-full"
                      />
                    </div>

                    {/* Password Field with Strength Meter for Company */}
                    <div className="flex flex-col mb-[11px]">
                      <div className="flex items-center">
                        <span className="text-[13px] w-full max-w-[124px]">
                          {translate("password")}
                        </span>
                        <input
                          type="password"
                          name="Password"
                          value={registerForm.Password}
                          onChange={handlePasswordChange}
                          required
                          className="p-[13px] border border-[#c4c4c4] outline-none w-full"
                          placeholder={translate("passwordShouldBeAtLeast")}
                        />
                      </div>

                      {/* Password Strength Meter */}
                      {registerForm.Password && (
                        <div className="mt-3 ml-[124px]">
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getStrengthInfo(passwordStrength.strengthPercent).color} transition-all duration-300`}
                              style={{
                                width: `${passwordStrength.strengthPercent}%`,
                              }}
                            />
                          </div>
                          <p
                            className={`text-[11px] mt-1 ${getStrengthInfo(passwordStrength.strengthPercent).textColor} font-medium`}
                          >
                            Password strength:{" "}
                            {
                              getStrengthInfo(passwordStrength.strengthPercent)
                                .text
                            }
                          </p>

                          {/* Requirements list */}
                          <div className="mt-2 space-y-1">
                            <p className="text-[11px] font-medium text-gray-600 mb-1">
                              Password must contain:
                            </p>
                            <ul className="text-[11px] space-y-1">
                              <li
                                className={
                                  !passwordStrength.missingRequirements.includes(
                                    "At least 8 characters",
                                  )
                                    ? "text-green-500"
                                    : "text-red-500"
                                }
                              >
                                {!passwordStrength.missingRequirements.includes(
                                  "At least 8 characters",
                                )
                                  ? "✅"
                                  : "❌"}{" "}
                                At least 8 characters
                              </li>
                              <li
                                className={
                                  !passwordStrength.missingRequirements.includes(
                                    "One uppercase letter (A-Z)",
                                  )
                                    ? "text-green-500"
                                    : "text-red-500"
                                }
                              >
                                {!passwordStrength.missingRequirements.includes(
                                  "One uppercase letter (A-Z)",
                                )
                                  ? "✅"
                                  : "❌"}{" "}
                                One uppercase letter (A-Z)
                              </li>
                              <li
                                className={
                                  !passwordStrength.missingRequirements.includes(
                                    "One lowercase letter (a-z)",
                                  )
                                    ? "text-green-500"
                                    : "text-red-500"
                                }
                              >
                                {!passwordStrength.missingRequirements.includes(
                                  "One lowercase letter (a-z)",
                                )
                                  ? "✅"
                                  : "❌"}{" "}
                                One lowercase letter (a-z)
                              </li>
                              <li
                                className={
                                  !passwordStrength.missingRequirements.includes(
                                    "One number (0-9)",
                                  )
                                    ? "text-green-500"
                                    : "text-red-500"
                                }
                              >
                                {!passwordStrength.missingRequirements.includes(
                                  "One number (0-9)",
                                )
                                  ? "✅"
                                  : "❌"}{" "}
                                One number (0-9)
                              </li>
                              <li
                                className={
                                  !passwordStrength.missingRequirements.includes(
                                    "One special character (!@#$%^&* etc.)",
                                  )
                                    ? "text-green-500"
                                    : "text-red-500"
                                }
                              >
                                {!passwordStrength.missingRequirements.includes(
                                  "One special character (!@#$%^&* etc.)",
                                )
                                  ? "✅"
                                  : "❌"}{" "}
                                One special character (!@#$%^&* etc.)
                              </li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password Field for Company */}
                    <div className="flex items-center mb-[11px]">
                      <span className="text-[13px] w-full max-w-[124px]">
                        {translate("confirmYour")}
                      </span>
                      <div className="w-full">
                        <input
                          type="password"
                          name="PasswordConfirm"
                          value={registerForm.PasswordConfirm}
                          onChange={handleRegisterChange}
                          required
                          className="p-[13px] border border-[#c4c4c4] outline-none w-full"
                          placeholder={translate("confirmYour")}
                        />
                        {registerForm.PasswordConfirm &&
                          registerForm.Password !==
                            registerForm.PasswordConfirm && (
                            <p className="text-red-500 text-[11px] mt-1">
                              Passwords do not match
                            </p>
                          )}
                        {registerForm.PasswordConfirm &&
                          registerForm.Password ===
                            registerForm.PasswordConfirm &&
                          registerForm.Password.length > 0 && (
                            <p className="text-green-500 text-[11px] mt-1">
                              ✓ Passwords match
                            </p>
                          )}
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    (registerForm.Password && !passwordStrength.isValid)
                  }
                  className="bg-[#2096D8] text-white text-[16px] mb-[5px] p-[14px] font-bold disabled:opacity-50"
                >
                  {loading ? translate("creating") : translate("createAnAcc")}
                </button>
              </div>
              <div className="flex max-sm:flex-col max-sm:gap-6 mb-[30px] justify-between">
                <p className="text-[11px] pt-[5px]">
                  {translate("quickRegistration")}
                </p>
                <div className="flex items-end gap-2 max-sm:items-center max-sm:pb-3 max-sm:border-b max-sm:border-[#c4c4c4]">
                  <FcGoogle size={28} />
                  <p className="text-[11px] text-[#828282]">Google</p>
                </div>
                <div className="flex items-end gap-2 max-sm:items-center max-sm:pb-3 max-sm:border-b max-sm:border-[#c4c4c4]">
                  <FaFacebook size={28} color="#4267B2" />
                  <p className="text-[11px] text-[#828282]">FaceBook</p>
                </div>
                <div className="flex items-end gap-2 max-sm:items-center max-sm:pb-3 max-sm:border-b max-sm:border-[#c4c4c4]">
                  <FaApple size={28} />
                  <p className="text-[11px] text-[#828282]">Apple</p>
                </div>
              </div>
              <div className="flex gap-1">
                <p className="mb-[20px] text-[12px] text-[#828282]">
                  {translate("weCareAndProcess")}
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[12px] text-[#828282]"
                  >
                    {translate("privacyPolicy")}
                  </a>
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
