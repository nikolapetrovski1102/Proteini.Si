import { useState, useEffect } from "react";
import { useLanguage } from "../translation/LanguageContext";
import { api } from "../../services/api";

export default function ProfileDefault() {
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userData, setUserData] = useState(null);
  const { translate } = useLanguage();
  const [accountType, setAccountType] = useState("natural");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Natural person billing form state
  const [naturalForm, setNaturalForm] = useState({
    User_Address: "",
    User_PostCode: "",
    User_City: "",
    User_Country: "",
    User_Phone: "",
  });

  // Company billing form state
  const [companyForm, setCompanyForm] = useState({
    Company_Name: "",
    Company_Address: "",
    Company_TaxNumber: "",
    Company_PostCode: "",
    Company_City: "",
    Company_Country: "",
    Company_Phone: "",
  });

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

  // Fetch current user data
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const user = await api.fetchCurrentUser();

      if (user) {
        setUserData(user);
        setUserEmail(user.user_Email || "");
        setUserName(user.user_FullName || "");

        // Check if user is company
        if (user.user_IsCompany === true) {
          setAccountType("company");
          const companyData = user.company || {};
          setCompanyForm({
            Company_Name: companyData.company_Name || "",
            Company_Address: companyData.company_Address || "",
            Company_TaxNumber: companyData.company_TaxNumber || "",
            Company_PostCode: companyData.company_PostCode || "",
            Company_City: companyData.company_City || "",
            Company_Country: companyData.company_Country || "",
            Company_Phone: companyData.company_Phone || "",
          });
        } else {
          setAccountType("natural");
          setNaturalForm({
            User_Address: user.user_Address || "",
            User_PostCode: user.user_PostCode || "",
            User_City: user.user_City || "",
            User_Country: user.user_Country || "",
            User_Phone: user.user_Phone || "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleNaturalFormChange = (e) => {
    setNaturalForm({
      ...naturalForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCompanyFormChange = (e) => {
    setCompanyForm({
      ...companyForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveBillingInfo = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let billingData;

      if (accountType === "company") {
        billingData = {
          company_Name: companyForm.Company_Name,
          company_Address: companyForm.Company_Address,
          company_TaxNumber: companyForm.Company_TaxNumber,
          company_PostCode: companyForm.Company_PostCode,
          company_City: companyForm.Company_City,
          company_Country: companyForm.Company_Country,
          company_Phone: companyForm.Company_Phone,
        };
      } else {
        billingData = {
          user_Address: naturalForm.User_Address,
          user_PostCode: naturalForm.User_PostCode,
          user_City: naturalForm.User_City,
          user_Country: naturalForm.User_Country,
          user_Phone: naturalForm.User_Phone,
        };
      }

      const response = await api.updateBillingInfo(billingData);
      if (response.status) {
        setSuccess("Billing information saved successfully!");
        await fetchUserData();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      setError(error.message || "Failed to save billing information");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full max-w-[740px] pr-[50px] max-lg:pr-0 pb-[70px]">
        <p className="text-[24px] font-bold mb-[20px] pt-[70px] pr-[50px] max-sm:pt-0">
          {translate("myProfile")}
        </p>
        <div>
          <p className="text-[18px] mb-[20px] font-bold">
            {translate("accessDetails")}
          </p>
          <div className="mt-[30px] mb-[35px]">
            <p className="mb-[13px] text-[13px]">{translate("username")}</p>
            <p className="text-[16px] text-[#828282] font-bold">{userEmail}</p>
          </div>
          <div className="mt-[30px] mb-[35px]">
            <p className="mb-[13px] text-[13px]">{translate("status")}</p>
            <p className="text-[16px] text-[#828282] font-bold">
              {translate("noStatus")}
            </p>
          </div>

          {/* Billing Information Section */}
          <p className="text-[18px] mb-[20px] font-bold leading-[22px]">
            {translate("billingInformation")}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              {success}
            </div>
          )}

          <div className="py-[35px] px-[25px] border border-[#2096D8] max-w-[643px] w-full">
            <div className="flex flex-col mb-[23px]">
              <div className="flex gap-6 mb-[30px]">
                <div
                  onClick={() => setAccountType("natural")}
                  className={`flex items-center justify-center px-8 max-sm:px-2 py-1 gap-2 border cursor-pointer transition-all duration-200 ${
                    accountType === "natural"
                      ? "border-[#2096D8] bg-[#2096D8]/5"
                      : "border-gray-300 hover:border-[#2096D8]"
                  }`}
                >
                  <span
                    className={`text-[14px]  ${accountType === "natural" ? "" : "text-gray-600"}`}
                  >
                    {translate("naturalPerson")}
                  </span>
                </div>

                <div
                  onClick={() => setAccountType("company")}
                  className={`flex items-center justify-center gap-2 px-8 py-1 border cursor-pointer transition-all duration-200 ${
                    accountType === "company"
                      ? "border-[#2096D8] bg-[#2096D8]/5"
                      : "border-gray-300 hover:border-[#2096D8]"
                  }`}
                >
                  <span
                    className={`text-[14px] ${accountType === "company" ? "" : "text-gray-600"}`}
                  >
                    {translate("company")}
                  </span>
                </div>
              </div>

              {accountType === "natural" && (
                <>
                  <div className="flex flex-col items-start gap-1 mb-[11px]">
                    <span className="text-[13px] w-full">
                      {translate("address")}
                    </span>
                    <input
                      type="text"
                      name="User_Address"
                      value={naturalForm.User_Address}
                      onChange={handleNaturalFormChange}
                      placeholder={translate("enterYourEmailAddress")}
                      className="p-[11px] border border-[#c4c4c4] outline-none w-full"
                    />
                  </div>
                  <div className="flex flex-col items-start gap-1 mb-[11px]">
                    <span className="text-[13px] w-full">
                      {translate("postCode")}
                    </span>
                    <input
                      type="text"
                      name="User_PostCode"
                      value={naturalForm.User_PostCode}
                      onChange={handleNaturalFormChange}
                      placeholder={translate("enterPostCode")}
                      className="p-[11px] border border-[#c4c4c4] outline-none w-full"
                    />
                  </div>
                  <div className="flex flex-col items-start gap-1 mb-[11px]">
                    <span className="text-[13px] w-full">
                      {translate("city")}
                    </span>
                    <input
                      type="text"
                      name="User_City"
                      value={naturalForm.User_City}
                      onChange={handleNaturalFormChange}
                      placeholder={translate("enterCity")}
                      className="p-[11px] border border-[#c4c4c4] outline-none w-full"
                    />
                  </div>
                  <div className="flex flex-col items-start gap-1 mb-[11px]">
                    <span className="text-[13px] w-full">
                      {translate("country")}
                    </span>
                    <select
                      name="User_Country"
                      value={naturalForm.User_Country}
                      onChange={handleNaturalFormChange}
                      className="p-[11px] border border-[#c4c4c4] outline-none w-full bg-white"
                    >
                      <option value="">{translate("selectACountry")}</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col items-start gap-1 mb-[11px]">
                    <span className="text-[13px] w-full">
                      {translate("phone")}
                    </span>
                    <input
                      type="text"
                      name="User_Phone"
                      value={naturalForm.User_Phone}
                      onChange={handleNaturalFormChange}
                      placeholder={translate("enterPhoneNumber")}
                      className="p-[11px] border border-[#c4c4c4] outline-none w-full"
                    />
                  </div>
                </>
              )}

              {accountType === "company" && (
                <>
                  <div className="flex flex-col items-start gap-1 mb-[11px]">
                    <span className="text-[13px] w-full">
                      {translate("companyName")}
                    </span>
                    <input
                      type="text"
                      name="Company_Name"
                      value={companyForm.Company_Name}
                      onChange={handleCompanyFormChange}
                      className="p-[11px] border border-[#c4c4c4] outline-none w-full"
                    />
                  </div>
                  <div className="flex flex-col items-start gap-1 mb-[11px]">
                    <span className="text-[13px] w-full">
                      {translate("companyAddress")}
                    </span>
                    <input
                      type="text"
                      name="Company_Address"
                      value={companyForm.Company_Address}
                      onChange={handleCompanyFormChange}
                      placeholder={translate("enterAddress")}
                      className="p-[11px] border border-[#c4c4c4] outline-none w-full"
                    />
                  </div>
                  <div className="flex flex-col items-start gap-1 mb-[11px]">
                    <span className="text-[13px] w-full">
                      {translate("taxNumber")}
                    </span>
                    <input
                      type="text"
                      name="Company_TaxNumber"
                      value={companyForm.Company_TaxNumber}
                      onChange={handleCompanyFormChange}
                      placeholder="123456789"
                      className="p-[11px] border border-[#c4c4c4] outline-none w-full"
                    />
                  </div>
                  <div className="flex flex-col items-start gap-1 mb-[11px]">
                    <span className="text-[13px] w-full">
                      {translate("postCode")}
                    </span>
                    <input
                      type="text"
                      name="Company_PostCode"
                      value={companyForm.Company_PostCode}
                      onChange={handleCompanyFormChange}
                      placeholder="1000"
                      className="p-[11px] border border-[#c4c4c4] outline-none w-full"
                    />
                  </div>
                  <div className="flex flex-col items-start gap-1 mb-[11px]">
                    <span className="text-[13px] w-full">
                      {translate("city")}
                    </span>
                    <input
                      type="text"
                      name="Company_City"
                      value={companyForm.Company_City}
                      onChange={handleCompanyFormChange}
                      placeholder="Skopje"
                      className="p-[11px] border border-[#c4c4c4] outline-none w-full"
                    />
                  </div>
                  <div className="flex flex-col items-start gap-1 mb-[11px]">
                    <span className="text-[13px] w-full">
                      {translate("country")}
                    </span>
                    <select
                      name="Company_Country"
                      value={companyForm.Company_Country}
                      onChange={handleCompanyFormChange}
                      className="p-[11px] border border-[#c4c4c4] outline-none w-full bg-white"
                    >
                      <option value="">{translate("selectACountry")}</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col items-start gap-1 mb-[11px]">
                    <span className="text-[13px] w-full">
                      {translate("phone")}
                    </span>
                    <input
                      type="tel"
                      name="Company_Phone"
                      value={companyForm.Company_Phone}
                      onChange={handleCompanyFormChange}
                      placeholder="+1234567890"
                      className="p-[11px] border border-[#c4c4c4] outline-none w-full"
                    />
                  </div>
                </>
              )}

              <button
                onClick={handleSaveBillingInfo}
                disabled={saving}
                className="bg-[#2096D8] max-w-[80px] text-white text-[16px] mb-[5px] mt-[4px] py-2 font-bold disabled:opacity-50"
              >
                {saving ? `${translate("saving")}` : `${translate("save")}`}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-[50px]">
          <p className="text-[18px] mb-[20px] font-bold mt-[50px]">
            {translate("enotifications")}
          </p>
          <p className="text-[13px] mb-[1px]">{translate("signUpForENews")} </p>
          <div className="flex flex-col items-start gap-1 mb-[11px]">
            <input
              type="text"
              value={userEmail}
              disabled
              className="p-[11px] border border-[#c4c4c4] outline-none w-full bg-gray-50 text-black"
            />
          </div>
          <button className="bg-[#2096D8] text-white text-[16px] py-2 px-4 font-bold disabled:opacity-50">
            {translate("signUpToRecieve")}
          </button>
        </div>

        <p className="text-[18px] mb-[20px] font-bold">
          {translate("userAccountCancellation")}
        </p>
        <p className="text-[16px] mb-[16px]">
          {translate("userAccountCancDesc")}
        </p>
        <button className="bg-[#2096D8] text-white text-[16px] py-2 px-4 font-bold disabled:opacity-50">
          {translate("iWouldLikeToCancelMyAccount")}
        </button>
      </div>
    </div>
  );
}
