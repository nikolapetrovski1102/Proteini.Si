import React, { useEffect, useMemo, useState } from "react";
import { FiGlobe, FiMapPin, FiPhone, FiRefreshCw } from "react-icons/fi";
import { api } from "../../services/api";
import { t } from "../translation/translation";
import { CountryFlag } from "../Components/AddressFields";
import Scribble from "../Components/Scribble";
import {
  AdminPage,
  Button,
  Card,
  Loading,
  Notice,
  SearchInput,
  Toggle,
  selectClass,
  tableClass,
  tableWrapClass,
  tdClass,
  thClass,
  trClass,
} from "./AdminKit";

export default function AdminDeliveryLocations() {
  const [activeTab, setActiveTab] = useState("cities");
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Filters for cities
  const [citySearch, setCitySearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");

  // Filters for countries
  const [countrySearch, setCountrySearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getAdminDeliveryLocations();
      setCities(data.cities || []);
      setCountries(data.countries || []);
    } catch (err) {
      setError(err.message || "Failed to load delivery cities and country prefixes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice((curr) => (curr === msg ? "" : curr)), 3500);
  };

  const handleToggleCityDeliver = async (city) => {
    const nextDeliver = !city.deliver;
    setSavingId(`city-${city.cityId}`);
    setError("");
    try {
      await api.updateCityDeliver(city.cityId, nextDeliver);
      setCities((prev) =>
        prev.map((c) => (c.cityId === city.cityId ? { ...c, deliver: nextDeliver } : c)),
      );
      showNotice(`${city.nameMk || city.nameLatin}: достава = ${nextDeliver ? "ДА" : "НЕ"}`);
    } catch (err) {
      setError(err.message || "Failed to update city delivery flag");
    } finally {
      setSavingId(null);
    }
  };

  const handleBulkToggle = async (isTown, deliver) => {
    setBulkSaving(true);
    setError("");
    try {
      await api.bulkUpdateCityDeliver(isTown, deliver);
      setCities((prev) =>
        prev.map((c) => (Boolean(c.isTown) === Boolean(isTown) ? { ...c, deliver } : c)),
      );
      showNotice(
        `Успешно ажурирани сите ${isTown ? "градови" : "села/населени места"} (Deliver = ${deliver ? "ДА" : "НЕ"}).`,
      );
    } catch (err) {
      setError(err.message || "Bulk update failed");
    } finally {
      setBulkSaving(false);
    }
  };

  const handleToggleCountryPhone = async (country) => {
    const nextAllow = !country.allowPhone;
    setSavingId(`country-${country.countryId}`);
    setError("");
    try {
      await api.updateCountryAllowPhone(country.countryId, nextAllow);
      setCountries((prev) =>
        prev.map((c) =>
          c.countryId === country.countryId ? { ...c, allowPhone: nextAllow } : c,
        ),
      );
      showNotice(
        `+${country.dialCode} (${country.nameMk || country.nameEn}): телефон за нарачка = ${nextAllow ? "ДОЗВОЛЕН" : "БЛОКИРАН"}`,
      );
    } catch (err) {
      setError(err.message || "Failed to update country phone permission");
    } finally {
      setSavingId(null);
    }
  };

  const filteredCities = useMemo(() => {
    const q = citySearch.trim().toLowerCase();
    return cities.filter((c) => {
      if (cityFilter === "towns" && !c.isTown) return false;
      if (cityFilter === "villages" && c.isTown) return false;
      if (cityFilter === "deliver_on" && !c.deliver) return false;
      if (cityFilter === "deliver_off" && c.deliver) return false;

      if (!q) return true;
      return (
        c.nameLatin?.toLowerCase().includes(q) ||
        (c.nameMk && c.nameMk.toLowerCase().includes(q)) ||
        c.postCodes?.some(
          (p) =>
            p.postCode.includes(q) ||
            (p.postOffice && p.postOffice.toLowerCase().includes(q)),
        )
      );
    });
  }, [cities, citySearch, cityFilter]);

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.nameEn?.toLowerCase().includes(q) ||
        c.nameMk?.toLowerCase().includes(q) ||
        c.iso2?.toLowerCase().includes(q) ||
        c.dialCode?.includes(q),
    );
  }, [countries, countrySearch]);

  const activeDeliverCount = useMemo(
    () => cities.filter((c) => c.deliver).length,
    [cities],
  );
  const activePhoneCount = useMemo(
    () => countries.filter((c) => c.allowPhone).length,
    [countries],
  );

  return (
    <AdminPage
      eyebrow="Локации и валидација"
      title={t("adminDeliveryTitle") || "Градови за достава и телефонски префикси"}
      description={
        t("adminDeliverySubtitle") ||
        "Управувајте со достапните градови/населени места во Северна Македонија и дозволените државни телефонски префикси за нарачка."
      }
      actions={
        <Button variant="secondary" icon={FiRefreshCw} loading={loading} onClick={loadData}>
          Освежи
        </Button>
      }
    >
      <Notice tone="error" onDismiss={() => setError("")}>
        {error}
      </Notice>
      <Notice tone="success" onDismiss={() => setNotice("")}>
        {notice}
      </Notice>

      {/* Navigation Tabs with Custom Scribble Underline Animation (No Pills) */}
      <div className="flex flex-wrap items-center gap-8 border-b border-black/[0.08] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("cities")}
          className={`group inline-flex items-center gap-2.5 py-1.5 text-sm font-bold transition ${
            activeTab === "cities" ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <FiMapPin size={16} />
          <Scribble active={activeTab === "cities"}>
            <span>Градови и поштенски броеви (МК)</span>
          </Scribble>
          <span className="font-mono text-xs font-semibold tabular-nums text-gray-400">
            ({activeDeliverCount}/{cities.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("countries")}
          className={`group inline-flex items-center gap-2.5 py-1.5 text-sm font-bold transition ${
            activeTab === "countries" ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <FiPhone size={16} />
          <Scribble active={activeTab === "countries"}>
            <span>Телефонски префикси по држава</span>
          </Scribble>
          <span className="font-mono text-xs font-semibold tabular-nums text-gray-400">
            ({activePhoneCount}/{countries.length})
          </span>
        </button>
      </div>

      {loading ? (
        <Loading label="Вчитување локации..." />
      ) : activeTab === "cities" ? (
        <Card
          title="Градови и населени места во Северна Македонија"
          description="Само местата со вклучена достава (Deliver = ДА) се прикажуваат во паѓачкото мени за регистрација и нарачка."
          actions={
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                loading={bulkSaving}
                onClick={() => handleBulkToggle(true, true)}
              >
                Вклучи ги сите градови
              </Button>
              <Button
                variant="secondary"
                size="sm"
                loading={bulkSaving}
                onClick={() => handleBulkToggle(false, true)}
              >
                Вклучи ги сите села
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={bulkSaving}
                onClick={() => handleBulkToggle(false, false)}
              >
                Исклучи ги сите села
              </Button>
            </div>
          }
        >
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_260px]">
            <SearchInput
              value={citySearch}
              onChange={setCitySearch}
              placeholder="Пребарај по кирилица, латиница или поштенски број (пр. Скопје, 1000)..."
            />
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className={selectClass}
            >
              <option value="all">Сите места ({cities.length})</option>
              <option value="towns">Само градови / општини</option>
              <option value="villages">Само села / населени места</option>
              <option value="deliver_on">Само активни за достава</option>
              <option value="deliver_off">Само исклучени</option>
            </select>
          </div>

          <div className={tableWrapClass}>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Назив (МК / Латиница)</th>
                  <th className={thClass}>Тип</th>
                  <th className={thClass}>Поштенски броеви</th>
                  <th className={`${thClass} text-right`}>Достава (Deliver)</th>
                </tr>
              </thead>
              <tbody>
                {filteredCities.map((city) => {
                  const busy = savingId === `city-${city.cityId}`;
                  return (
                    <tr key={city.cityId} className={trClass}>
                      <td className={`${tdClass} font-bold text-gray-900`}>
                        <Scribble active={Boolean(city.deliver)}>
                          <span>{city.nameMk || city.nameLatin}</span>
                        </Scribble>
                        <span className="ml-2 text-xs font-normal text-gray-500">
                          {city.nameLatin}
                        </span>
                      </td>
                      <td className={`${tdClass} text-xs text-gray-600`}>
                        {city.isTown ? "Град / Општина" : "Населено место"}
                      </td>
                      <td className={`${tdClass} font-mono text-xs text-gray-700`}>
                        {(city.postCodes || []).map((p) => p.postCode).join(", ")}
                      </td>
                      <td className={`${tdClass} text-right`}>
                        <div className="inline-flex justify-end">
                          <Toggle
                            checked={Boolean(city.deliver)}
                            disabled={busy}
                            onChange={() => handleToggleCityDeliver(city)}
                            label={city.deliver ? "Достапно" : "Исклучено"}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card
          title="Дозволени телефонски префикси за нарачка"
          description="Државата за испорака е заклучена на Северна Македонија, но купувачите можат да внесат телефонски број од дозволените држави подолу."
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <SearchInput
              value={countrySearch}
              onChange={setCountrySearch}
              placeholder="Пребарај држава или префикс (пр. 389, MK, Македонија)..."
              className="w-full sm:max-w-md"
            />
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FiGlobe size={14} />
              <span>
                Испорака само во <strong>Северна Македонија (MK)</strong>
              </span>
            </div>
          </div>

          <div className={tableWrapClass}>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Држава</th>
                  <th className={thClass}>Префикс</th>
                  <th className={thClass}>Број на цифри (национален)</th>
                  <th className={thClass}>Крати почетна 0</th>
                  <th className={thClass}>Испорака</th>
                  <th className={`${thClass} text-right`}>Дозволен број</th>
                </tr>
              </thead>
              <tbody>
                {filteredCountries.map((c) => {
                  const busy = savingId === `country-${c.countryId}`;
                  return (
                    <tr key={c.countryId} className={trClass}>
                      <td className={`${tdClass} font-bold text-gray-900`}>
                        <div className="flex items-center gap-3">
                          <CountryFlag iso2={c.iso2} alt={c.nameEn} size="md" />
                          <div>
                            <Scribble active={Boolean(c.allowPhone)}>
                              <span>{c.nameMk}</span>
                            </Scribble>
                            <span className="ml-2 text-xs font-normal text-gray-500">
                              {c.nameEn} ({c.iso2})
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className={`${tdClass} font-mono font-bold text-gray-900`}>
                        +{c.dialCode}
                      </td>
                      <td className={`${tdClass} text-xs text-gray-700`}>
                        {c.phoneMinDigits === c.phoneMaxDigits
                          ? `${c.phoneMinDigits} цифри`
                          : `${c.phoneMinDigits}–${c.phoneMaxDigits} цифри`}
                        {c.phonePattern && (
                          <span className="ml-2 font-mono text-[11px] text-gray-400">
                            ({c.phonePattern})
                          </span>
                        )}
                      </td>
                      <td className={`${tdClass} text-xs text-gray-600`}>
                        {c.stripLeadingZero ? "Да (071 → 71)" : "Не"}
                      </td>
                      <td className={`${tdClass} text-xs font-semibold text-gray-800`}>
                        {c.allowShipping ? (
                          <Scribble active>
                            <span>Единствена за испорака</span>
                          </Scribble>
                        ) : (
                          <span className="font-normal text-gray-400">Не</span>
                        )}
                      </td>
                      <td className={`${tdClass} text-right`}>
                        <div className="inline-flex justify-end">
                          <Toggle
                            checked={Boolean(c.allowPhone)}
                            disabled={busy}
                            onChange={() => handleToggleCountryPhone(c)}
                            label={c.allowPhone ? "Дозволен" : "Блокиран"}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AdminPage>
  );
}
