import { createElement, useEffect, useState } from "react";
import {
  FiBriefcase,
  FiCheck,
  FiMail,
  FiShield,
  FiUser,
  FiUserX,
} from "react-icons/fi";
import { useLanguage } from "../translation/LanguageContext";
import { api } from "../../services/api";
import { COUNTRIES } from "../Components/countries";
import {
  Notice,
  ProfileHeader,
  ProfileLoading,
  cardClass,
  eyebrowClass,
  ghostButtonClass,
  headingClass,
  pillButtonClass,
} from "./ProfileKit";

const inputClass =
  "block w-full min-h-[48px] rounded-xl bg-[#f6f5f1] px-4 text-[15px] text-gray-900 ring-1 ring-black/[0.08] placeholder:text-gray-400 transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#141409]";

const EMPTY_NATURAL = {
  User_Address: "",
  User_PostCode: "",
  User_City: "",
  User_Country: "",
  User_Phone: "",
};

const EMPTY_COMPANY = {
  Company_Name: "",
  Company_Address: "",
  Company_TaxNumber: "",
  Company_PostCode: "",
  Company_City: "",
  Company_Country: "",
  Company_Phone: "",
};

function Input({ label, id, className = "", ...props }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-gray-800">
        {label}
      </label>
      <input id={id} className={inputClass} {...props} />
    </div>
  );
}

function CountrySelect({ label, id, translate, className = "", ...props }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-gray-800">
        {label}
      </label>
      <select id={id} className={`${inputClass} appearance-none`} {...props}>
        <option value="">{translate("selectACountry")}</option>
        {COUNTRIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}

function SectionCard({ icon, title, children, className = "" }) {
  const Icon = icon;
  return (
    <section className={`${cardClass} p-5 sm:p-7 ${className}`}>
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FDC700]/25 text-[#141409]">
          <Icon size={18} />
        </span>
        <h2 className={`${headingClass} text-2xl`}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function ProfileDefault() {
  const { translate } = useLanguage();
  const [user, setUser] = useState(null);
  const [accountType, setAccountType] = useState("natural");
  const [naturalForm, setNaturalForm] = useState(EMPTY_NATURAL);
  const [companyForm, setCompanyForm] = useState(EMPTY_COMPANY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ tone: "success", text: "" });
  const [newsState, setNewsState] = useState("idle");

  const applyUser = (data) => {
    setUser(data);
    if (data.user_IsCompany === true) {
      const c = data.company || {};
      setAccountType("company");
      setCompanyForm({
        Company_Name: c.company_Name || "",
        Company_Address: c.company_Address || "",
        Company_TaxNumber: c.company_TaxNumber || "",
        Company_PostCode: c.company_PostCode || "",
        Company_City: c.company_City || "",
        Company_Country: c.company_Country || "",
        Company_Phone: c.company_Phone || "",
      });
    } else {
      setAccountType("natural");
      setNaturalForm({
        User_Address: data.user_Address || "",
        User_PostCode: data.user_PostCode || "",
        User_City: data.user_City || "",
        User_Country: data.user_Country || "",
        User_Phone: data.user_Phone || "",
      });
    }
  };

  const fetchUserData = async () => {
    try {
      const data = await api.fetchCurrentUser();
      if (data) applyUser(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setNotice({ tone: "error", text: translate("profileLoadError") });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flash = (tone, text) => {
    setNotice({ tone, text });
    setTimeout(() => setNotice((n) => (n.text === text ? { ...n, text: "" } : n)), 4000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const billingData =
        accountType === "company"
          ? {
              company_Name: companyForm.Company_Name,
              company_Address: companyForm.Company_Address,
              company_TaxNumber: companyForm.Company_TaxNumber,
              company_PostCode: companyForm.Company_PostCode,
              company_City: companyForm.Company_City,
              company_Country: companyForm.Company_Country,
              company_Phone: companyForm.Company_Phone,
            }
          : {
              user_Address: naturalForm.User_Address,
              user_PostCode: naturalForm.User_PostCode,
              user_City: naturalForm.User_City,
              user_Country: naturalForm.User_Country,
              user_Phone: naturalForm.User_Phone,
            };

      const response = await api.updateBillingInfo(billingData);
      if (response.status) {
        flash("success", translate("profileSaved"));
        await fetchUserData();
      }
    } catch (error) {
      flash("error", error.message || translate("profileSaveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleNewsletter = async () => {
    if (!user?.user_Email || newsState === "sending") return;
    setNewsState("sending");
    try {
      await api.subscribeNewsletter(user.user_Email, "profile");
      setNewsState("done");
    } catch {
      setNewsState("error");
    }
  };

  if (loading) {
    return (
      <div>
        <ProfileHeader eyebrow={translate("profileMemberArea")} title={translate("myProfile")} />
        <ProfileLoading />
      </div>
    );
  }

  const setNatural = (name) => (e) => setNaturalForm((f) => ({ ...f, [name]: e.target.value }));
  const setCompany = (name) => (e) => setCompanyForm((f) => ({ ...f, [name]: e.target.value }));
  const cancelHref = `mailto:info@proteini.mk?subject=${encodeURIComponent(
    translate("userAccountCancellation"),
  )}&body=${encodeURIComponent(`${translate("iWouldLikeToCancelMyAccount")}\n\n${user?.user_Email || ""}`)}`;

  return (
    <div>
      <ProfileHeader eyebrow={translate("profileMemberArea")} title={translate("myProfile")} />

      <div className="space-y-5">
        <SectionCard icon={FiShield} title={translate("accessDetails")}>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[#f6f5f1] px-4 py-3">
              <dt className={eyebrowClass}>{translate("username")}</dt>
              <dd className="mt-1 break-all text-[15px] font-bold text-gray-900">{user?.user_Email}</dd>
            </div>
            <div className="rounded-xl bg-[#f6f5f1] px-4 py-3">
              <dt className={eyebrowClass}>{translate("status")}</dt>
              <dd className="mt-1 flex items-center gap-2 text-[15px] font-bold text-gray-900">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8DC658] text-white">
                  <FiCheck size={12} strokeWidth={3} />
                </span>
                {translate("profileEmailVerified")}
              </dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard icon={FiUser} title={translate("billingInformation")}>
          <form onSubmit={handleSave}>
            <div role="radiogroup" aria-label={translate("accountType")} className="mb-6 inline-grid grid-cols-2 rounded-full bg-[#f6f5f1] p-1 ring-1 ring-black/[0.05]">
              {[
                ["natural", FiUser, "naturalPerson"],
                ["company", FiBriefcase, "company"],
              ].map(([key, icon, label]) => (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={accountType === key}
                  onClick={() => setAccountType(key)}
                  className={`inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full px-4 text-sm font-bold transition sm:px-5 ${
                    accountType === key ? "bg-[#141409] text-white" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {createElement(icon, { size: 15, className: accountType === key ? "text-[#FDC700]" : "" })}
                  {translate(label)}
                </button>
              ))}
            </div>

            {accountType === "natural" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input id="bill-address" label={translate("address")} className="sm:col-span-2" autoComplete="street-address" value={naturalForm.User_Address} onChange={setNatural("User_Address")} placeholder={translate("enterAddress")} />
                <Input id="bill-city" label={translate("city")} autoComplete="address-level2" value={naturalForm.User_City} onChange={setNatural("User_City")} placeholder={translate("enterCity")} />
                <Input id="bill-post" label={translate("postCode")} autoComplete="postal-code" value={naturalForm.User_PostCode} onChange={setNatural("User_PostCode")} placeholder={translate("enterPostCode")} />
                <CountrySelect id="bill-country" label={translate("country")} translate={translate} value={naturalForm.User_Country} onChange={setNatural("User_Country")} />
                <Input id="bill-phone" type="tel" label={translate("phone")} autoComplete="tel" value={naturalForm.User_Phone} onChange={setNatural("User_Phone")} placeholder={translate("enterPhoneNumber")} />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input id="co-name" label={translate("companyName")} className="sm:col-span-2" autoComplete="organization" value={companyForm.Company_Name} onChange={setCompany("Company_Name")} />
                <Input id="co-tax" label={translate("taxNumber")} value={companyForm.Company_TaxNumber} onChange={setCompany("Company_TaxNumber")} placeholder="123456789" />
                <Input id="co-phone" type="tel" label={translate("phone")} autoComplete="tel" value={companyForm.Company_Phone} onChange={setCompany("Company_Phone")} />
                <Input id="co-address" label={translate("companyAddress")} className="sm:col-span-2" autoComplete="street-address" value={companyForm.Company_Address} onChange={setCompany("Company_Address")} placeholder={translate("enterAddress")} />
                <Input id="co-city" label={translate("city")} autoComplete="address-level2" value={companyForm.Company_City} onChange={setCompany("Company_City")} placeholder="Skopje" />
                <Input id="co-post" label={translate("postCode")} autoComplete="postal-code" value={companyForm.Company_PostCode} onChange={setCompany("Company_PostCode")} placeholder="1000" />
                <CountrySelect id="co-country" label={translate("country")} translate={translate} className="sm:col-span-2" value={companyForm.Company_Country} onChange={setCompany("Company_Country")} />
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-4 sm:flex-row sm:items-center">
              <button type="submit" disabled={saving} className={pillButtonClass}>
                {saving ? translate("saving") : translate("save")}
              </button>
              <div className="flex-1">
                <Notice tone={notice.tone}>{notice.text}</Notice>
              </div>
            </div>
          </form>
        </SectionCard>

        <div className="grid gap-5 md:grid-cols-2">
          <SectionCard icon={FiMail} title={translate("enotifications")}>
            <p className="text-sm leading-relaxed text-gray-600">{translate("signUpForENews")}</p>
            <p className="mt-3 truncate rounded-xl bg-[#f6f5f1] px-4 py-3 text-sm font-semibold text-gray-900">
              {user?.user_Email}
            </p>
            {newsState === "done" ? (
              <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#2f5e14]">
                <FiCheck /> {translate("profileNewsDone")}
              </p>
            ) : (
              <button type="button" onClick={handleNewsletter} disabled={newsState === "sending"} className={`${ghostButtonClass} mt-4`}>
                {translate("signUpToRecieve")}
              </button>
            )}
            {newsState === "error" && (
              <p className="mt-2 text-xs font-medium text-[#a3161d]">{translate("authGenericError")}</p>
            )}
          </SectionCard>

          <SectionCard icon={FiUserX} title={translate("userAccountCancellation")}>
            <p className="text-sm leading-relaxed text-gray-600">{translate("userAccountCancDesc")}</p>
            <a href={cancelHref} className={`${ghostButtonClass} mt-4 !text-[#a3161d] hover:!bg-[#E3262F]/[0.06] hover:!ring-[#E3262F]/40`}>
              {translate("iWouldLikeToCancelMyAccount")}
            </a>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
