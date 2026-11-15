import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FiCheck,
  FiChevronDown,
  FiChevronRight,
  FiLock,
  FiMapPin,
  FiNavigation,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { api } from "../../services/api";
import { t, getCurrentLanguage } from "../translation/translation";
import Scribble from "./Scribble";

const FLAG_FILE_MAP = {
  MK: "/logos/flags/mk.svg",
  AL: "/logos/flags/al.svg",
  RS: "/logos/flags/serbia.svg",
  XK: "/logos/flags/xk.svg",
  BG: "/logos/flags/bg.svg",
  GR: "/logos/flags/gr.svg",
  ME: "/logos/flags/montenegro.svg",
  HR: "/logos/flags/hr.svg",
  SI: "/logos/flags/sl.svg",
  BA: "/logos/flags/bosnia.svg",
  TR: "/logos/flags/tr.svg",
  DE: "/logos/flags/de.svg",
  AT: "/logos/flags/at.svg",
  CH: "/logos/flags/ch.svg",
  IT: "/logos/flags/it.svg",
  SE: "/logos/flags/se.svg",
  GB: "/logos/flags/gb.svg",
  US: "/logos/flags/us.svg",
  EU: "/logos/flags/eu.svg",
};

/**
 * Polished, rounded country flag icon with subtle inner gloss and border ring.
 */
export function CountryFlag({ iso2 = "MK", alt = "", size = "md", className = "" }) {
  const code = (iso2 || "MK").toUpperCase();
  const localSrc =
    FLAG_FILE_MAP[code] ||
    `https://flagcdn.com/${code.toLowerCase()}.svg`;

  const dimensions =
    size === "sm"
      ? "h-[18px] w-[26px] rounded-[5px]"
      : size === "xl"
        ? "h-[30px] w-[42px] rounded-[8px]"
        : size === "lg"
        ? "h-[24px] w-[34px] rounded-[7px]"
        : "h-[20px] w-[28px] rounded-[6px]";

  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden bg-gray-100 shadow-[0_1px_3px_rgba(20,20,9,0.18)] ring-1 ring-black/[0.14] ${dimensions} ${className}`}
    >
      <img
        src={localSrc}
        alt={alt || `${code} flag`}
        loading="lazy"
        className="h-full w-full object-cover"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/25 via-transparent to-black/10 ring-1 ring-inset ring-white/25"
      />
    </span>
  );
}

export const DEFAULT_PHONE_COUNTRIES = [
  { countryId: 1, iso2: "MK", nameEn: "North Macedonia", nameMk: "Северна Македонија", dialCode: "389", phoneMinDigits: 8, phoneMaxDigits: 8, phonePattern: "^[2-7][0-9]{7}$", stripLeadingZero: true, allowPhone: true, allowShipping: true },
  { countryId: 2, iso2: "AL", nameEn: "Albania", nameMk: "Албанија", dialCode: "355", phoneMinDigits: 8, phoneMaxDigits: 9, phonePattern: null, stripLeadingZero: true, allowPhone: true, allowShipping: false },
  { countryId: 3, iso2: "RS", nameEn: "Serbia", nameMk: "Србија", dialCode: "381", phoneMinDigits: 8, phoneMaxDigits: 9, phonePattern: null, stripLeadingZero: true, allowPhone: true, allowShipping: false },
  { countryId: 4, iso2: "XK", nameEn: "Kosovo", nameMk: "Косово", dialCode: "383", phoneMinDigits: 8, phoneMaxDigits: 8, phonePattern: null, stripLeadingZero: true, allowPhone: true, allowShipping: false },
  { countryId: 5, iso2: "BG", nameEn: "Bulgaria", nameMk: "Бугарија", dialCode: "359", phoneMinDigits: 8, phoneMaxDigits: 9, phonePattern: null, stripLeadingZero: true, allowPhone: true, allowShipping: false },
  { countryId: 6, iso2: "GR", nameEn: "Greece", nameMk: "Грција", dialCode: "30", phoneMinDigits: 10, phoneMaxDigits: 10, phonePattern: null, stripLeadingZero: true, allowPhone: true, allowShipping: false },
  { countryId: 7, iso2: "ME", nameEn: "Montenegro", nameMk: "Црна Гора", dialCode: "382", phoneMinDigits: 8, phoneMaxDigits: 8, phonePattern: null, stripLeadingZero: true, allowPhone: true, allowShipping: false },
  { countryId: 8, iso2: "HR", nameEn: "Croatia", nameMk: "Хрватска", dialCode: "385", phoneMinDigits: 8, phoneMaxDigits: 9, phonePattern: null, stripLeadingZero: true, allowPhone: true, allowShipping: false },
  { countryId: 9, iso2: "SI", nameEn: "Slovenia", nameMk: "Словенија", dialCode: "386", phoneMinDigits: 8, phoneMaxDigits: 8, phonePattern: null, stripLeadingZero: true, allowPhone: true, allowShipping: false },
  { countryId: 10, iso2: "BA", nameEn: "Bosnia and Herzegovina", nameMk: "Босна и Херцеговина", dialCode: "387", phoneMinDigits: 8, phoneMaxDigits: 9, phonePattern: null, stripLeadingZero: true, allowPhone: true, allowShipping: false },
  { countryId: 11, iso2: "TR", nameEn: "Turkey", nameMk: "Турција", dialCode: "90", phoneMinDigits: 10, phoneMaxDigits: 10, phonePattern: null, stripLeadingZero: true, allowPhone: true, allowShipping: false },
  { countryId: 12, iso2: "DE", nameEn: "Germany", nameMk: "Германија", dialCode: "49", phoneMinDigits: 10, phoneMaxDigits: 11, phonePattern: null, stripLeadingZero: true, allowPhone: true, allowShipping: false },
  { countryId: 13, iso2: "AT", nameEn: "Austria", nameMk: "Австрија", dialCode: "43", phoneMinDigits: 10, phoneMaxDigits: 13, phonePattern: null, stripLeadingZero: true, allowPhone: true, allowShipping: false },
  { countryId: 14, iso2: "CH", nameEn: "Switzerland", nameMk: "Швајцарија", dialCode: "41", phoneMinDigits: 9, phoneMaxDigits: 9, phonePattern: null, stripLeadingZero: true, allowPhone: true, allowShipping: false },
  { countryId: 15, iso2: "IT", nameEn: "Italy", nameMk: "Италија", dialCode: "39", phoneMinDigits: 9, phoneMaxDigits: 11, phonePattern: null, stripLeadingZero: false, allowPhone: true, allowShipping: false },
  { countryId: 16, iso2: "SE", nameEn: "Sweden", nameMk: "Шведска", dialCode: "46", phoneMinDigits: 9, phoneMaxDigits: 9, phonePattern: null, stripLeadingZero: true, allowPhone: true, allowShipping: false },
  { countryId: 17, iso2: "GB", nameEn: "United Kingdom", nameMk: "Велика Британија", dialCode: "44", phoneMinDigits: 10, phoneMaxDigits: 10, phonePattern: null, stripLeadingZero: true, allowPhone: true, allowShipping: false },
  { countryId: 18, iso2: "US", nameEn: "United States", nameMk: "САД", dialCode: "1", phoneMinDigits: 10, phoneMaxDigits: 10, phonePattern: null, stripLeadingZero: false, allowPhone: true, allowShipping: false },
];

export const SKOPJE_POST_CODES = [
  { postCode: "1000", postOffice: "Скопје - Центар (Centar)" },
  { postCode: "1001", postOffice: "Скопје - Пошта 2 (Posta 2)" },
  { postCode: "1010", postOffice: "Скопје - Чаир / Бутел (Cair / Butel)" },
  { postCode: "1014", postOffice: "Скопје - Автокоманда (Avtokomanda)" },
  { postCode: "1020", postOffice: "Скопје - Карпош (Karpos)" },
  { postCode: "1030", postOffice: "Скопје - Гази Баба (Gazi Baba)" },
  { postCode: "1040", postOffice: "Скопје - Маџари / Ченто (Madzari / Cento)" },
  { postCode: "1050", postOffice: "Скопје - Драчево (Dracevo)" },
  { postCode: "1051", postOffice: "Скопје - Кисела Вода (Kisela Voda)" },
  { postCode: "1052", postOffice: "Скопје - Аеродром / Ново Лисиче (Aerodrom / Novo Lisice)" },
  { postCode: "1060", postOffice: "Скопје - Ѓорче Петров / Влае (Gjorce Petrov / Vlae)" },
  { postCode: "1061", postOffice: "Скопје - Сарај (Saraj)" },
  { postCode: "1064", postOffice: "Скопје - Кондово (Kondovo)" },
  { postCode: "1065", postOffice: "Скопје - Шуто Оризари (Suto Orizari)" },
  { postCode: "1066", postOffice: "Скопје - Радишани (Radisani)" },
  { postCode: "1067", postOffice: "Скопје - Волково (Volkovo)" },
];

export const DEFAULT_CITIES = [
  {
    cityId: 1,
    nameLatin: "Skopje",
    nameMk: "Скопје",
    isTown: true,
    deliver: true,
    postCodes: SKOPJE_POST_CODES,
  },
  { cityId: 2, nameLatin: "Bitola", nameMk: "Битола", isTown: true, deliver: true, postCodes: [{ postCode: "7000", postOffice: "Bitola" }] },
  { cityId: 3, nameLatin: "Kumanovo", nameMk: "Куманово", isTown: true, deliver: true, postCodes: [{ postCode: "1300", postOffice: "Kumanovo" }] },
  { cityId: 4, nameLatin: "Prilep", nameMk: "Прилеп", isTown: true, deliver: true, postCodes: [{ postCode: "7500", postOffice: "Prilep" }] },
  { cityId: 5, nameLatin: "Tetovo", nameMk: "Тетово", isTown: true, deliver: true, postCodes: [{ postCode: "1200", postOffice: "Tetovo" }] },
  { cityId: 6, nameLatin: "Veles", nameMk: "Велес", isTown: true, deliver: true, postCodes: [{ postCode: "1400", postOffice: "Veles" }] },
  { cityId: 7, nameLatin: "Stip", nameMk: "Штип", isTown: true, deliver: true, postCodes: [{ postCode: "2000", postOffice: "Stip" }] },
  {
    cityId: 8,
    nameLatin: "Ohrid",
    nameMk: "Охрид",
    isTown: true,
    deliver: true,
    postCodes: [
      { postCode: "6000", postOffice: "Охрид - Центар (Ohrid)" },
      { postCode: "6322", postOffice: "Охрид (Ohrid 6322)" },
    ],
  },
  { cityId: 9, nameLatin: "Gostivar", nameMk: "Гостивар", isTown: true, deliver: true, postCodes: [{ postCode: "1230", postOffice: "Gostivar" }] },
  { cityId: 10, nameLatin: "Strumica", nameMk: "Струмица", isTown: true, deliver: true, postCodes: [{ postCode: "2400", postOffice: "Strumica" }] },
  { cityId: 11, nameLatin: "Kavadarci", nameMk: "Кавадарци", isTown: true, deliver: true, postCodes: [{ postCode: "1430", postOffice: "Kavadarci" }] },
  { cityId: 12, nameLatin: "Kocani", nameMk: "Кочани", isTown: true, deliver: true, postCodes: [{ postCode: "2300", postOffice: "Kocani" }] },
  { cityId: 13, nameLatin: "Kicevo", nameMk: "Кичево", isTown: true, deliver: true, postCodes: [{ postCode: "6250", postOffice: "Kicevo" }] },
  { cityId: 14, nameLatin: "Struga", nameMk: "Струга", isTown: true, deliver: true, postCodes: [{ postCode: "6330", postOffice: "Struga" }] },
  { cityId: 15, nameLatin: "Radovis", nameMk: "Радовиш", isTown: true, deliver: true, postCodes: [{ postCode: "2420", postOffice: "Radovis" }] },
  { cityId: 16, nameLatin: "Gevgelija", nameMk: "Гевгелија", isTown: true, deliver: true, postCodes: [{ postCode: "1480", postOffice: "Gevgelija" }] },
  { cityId: 17, nameLatin: "Debar", nameMk: "Дебар", isTown: true, deliver: true, postCodes: [{ postCode: "1250", postOffice: "Debar" }] },
  { cityId: 18, nameLatin: "Kriva Palanka", nameMk: "Крива Паланка", isTown: true, deliver: true, postCodes: [{ postCode: "1330", postOffice: "Kriva Palanka" }] },
  { cityId: 19, nameLatin: "Sveti Nikole", nameMk: "Свети Николе", isTown: true, deliver: true, postCodes: [{ postCode: "2220", postOffice: "Sveti Nikole" }] },
  { cityId: 20, nameLatin: "Negotino", nameMk: "Неготино", isTown: true, deliver: true, postCodes: [{ postCode: "1440", postOffice: "Negotino" }] },
  { cityId: 21, nameLatin: "Delcevo", nameMk: "Делчево", isTown: true, deliver: true, postCodes: [{ postCode: "2320", postOffice: "Delcevo" }] },
  { cityId: 22, nameLatin: "Vinica", nameMk: "Виница", isTown: true, deliver: true, postCodes: [{ postCode: "2310", postOffice: "Vinica" }] },
  { cityId: 23, nameLatin: "Resen", nameMk: "Ресен", isTown: true, deliver: true, postCodes: [{ postCode: "7310", postOffice: "Resen" }] },
  { cityId: 24, nameLatin: "Probishtip", nameMk: "Пробиштип", isTown: true, deliver: true, postCodes: [{ postCode: "2210", postOffice: "Probishtip" }] },
  { cityId: 25, nameLatin: "Berovo", nameMk: "Берово", isTown: true, deliver: true, postCodes: [{ postCode: "2330", postOffice: "Berovo" }] },
  { cityId: 26, nameLatin: "Kratovo", nameMk: "Кратово", isTown: true, deliver: true, postCodes: [{ postCode: "1360", postOffice: "Kratovo" }] },
  { cityId: 27, nameLatin: "Krusevo", nameMk: "Крушево", isTown: true, deliver: true, postCodes: [{ postCode: "7550", postOffice: "Krusevo" }] },
  { cityId: 28, nameLatin: "Makedonski Brod", nameMk: "Македонски Брод", isTown: true, deliver: true, postCodes: [{ postCode: "6530", postOffice: "Makedonski Brod" }] },
  { cityId: 29, nameLatin: "Valandovo", nameMk: "Валандово", isTown: true, deliver: true, postCodes: [{ postCode: "2460", postOffice: "Valandovo" }] },
  { cityId: 30, nameLatin: "Demir Hisar", nameMk: "Демир Хисар", isTown: true, deliver: true, postCodes: [{ postCode: "7240", postOffice: "Demir Hisar" }] },
];

const EMAIL_DOMAIN_TYPOS = {
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gnail.com": "gmail.com",
  "gmal.com": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "outlok.com": "outlook.com",
  "outllok.com": "outlook.com",
  "outlook.co": "outlook.com",
  "iclod.com": "icloud.com",
  "icoud.com": "icloud.com",
};

/**
 * Merges all 16 Skopje postal codes if the API returned an older 6-postcode seed for Skopje.
 */
function enrichCitiesWithSkopjePostCodes(rawCities) {
  if (!Array.isArray(rawCities) || rawCities.length === 0) return DEFAULT_CITIES;
  return rawCities.map((city) => {
    if (
      city.nameLatin?.toLowerCase() === "skopje" ||
      city.nameMk === "Скопје"
    ) {
      const byCode = new Map();
      for (const item of SKOPJE_POST_CODES) {
        byCode.set(item.postCode, item);
      }
      for (const item of city.postCodes || []) {
        if (item?.postCode && !byCode.has(item.postCode)) {
          byCode.set(item.postCode, item);
        }
      }
      return {
        ...city,
        nameMk: city.nameMk || "Скопје",
        postCodes: Array.from(byCode.values()).sort((a, b) =>
          a.postCode.localeCompare(b.postCode),
        ),
      };
    }
    return city;
  });
}

function getSurfaceClasses(variant = "filled", hasError = false, isOpen = false) {
  if (variant === "outlined") {
    return `min-h-[44px] rounded-lg border bg-white text-sm text-gray-900 transition ${
      hasError
        ? "border-red-400 ring-2 ring-red-100"
        : isOpen
          ? "border-[#141409] ring-2 ring-[#FDC700]/50"
          : "border-gray-300 hover:border-gray-400 focus-within:border-[#141409] focus-within:ring-2 focus-within:ring-[#FDC700]/50"
    }`;
  }

  return `min-h-[48px] rounded-xl text-[15px] text-gray-900 ring-1 transition ${
    hasError
      ? "bg-white ring-2 ring-[#E3262F]/70"
      : isOpen
        ? "bg-white ring-2 ring-[#141409]"
        : "bg-[#f6f5f1] ring-black/[0.08] hover:ring-black/20 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#141409]"
  }`;
}

function getLabelClasses(variant = "filled") {
  return variant === "outlined"
    ? "mb-1.5 block text-xs font-semibold text-gray-700"
    : "mb-1.5 block text-[13px] font-semibold text-gray-800";
}

const dropdownPanelClasses =
  "menu-fade-up absolute z-40 mt-2 rounded-2xl bg-white px-4 py-3 ring-1 ring-black/[0.08] shadow-[0_20px_40px_-16px_rgba(20,20,9,0.25)]";

export function useCheckoutLocations() {
  const [phoneCountries, setPhoneCountries] = useState(DEFAULT_PHONE_COUNTRIES);
  const [cities, setCities] = useState(DEFAULT_CITIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getCheckoutLocations().then((data) => {
      if (!mounted) return;
      if (data?.phoneCountries?.length) {
        setPhoneCountries(data.phoneCountries);
      }
      if (data?.cities?.length) {
        setCities(enrichCitiesWithSkopjePostCodes(data.cities));
      }
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { phoneCountries, cities, loading };
}

export function getEmailTypoSuggestion(email) {
  const trimmed = (email || "").trim().toLowerCase();
  const atIndex = trimmed.indexOf("@");
  if (atIndex <= 0 || atIndex !== trimmed.lastIndexOf("@")) return null;
  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  if (EMAIL_DOMAIN_TYPOS[domain]) {
    return `${local}@${EMAIL_DOMAIN_TYPOS[domain]}`;
  }
  return null;
}

export function validateEmailAddressClient(email) {
  const trimmed = (email || "").trim().toLowerCase();
  if (!trimmed) return { valid: false, reason: "required" };
  if (trimmed.length > 45) return { valid: false, reason: "tooLong" };
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,15}$/.test(trimmed) || trimmed.includes("..")) {
    return { valid: false, reason: "invalid" };
  }
  const suggestion = getEmailTypoSuggestion(trimmed);
  if (suggestion) {
    return { valid: false, reason: "typo", suggestion };
  }
  return { valid: true, normalized: trimmed };
}

export function splitStoredPhone(rawPhone, countries = DEFAULT_PHONE_COUNTRIES) {
  const active = countries?.length ? countries : DEFAULT_PHONE_COUNTRIES;
  const defaultCountry = active.find((c) => c.iso2 === "MK") || active[0];
  const trimmed = (rawPhone || "").trim();
  if (!trimmed) {
    return { country: defaultCountry, nationalDigits: "" };
  }

  let digits = trimmed.replace(/\D/g, "");
  const isInternational = trimmed.startsWith("+") || digits.startsWith("00");
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  const sortedByPrefix = [...active].sort(
    (a, b) => (b.dialCode?.length || 0) - (a.dialCode?.length || 0),
  );

  if (isInternational) {
    const matched = sortedByPrefix.find(
      (c) => c.dialCode && digits.startsWith(c.dialCode),
    );
    if (matched) {
      let nat = digits.slice(matched.dialCode.length);
      if (matched.stripLeadingZero && nat.startsWith("0")) {
        nat = nat.slice(1);
      }
      return { country: matched, nationalDigits: nat };
    }
  }

  if (
    defaultCountry?.dialCode &&
    digits.startsWith(defaultCountry.dialCode) &&
    digits.length - defaultCountry.dialCode.length >= defaultCountry.phoneMinDigits
  ) {
    let nat = digits.slice(defaultCountry.dialCode.length);
    if (defaultCountry.stripLeadingZero && nat.startsWith("0")) {
      nat = nat.slice(1);
    }
    return { country: defaultCountry, nationalDigits: nat };
  }

  let nat = digits;
  if (defaultCountry?.stripLeadingZero && nat.startsWith("0")) {
    nat = nat.slice(1);
  }
  return { country: defaultCountry, nationalDigits: nat };
}

export function validatePhoneWithCountry(rawPhone, countries = DEFAULT_PHONE_COUNTRIES) {
  const { country, nationalDigits } = splitStoredPhone(rawPhone, countries);
  if (!country || !nationalDigits) return { valid: false, e164: null };

  let nat = nationalDigits;
  if (country.stripLeadingZero && nat.startsWith("0")) {
    nat = nat.slice(1);
  }

  if (nat.length < country.phoneMinDigits || nat.length > country.phoneMaxDigits) {
    return { valid: false, e164: null, country };
  }

  if (new Set(nat.split("")).size === 1) {
    return { valid: false, e164: null, country };
  }

  if (country.phonePattern) {
    try {
      const regex = new RegExp(country.phonePattern);
      if (!regex.test(nat)) return { valid: false, e164: null, country };
    } catch {
      // ignore invalid regex
    }
  }

  return {
    valid: true,
    e164: `+${country.dialCode}${nat}`,
    country,
    nationalDigits: nat,
  };
}

function formatNationalDisplay(digits) {
  const clean = (digits || "").replace(/\D/g, "");
  if (!clean) return "";
  if (clean.length <= 2) return clean;
  if (clean.length <= 5) return `${clean.slice(0, 2)} ${clean.slice(2)}`;
  if (clean.length <= 8) {
    return `${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5)}`;
  }
  return `${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5, 8)} ${clean.slice(8)}`;
}

export function findMatchingCity(cityInput, postCodeInput, cities = DEFAULT_CITIES) {
  const list = cities?.length ? cities : DEFAULT_CITIES;
  const trimmedCity = (cityInput || "").trim().toLowerCase();
  const trimmedZip = (postCodeInput || "").trim();

  if (trimmedCity) {
    const direct = list.find(
      (c) =>
        c.nameLatin?.toLowerCase() === trimmedCity ||
        (c.nameMk && c.nameMk.toLowerCase() === trimmedCity) ||
        `${c.nameMk || ""} (${c.nameLatin || ""})`.toLowerCase() === trimmedCity,
    );
    if (direct) return direct;
  }

  if (trimmedZip) {
    const byZip = list.filter((c) =>
      c.postCodes?.some((p) => p.postCode === trimmedZip),
    );
    if (byZip.length === 1) return byZip[0];
  }

  return null;
}

export function EmailTypoHint({ email, onAcceptSuggestion }) {
  const suggestion = getEmailTypoSuggestion(email);
  if (!suggestion) return null;

  return (
    <p className="mt-2 text-xs text-gray-600">
      {t("emailDidYouMean") || "Дали мислевте на"}{" "}
      <button
        type="button"
        onClick={() => onAcceptSuggestion(suggestion)}
        className="font-bold text-gray-900 cursor-pointer"
      >
        <Scribble active>{suggestion}</Scribble>
      </button>
      ?
    </p>
  );
}

/**
 * Custom Phone Input with Polished Country Flag + Custom Underline Animation Dropdown.
 * No pills: uses the project's hand-drawn <Scribble> underline and slide-right hover motion.
 */
export function PhoneInputWithCountry({
  value,
  onChange,
  phoneCountries = DEFAULT_PHONE_COUNTRIES,
  disabled = false,
  required = false,
  hasError = false,
  variant = "filled",
}) {
  const lang = getCurrentLanguage();
  const countries = phoneCountries?.length ? phoneCountries : DEFAULT_PHONE_COUNTRIES;
  const parsed = useMemo(
    () => splitStoredPhone(value, countries),
    [value, countries],
  );

  const [selectedIso2, setSelectedIso2] = useState(parsed.country?.iso2 || "MK");
  const [nationalInput, setNationalInput] = useState(parsed.nationalDigits || "");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredIso2, setHoveredIso2] = useState(null);
  const [countryQuery, setCountryQuery] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const phoneInputRef = useRef(null);

  useEffect(() => {
    setSelectedIso2(parsed.country?.iso2 || "MK");
    setNationalInput(parsed.nationalDigits || "");
  }, [parsed.country?.iso2, parsed.nationalDigits]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (dropdownOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 20);
    } else {
      setCountryQuery("");
      setHoveredIso2(null);
    }
  }, [dropdownOpen]);

  const activeCountry =
    countries.find((c) => c.iso2 === selectedIso2) ||
    countries.find((c) => c.iso2 === "MK") ||
    countries[0];

  const filteredCountries = useMemo(() => {
    const q = countryQuery.trim().toLowerCase().replace(/^\+/, "");
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.nameEn?.toLowerCase().includes(q) ||
        c.nameMk?.toLowerCase().includes(q) ||
        c.iso2?.toLowerCase().includes(q) ||
        c.dialCode?.includes(q),
    );
  }, [countries, countryQuery]);

  const handleSelectCountry = (nextCountry) => {
    setSelectedIso2(nextCountry.iso2);
    let digits = nationalInput.replace(/\D/g, "");
    if (nextCountry.stripLeadingZero && digits.startsWith("0")) {
      digits = digits.replace(/^0+/, "");
    }
    if (nextCountry.phoneMaxDigits) {
      digits = digits.slice(0, nextCountry.phoneMaxDigits);
    }
    setNationalInput(digits);
    onChange(digits ? `+${nextCountry.dialCode}${digits}` : "");
    setDropdownOpen(false);
    setTimeout(() => phoneInputRef.current?.focus(), 20);
  };

  const handleNationalChange = (e) => {
    let raw = e.target.value.replace(/\D/g, "");
    if (activeCountry?.stripLeadingZero && raw.startsWith("0")) {
      raw = raw.replace(/^0+/, "");
    }
    if (activeCountry?.phoneMaxDigits) {
      raw = raw.slice(0, activeCountry.phoneMaxDigits);
    }
    setNationalInput(raw);
    onChange(raw ? `+${activeCountry.dialCode}${raw}` : "");
  };

  const phoneValidation = useMemo(
    () =>
      nationalInput
        ? validatePhoneWithCountry(
            `+${activeCountry?.dialCode}${nationalInput}`,
            countries,
          )
        : { valid: false },
    [nationalInput, activeCountry, countries],
  );

  const placeholderText =
    activeCountry?.iso2 === "MK"
      ? "71 000 000"
      : formatNationalDisplay("7".padEnd(activeCountry?.phoneMinDigits || 8, "0"));

  const digitHint =
    activeCountry?.phoneMinDigits === activeCountry?.phoneMaxDigits
      ? `${activeCountry?.phoneMinDigits} ${t("phoneDigitsLabel") || "цифри (без почетна 0)"}`
      : `${activeCountry?.phoneMinDigits}–${activeCountry?.phoneMaxDigits} ${t("phoneDigitsLabel") || "цифри"}`;

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex items-stretch overflow-hidden ${getSurfaceClasses(
          variant,
          hasError,
          dropdownOpen,
        )} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        {/* Country Flag + Dial Code Trigger Button with Custom Scribble Underline */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setDropdownOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
          aria-label={t("phoneCountryPrefix") || "Повикувачки број"}
          className="group flex shrink-0 items-center gap-2.5 pl-3.5 pr-3 text-left transition active:scale-[0.98] focus:outline-none"
        >
          <CountryFlag
            iso2={activeCountry?.iso2}
            alt={activeCountry?.nameEn}
            size="md"
          />
          <Scribble active={dropdownOpen}>
            <span className="font-bold tabular-nums text-gray-900 text-sm sm:text-[15px]">
              +{activeCountry?.dialCode}
            </span>
          </Scribble>
          <FiChevronDown
            size={15}
            strokeWidth={2.4}
            className={`text-gray-500 transition-transform duration-300 ${
              dropdownOpen ? "rotate-180 text-gray-900" : "group-hover:text-gray-900"
            }`}
          />
        </button>

        {/* Subtle Vertical Divider */}
        <span aria-hidden="true" className="my-2.5 w-px shrink-0 bg-black/[0.1]" />

        {/* National Number Input */}
        <div className="relative flex flex-1 min-w-0 items-center">
          <input
            ref={phoneInputRef}
            type="tel"
            inputMode="numeric"
            value={formatNationalDisplay(nationalInput)}
            onChange={handleNationalChange}
            disabled={disabled}
            required={required}
            placeholder={placeholderText}
            className="w-full min-w-0 bg-transparent px-3.5 py-2.5 font-medium tabular-nums text-gray-900 placeholder:font-normal placeholder:text-gray-400 focus:outline-none text-sm sm:text-[15px]"
          />
          {phoneValidation.valid && (
            <FiCheck
              size={17}
              strokeWidth={2.8}
              aria-hidden="true"
              className="mr-3.5 shrink-0 text-[#4E9A2A]"
            />
          )}
        </div>
      </div>

      {/* Hint row */}
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="font-semibold text-gray-700">
            {lang === "mk" ? activeCountry?.nameMk : activeCountry?.nameEn}
          </span>
          <span>•</span>
          <span>{digitHint}</span>
        </span>
        {nationalInput && (
          <span className="font-mono text-[11px] text-gray-500 tabular-nums">
            +{activeCountry?.dialCode} {formatNationalDisplay(nationalInput)}
          </span>
        )}
      </div>

      {/* Custom Country Prefix Dropdown Menu — No Pills, Custom Underline Animation */}
      {dropdownOpen && !disabled && (
        <div
          className={`${dropdownPanelClasses} left-0 right-0 sm:right-auto sm:w-[370px]`}
          role="listbox"
        >
          <div className="relative mb-2 border-b border-black/[0.08] pb-2">
            <FiSearch
              size={15}
              className="pointer-events-none absolute left-1 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={countryQuery}
              onChange={(e) => setCountryQuery(e.target.value)}
              placeholder={
                lang === "al"
                  ? "Kërko shtetin ose +prefiksin..."
                  : "Пребарај држава или +префикс..."
              }
              className="w-full bg-transparent pl-7 pr-6 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            {countryQuery && (
              <button
                type="button"
                onClick={() => setCountryQuery("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900"
              >
                <FiX size={14} />
              </button>
            )}
          </div>

          <ul className="menu-stagger max-h-64 overflow-y-auto divide-y divide-black/[0.05] pr-1">
            {filteredCountries.length === 0 ? (
              <li className="py-4 text-center text-xs text-gray-500">
                {lang === "al" ? "Nuk u gjet asnjë shtet" : "Нема пронајдено држава"}
              </li>
            ) : (
              filteredCountries.map((c, idx) => {
                const isSelected = c.iso2 === activeCountry?.iso2;
                const isHovered = hoveredIso2 === c.iso2;
                const countryLabel = lang === "mk" ? c.nameMk : c.nameEn;
                return (
                  <li
                    key={c.iso2}
                    style={{ "--i": idx }}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHoveredIso2(c.iso2)}
                    onMouseLeave={() => setHoveredIso2(null)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectCountry(c);
                    }}
                    className={`group flex min-h-[46px] cursor-pointer items-center justify-between gap-3 py-2 text-sm transition-all duration-200 active:scale-[0.98] ${
                      isSelected
                        ? "translate-x-1 font-bold text-gray-900"
                        : "font-medium text-gray-700 hover:translate-x-1 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <CountryFlag iso2={c.iso2} alt={c.nameEn} size="md" />
                      <div className="min-w-0">
                        <Scribble active={isSelected || isHovered}>
                          <span className="text-[14px] text-gray-900">
                            {countryLabel}
                          </span>
                        </Scribble>
                        <span className="mt-0.5 block text-[11px] font-normal text-gray-400">
                          {c.iso2} •{" "}
                          {c.phoneMinDigits === c.phoneMaxDigits
                            ? `${c.phoneMinDigits} цифри`
                            : `${c.phoneMinDigits}–${c.phoneMaxDigits} цифри`}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="font-mono text-xs font-bold tabular-nums text-gray-900">
                        +{c.dialCode}
                      </span>
                      <FiChevronRight
                        size={15}
                        aria-hidden="true"
                        className={`text-gray-900 transition-all duration-200 ${
                          isSelected || isHovered
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-2 opacity-0"
                        }`}
                      />
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Searchable City & Connected Postcode Selector.
 *  - No pills: uses the custom <Scribble> brush underline animation on hover/selected items.
 *  - Prominent city names (e.g. "Скопје (Skopje)") that are never squished by long postal code lists.
 *  - Full support for all 16 Skopje postal codes in the connected Post Code dropdown.
 */
export function CityPostCodeSelector({
  city,
  postCode,
  onSelectCityAndPostCode,
  cities = DEFAULT_CITIES,
  disabled = false,
  required = false,
  cityError = null,
  postCodeError = null,
  layout = "grid",
  variant = "filled",
}) {
  const lang = getCurrentLanguage();
  const activeCities = useMemo(
    () =>
      enrichCitiesWithSkopjePostCodes(
        cities?.length ? cities : DEFAULT_CITIES,
      ).filter((c) => c.deliver !== false),
    [cities],
  );

  const matchedCity = useMemo(
    () => findMatchingCity(city, postCode, activeCities),
    [city, postCode, activeCities],
  );

  const [searchText, setSearchText] = useState("");
  const [cityOpen, setCityOpen] = useState(false);
  const [zipOpen, setZipOpen] = useState(false);
  const [hoveredCity, setHoveredCity] = useState(null);
  const [hoveredZip, setHoveredZip] = useState(null);
  const wrapperRef = useRef(null);

  const formatCityDisplayName = (cityObj) => {
    if (!cityObj) return "";
    if (lang === "mk" && cityObj.nameMk) {
      return `${cityObj.nameMk} (${cityObj.nameLatin})`;
    }
    return cityObj.nameMk
      ? `${cityObj.nameLatin} (${cityObj.nameMk})`
      : cityObj.nameLatin;
  };

  useEffect(() => {
    if (matchedCity) {
      setSearchText(formatCityDisplayName(matchedCity));
    } else {
      setSearchText(city || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedCity, city, lang]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setCityOpen(false);
        setZipOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCities = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    // When the input matches the currently selected city, show all cities so the user can easily switch
    if (
      !q ||
      (matchedCity &&
        (q === formatCityDisplayName(matchedCity).toLowerCase() ||
          q === matchedCity.nameLatin?.toLowerCase() ||
          q === matchedCity.nameMk?.toLowerCase()))
    ) {
      return activeCities;
    }
    return activeCities.filter(
      (c) =>
        c.nameLatin?.toLowerCase().includes(q) ||
        (c.nameMk && c.nameMk.toLowerCase().includes(q)) ||
        c.postCodes?.some(
          (p) =>
            p.postCode.includes(q) ||
            (p.postOffice && p.postOffice.toLowerCase().includes(q)),
        ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCities, searchText, matchedCity, lang]);

  const handleChooseCity = (chosen) => {
    const primaryZip = chosen.postCodes?.[0]?.postCode || "";
    const keepCurrentZip =
      postCode && chosen.postCodes?.some((p) => p.postCode === postCode);
    const nextZip = keepCurrentZip ? postCode : primaryZip;

    onSelectCityAndPostCode(chosen.nameLatin, nextZip);
    setSearchText(formatCityDisplayName(chosen));
    setCityOpen(false);
  };

  const handlePostCodeChange = (nextZip) => {
    const cleanZip = nextZip.replace(/\D/g, "").slice(0, 4);
    if (
      matchedCity &&
      matchedCity.postCodes?.some((p) => p.postCode === cleanZip)
    ) {
      onSelectCityAndPostCode(matchedCity.nameLatin, cleanZip);
      return;
    }
    const cityByZip = activeCities.find((c) =>
      c.postCodes?.some((p) => p.postCode === cleanZip),
    );
    if (cityByZip && cleanZip.length === 4) {
      onSelectCityAndPostCode(cityByZip.nameLatin, cleanZip);
      setSearchText(formatCityDisplayName(cityByZip));
    } else {
      onSelectCityAndPostCode(city, cleanZip);
    }
  };

  const validPostCodes = matchedCity?.postCodes || [];
  const selectedZipObj =
    validPostCodes.find((p) => p.postCode === postCode) || validPostCodes[0];

  // Compact postal code range label so cities with many postcodes (like Skopje) never crowd the city name
  const formatPostCodeRange = (postCodes) => {
    if (!postCodes || postCodes.length === 0) return "";
    if (postCodes.length === 1) return postCodes[0].postCode;
    if (postCodes.length === 2) {
      return `${postCodes[0].postCode}, ${postCodes[1].postCode}`;
    }
    const first = postCodes[0].postCode;
    const last = postCodes[postCodes.length - 1].postCode;
    return `${first}–${last}`;
  };

  return (
    <div
      ref={wrapperRef}
      className={
        layout === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
          : "space-y-4"
      }
    >
      {/* Searchable City Combobox */}
      <div className="relative">
        <label className={getLabelClasses(variant)}>
          {t("city")} {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>

        <div
          className={`flex items-center px-3.5 ${getSurfaceClasses(
            variant,
            Boolean(cityError),
            cityOpen,
          )} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <FiMapPin size={16} className="mr-2.5 shrink-0 text-gray-500" />
          <input
            type="text"
            value={searchText}
            disabled={disabled}
            required={required}
            placeholder={
              t("searchCityPlaceholder") || "Изберете или пребарајте град..."
            }
            onFocus={(e) => {
              if (!disabled) {
                setCityOpen(true);
                setZipOpen(false);
                e.target.select();
              }
            }}
            onChange={(e) => {
              setSearchText(e.target.value);
              setCityOpen(true);
              if (!e.target.value.trim()) {
                onSelectCityAndPostCode("", "");
              }
            }}
            className="w-full min-w-0 bg-transparent py-2.5 text-sm sm:text-[15px] font-semibold text-gray-900 placeholder:font-normal placeholder:text-gray-400 focus:outline-none"
          />
          {searchText && !disabled && (
            <button
              type="button"
              onClick={() => {
                setSearchText("");
                onSelectCityAndPostCode("", "");
                setCityOpen(true);
              }}
              aria-label="Clear city"
              className="mr-1 p-1 text-gray-400 transition hover:text-gray-900"
            >
              <FiX size={14} />
            </button>
          )}
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={() => !disabled && setCityOpen((o) => !o)}
            className="p-1 text-gray-500 hover:text-gray-900"
          >
            <FiChevronDown
              size={16}
              strokeWidth={2.4}
              className={`transition-transform duration-300 ${
                cityOpen ? "rotate-180 text-gray-900" : ""
              }`}
            />
          </button>
        </div>

        {cityOpen && !disabled && (
          <div className={`${dropdownPanelClasses} left-0 right-0`} role="listbox">
            <ul className="menu-stagger max-h-64 overflow-y-auto divide-y divide-black/[0.05] pr-1">
              {filteredCities.length === 0 ? (
                <li className="py-4 text-center text-xs text-gray-500">
                  {t("noDeliverableCityFound") ||
                    "Нема достапен град за достава со тоа име"}
                </li>
              ) : (
                filteredCities.map((c, idx) => {
                  const isSelected = matchedCity?.nameLatin === c.nameLatin;
                  const isHovered = hoveredCity === c.nameLatin;
                  const rangeLabel = formatPostCodeRange(c.postCodes);
                  return (
                    <li
                      key={c.cityId || c.nameLatin}
                      style={{ "--i": idx }}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setHoveredCity(c.nameLatin)}
                      onMouseLeave={() => setHoveredCity(null)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleChooseCity(c);
                      }}
                      className={`group flex min-h-[44px] cursor-pointer items-center justify-between gap-3 py-2 text-sm transition-all duration-200 active:scale-[0.98] ${
                        isSelected
                          ? "translate-x-1 font-bold text-gray-900"
                          : "font-medium text-gray-700 hover:translate-x-1 hover:text-gray-900"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <Scribble active={isSelected || isHovered}>
                          <span className="text-[15px] font-bold text-gray-900">
                            {c.nameMk || c.nameLatin}
                          </span>
                        </Scribble>
                        {c.nameMk && c.nameLatin && (
                          <span className="ml-2 text-xs font-normal text-gray-500">
                            {c.nameLatin}
                          </span>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span className="font-mono text-xs font-semibold tabular-nums text-gray-500">
                          {rangeLabel}
                        </span>
                        <FiChevronRight
                          size={15}
                          aria-hidden="true"
                          className={`text-gray-900 transition-all duration-200 ${
                            isSelected || isHovered
                              ? "translate-x-0 opacity-100"
                              : "-translate-x-2 opacity-0"
                          }`}
                        />
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
        {cityError && <p className="mt-1 text-xs text-red-600">{cityError}</p>}
      </div>

      {/* Connected Post Code Field */}
      <div className="relative">
        <label className={getLabelClasses(variant)}>
          {t("postCode")} {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>

        {validPostCodes.length > 1 ? (
          <>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                if (!disabled) {
                  setZipOpen((o) => !o);
                  setCityOpen(false);
                }
              }}
              className={`group flex w-full items-center justify-between px-3.5 text-left ${getSurfaceClasses(
                variant,
                Boolean(postCodeError),
                zipOpen,
              )}`}
            >
              <span className="flex min-w-0 items-center gap-2.5 truncate py-2 text-sm sm:text-[15px]">
                <Scribble active={zipOpen}>
                  <span className="font-mono font-bold text-gray-900 tabular-nums">
                    {selectedZipObj?.postCode || postCode}
                  </span>
                </Scribble>
                {selectedZipObj?.postOffice && (
                  <span className="truncate text-xs text-gray-500">
                    — {selectedZipObj.postOffice}
                  </span>
                )}
              </span>
              <FiChevronDown
                size={16}
                strokeWidth={2.4}
                className={`shrink-0 text-gray-500 transition-transform duration-300 ${
                  zipOpen ? "rotate-180 text-gray-900" : "group-hover:text-gray-900"
                }`}
              />
            </button>

            {zipOpen && !disabled && (
              <div className={`${dropdownPanelClasses} left-0 right-0`} role="listbox">
                <ul className="menu-stagger max-h-64 overflow-y-auto divide-y divide-black/[0.05] pr-1">
                  {validPostCodes.map((p, idx) => {
                    const isSelected =
                      p.postCode === (postCode || validPostCodes[0]?.postCode);
                    const isHovered = hoveredZip === p.postCode;
                    return (
                      <li
                        key={p.postCode}
                        style={{ "--i": idx }}
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={() => setHoveredZip(p.postCode)}
                        onMouseLeave={() => setHoveredZip(null)}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handlePostCodeChange(p.postCode);
                          setZipOpen(false);
                        }}
                        className={`group flex min-h-[42px] cursor-pointer items-center justify-between gap-2 py-2 text-sm transition-all duration-200 active:scale-[0.98] ${
                          isSelected
                            ? "translate-x-1 font-bold text-gray-900"
                            : "font-medium text-gray-700 hover:translate-x-1 hover:text-gray-900"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <Scribble active={isSelected || isHovered}>
                            <span className="font-mono text-sm font-bold tabular-nums text-gray-900">
                              {p.postCode}
                            </span>
                          </Scribble>
                          <span className="ml-2.5 text-xs text-gray-600">
                            {p.postOffice || matchedCity?.nameLatin}
                          </span>
                        </div>
                        <FiChevronRight
                          size={15}
                          aria-hidden="true"
                          className={`shrink-0 text-gray-900 transition-all duration-200 ${
                            isSelected || isHovered
                              ? "translate-x-0 opacity-100"
                              : "-translate-x-2 opacity-0"
                          }`}
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div
            className={`flex items-center px-3.5 ${getSurfaceClasses(
              variant,
              Boolean(postCodeError),
              false,
            )}`}
          >
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={postCode || ""}
              disabled={disabled}
              readOnly={validPostCodes.length === 1}
              required={required}
              onChange={(e) => handlePostCodeChange(e.target.value)}
              placeholder="1000"
              className="w-full min-w-0 bg-transparent py-2.5 font-mono text-sm sm:text-[15px] font-bold tabular-nums text-gray-900 placeholder:font-normal placeholder:text-gray-400 focus:outline-none"
            />
            {validPostCodes.length === 1 && postCode && (
              <FiCheck
                size={17}
                strokeWidth={2.8}
                aria-hidden="true"
                className="ml-2 shrink-0 text-[#4E9A2A]"
              />
            )}
          </div>
        )}
        {postCodeError && (
          <p className="mt-1 text-xs text-red-600">{postCodeError}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Locked Shipping Country Display with Polished North Macedonia Flag Icon.
 */
export function LockedCountryInput({ label, variant = "filled" }) {
  const lang = getCurrentLanguage();
  const displayCountry =
    lang === "mk"
      ? "Северна Македонија"
      : lang === "al"
        ? "Maqedonia e Veriut"
        : "North Macedonia";

  return (
    <div>
      <label className={getLabelClasses(variant)}>
        {label || t("country")} <span className="ml-0.5 text-red-500">*</span>
      </label>
      <div
        className={`flex items-center justify-between gap-3 px-3.5 ${
          variant === "outlined"
            ? "min-h-[44px] rounded-lg border border-gray-200 bg-[#f6f5f1] text-sm"
            : "min-h-[48px] rounded-xl bg-[#f6f5f1] ring-1 ring-black/[0.08] text-[15px]"
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <CountryFlag iso2="MK" alt="North Macedonia" size="md" />
          <span className="truncate font-bold text-gray-900">
            {displayCountry}
          </span>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-gray-500">
          <FiLock size={12} />
          MK
        </span>
      </div>
      <p className="mt-1 text-[11px] text-gray-500">
        {t("shippingOnlyMacedoniaNote") ||
          "Доставата е достапна само во Северна Македонија."}
      </p>
    </div>
  );
}

/**
 * Free Street Address Autocomplete powered by Komoot Photon / OpenStreetMap.
 * Non-blocking: uses the custom <Scribble> underline animation on hover.
 */
export function StreetAddressAutocomplete({
  value,
  onChange,
  city = "",
  disabled = false,
  required = false,
  placeholder = "",
  hasError = false,
  variant = "filled",
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    const trimmed = (value || "").trim();
    if (trimmed.length < 3 || disabled) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const items = await api.searchStreetAddresses(
        trimmed,
        city,
        controller.signal,
      );
      setSuggestions(items);
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, city, disabled]);

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className={`flex items-center px-3.5 ${getSurfaceClasses(
          variant,
          hasError,
          open && suggestions.length > 0,
        )} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <FiNavigation size={15} className="mr-2.5 shrink-0 text-gray-400" />
        <input
          type="text"
          value={value || ""}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          className="w-full min-w-0 bg-transparent py-2.5 text-sm sm:text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />
      </div>

      {open && suggestions.length > 0 && !disabled && (
        <div className={`${dropdownPanelClasses} left-0 right-0`} role="listbox">
          <ul className="menu-stagger max-h-56 overflow-y-auto divide-y divide-black/[0.05] pr-1">
            {suggestions.map((item, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <li
                  key={`${item.street}-${idx}`}
                  style={{ "--i": idx }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange(item.street);
                    setOpen(false);
                  }}
                  className="group flex min-h-[42px] cursor-pointer items-center justify-between gap-2 py-2 text-xs sm:text-sm transition-all duration-200 hover:translate-x-1 active:scale-[0.98]"
                >
                  <span className="flex min-w-0 items-center gap-2.5 font-semibold text-gray-900">
                    <FiMapPin size={14} className="shrink-0 text-gray-500" />
                    <Scribble active={isHovered}>
                      <span className="truncate">{item.street}</span>
                    </Scribble>
                  </span>
                  {item.city && (
                    <span className="shrink-0 text-xs text-gray-500">
                      {item.city}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
