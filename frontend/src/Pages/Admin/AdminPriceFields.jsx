/* Price inputs shared by the product and variant forms.
 *
 *  PriceWithVat     – price customers pay, VAT rate presets, and a switch to type
 *                     the price without VAT instead (stored value is always incl. VAT).
 *  SalePriceFields  – sale price kept in sync with a "% off" field and quick discounts.
 */
import { useState } from "react";
import { Field, inputClass } from "./AdminKit";
import { formatMoney } from "./adminUtils";
import { fieldClass } from "./adminFieldClass";

const VAT_PRESETS = [18, 10, 5];
const QUICK_DISCOUNTS = [10, 15, 20, 25, 30];

const round2 = (n) => Math.round(n * 100) / 100;
const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

function MoneyInput({ value, onChange, invalid, suffix = "MKD", ...props }) {
  return (
    <div className="relative">
      <input
        type="number"
        inputMode="decimal"
        min="0"
        step="any"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid || undefined}
        className={fieldClass(invalid, "pr-14 text-base font-semibold tabular-nums")}
        {...props}
      />
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400" aria-hidden="true">
        {suffix}
      </span>
    </div>
  );
}

const choiceClass = (active) =>
  `min-h-[44px] min-w-[52px] rounded-xl px-3 text-[13px] font-bold tabular-nums ring-1 transition ${
    active ? "bg-[#141409] text-white ring-[#141409]" : "bg-[#f6f5f1] text-gray-700 ring-black/[0.08] hover:text-gray-900"
  }`;

/**
 * price – stored price incl. VAT (string or number)
 * vat   – VAT rate in %
 */
export function PriceWithVat({ price, vat, onPriceChange, onVatChange, error, required = true, hint }) {
  const [mode, setMode] = useState("gross");
  const [netText, setNetText] = useState("");
  const rate = toNumber(vat);
  const gross = toNumber(price);
  const net = gross / (1 + rate / 100);
  const customVat = !VAT_PRESETS.includes(rate);
  const [showCustomVat, setShowCustomVat] = useState(customVat);

  const grossFromNet = (text, r) => (text === "" ? "" : String(round2(toNumber(text) * (1 + r / 100))));

  const switchMode = () => {
    if (mode === "gross") {
      setNetText(price === "" || price == null || gross === 0 ? "" : String(round2(net)));
      setMode("net");
    } else {
      setMode("gross");
    }
  };

  const changeVat = (value) => {
    onVatChange(value);
    // Keep the typed net price when VAT changes in "without VAT" mode.
    if (mode === "net") onPriceChange(grossFromNet(netText, toNumber(value)));
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
        {mode === "gross" ? (
          <Field label="Price customers pay (incl. VAT)" required={required} error={error} hint={hint}>
            <MoneyInput value={price} onChange={onPriceChange} invalid={Boolean(error)} placeholder="0" />
          </Field>
        ) : (
          <Field label="Price without VAT" required={required} error={error} hint={`Customers pay ${formatMoney(gross)} incl. ${rate}% VAT.`}>
            <MoneyInput
              value={netText}
              onChange={(text) => {
                setNetText(text);
                onPriceChange(grossFromNet(text, rate));
              }}
              invalid={Boolean(error)}
              placeholder="0"
            />
          </Field>
        )}

        <Field label="VAT rate">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="VAT rate">
            {VAT_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                aria-pressed={!showCustomVat && rate === preset}
                onClick={() => {
                  setShowCustomVat(false);
                  changeVat(preset);
                }}
                className={choiceClass(!showCustomVat && rate === preset)}
              >
                {preset}%
              </button>
            ))}
            {showCustomVat ? (
              <div className="relative w-[88px]">
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="any"
                  aria-label="Custom VAT rate"
                  value={vat ?? ""}
                  onChange={(e) => changeVat(e.target.value)}
                  className={`${inputClass} pr-7 font-bold tabular-nums`}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">%</span>
              </div>
            ) : (
              <button type="button" onClick={() => setShowCustomVat(true)} className={choiceClass(false)}>
                Other
              </button>
            )}
          </div>
        </Field>
      </div>

      <div className="flex flex-col gap-1.5 rounded-lg bg-[#f6f5f1] px-3 py-2 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between">
        <p className="tabular-nums">
          Without VAT <strong className="text-gray-900">{formatMoney(net)}</strong> · VAT <strong className="text-gray-900">{formatMoney(gross - net)}</strong> ·
          Total <strong className="text-gray-900">{formatMoney(gross)}</strong>
        </p>
        <button type="button" onClick={switchMode} className="self-start font-semibold text-gray-900 underline decoration-[#FDC700] decoration-2 underline-offset-4 sm:self-auto">
          {mode === "gross" ? "Type the price without VAT" : "Type the price with VAT"}
        </button>
      </div>
    </div>
  );
}

/**
 * price      – regular price incl. VAT
 * salePrice  – sale price incl. VAT (string)
 */
export function SalePriceFields({ price, salePrice, onSalePriceChange, error, label = "Sale price", required = false, hint }) {
  const regular = toNumber(price);
  const sale = toNumber(salePrice);
  const percent = regular > 0 && sale > 0 && sale < regular ? Math.round((1 - sale / regular) * 100) : "";
  const [percentText, setPercentText] = useState(null);
  const shownPercent = percentText ?? percent;

  const applyPercent = (p) => {
    if (p === "" || regular <= 0) {
      onSalePriceChange("");
      return;
    }
    const clamped = Math.min(99, Math.max(0, toNumber(p)));
    // Whole denars, always rounded up (1690 at −10% → 1521). The margin keeps float noise from adding a denar.
    onSalePriceChange(String(Math.ceil(regular * (100 - clamped) / 100 - 1e-6)));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-3">
        <Field label={label} required={required} error={error} hint={hint}>
          <MoneyInput
            value={salePrice}
            onChange={(value) => {
              setPercentText(null);
              onSalePriceChange(value);
            }}
            invalid={Boolean(error)}
            placeholder="0"
          />
        </Field>
        <Field label="% off">
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              min="0"
              max="99"
              step="1"
              disabled={regular <= 0}
              value={shownPercent}
              onChange={(e) => {
                setPercentText(e.target.value);
                applyPercent(e.target.value);
              }}
              onBlur={() => setPercentText(null)}
              className={`${inputClass} pr-8 text-base font-semibold tabular-nums`}
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">%</span>
          </div>
        </Field>
      </div>

      {regular > 0 && (
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Quick discount">
          <span className="mr-1 text-xs font-semibold text-gray-500">Quick discount</span>
          {QUICK_DISCOUNTS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={percent === p}
              onClick={() => {
                setPercentText(null);
                applyPercent(p);
              }}
              className={`min-h-[36px] rounded-lg px-2.5 text-xs font-bold tabular-nums ring-1 transition ${
                percent === p ? "bg-[#141409] text-white ring-[#141409]" : "bg-white text-gray-700 ring-black/[0.1] hover:text-gray-900"
              }`}
            >
              −{p}%
            </button>
          ))}
        </div>
      )}

      {regular > 0 && sale > 0 && sale < regular && (
        <p className="text-xs text-gray-600">
          Customers pay <strong className="tabular-nums text-gray-900">{formatMoney(sale)}</strong> instead of{" "}
          <span className="tabular-nums line-through">{formatMoney(regular)}</span> · they save{" "}
          <strong className="tabular-nums text-gray-900">{formatMoney(regular - sale)}</strong>
        </p>
      )}
      {regular <= 0 && <p className="text-xs text-gray-500">Set the regular price first to use % off.</p>}
    </div>
  );
}
