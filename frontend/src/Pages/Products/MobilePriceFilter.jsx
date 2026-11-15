import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { filterText } from "../../utils/filterLabels";
import { formatAmount } from "../../utils/formatPrice";

// Round boundaries a shopper would expect; only the ones inside the catalog's range are used.
const CANDIDATE_STEPS = [500, 1000, 1500, 2000, 3000, 5000, 7500, 10000, 15000, 20000];

const fmt = formatAmount;
const isSet = (v) => v !== null && v !== undefined && v !== "" && Number.isFinite(Number(v));

function buildPresets(min, max) {
  const steps = CANDIDATE_STEPS.filter((s) => s > min && s < max).slice(0, 4);
  const bounds = [min, ...steps, max];
  return bounds.slice(0, -1).map((lo, i) => ({ min: lo, max: bounds[i + 1] }));
}

function presetLabel(p, min, max) {
  const cur = filterText("currency");
  if (p.min === min) return `${filterText("under").replace("{n}", fmt(p.max))} ${cur}`;
  if (p.max === max) return `${filterText("over").replace("{n}", fmt(p.min))} ${cur}`;
  return `${fmt(p.min)} – ${fmt(p.max)} ${cur}`;
}

/** Simple, touch-friendly price filter: preset ranges + two plain inputs. */
export default function MobilePriceFilter({ min = 0, max = 10000, valueMin, valueMax, onCommit }) {
  const active = isSet(valueMin) || isSet(valueMax);
  const curMin = active && isSet(valueMin) ? Number(valueMin) : min;
  const curMax = active && isSet(valueMax) ? Number(valueMax) : max;

  return (
    <Editor
      key={`${active}-${curMin}-${curMax}`}
      min={min}
      max={max}
      active={active}
      curMin={curMin}
      curMax={curMax}
      onCommit={onCommit}
    />
  );
}

function Editor({ min, max, active, curMin, curMax, onCommit }) {
  const [from, setFrom] = useState(active ? String(curMin) : "");
  const [to, setTo] = useState(active ? String(curMax) : "");
  const presets = buildPresets(min, max);

  const commitInputs = () => {
    if (from === "" && to === "") {
      if (active) onCommit(null, null);
      return;
    }
    let lo = from === "" ? min : Number(from) || min;
    let hi = to === "" ? max : Number(to) || max;
    lo = Math.max(min, Math.min(lo, max));
    hi = Math.max(min, Math.min(hi, max));
    if (lo > hi) [lo, hi] = [hi, lo];
    if (!active || lo !== curMin || hi !== curMax) onCommit(lo, hi);
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => {
          const selected = active && curMin === p.min && curMax === p.max;
          return (
            <button
              key={`${p.min}-${p.max}`}
              type="button"
              aria-pressed={selected}
              onClick={() => (selected ? onCommit(null, null) : onCommit(p.min, p.max))}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] transition-colors ${
                selected
                  ? "border-[#141409] bg-[#141409] font-semibold text-white"
                  : "border-gray-200 bg-white text-gray-800 active:bg-gray-100"
              }`}
            >
              {selected && <FiCheck className="h-3.5 w-3.5 text-[#FDC700]" strokeWidth={3} aria-hidden />}
              {presetLabel(p, min, max)}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <PriceField label={filterText("min")} placeholder={fmt(min)} value={from} onChange={setFrom} onCommit={commitInputs} />
        <PriceField label={filterText("max")} placeholder={fmt(max)} value={to} onChange={setTo} onCommit={commitInputs} />
      </div>
    </div>
  );
}

function PriceField({ label, placeholder, value, onChange, onCommit }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[12px] font-semibold text-gray-500">{label}</span>
      <span className="flex h-12 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 transition-colors focus-within:border-[#141409]">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          enterKeyHint="done"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
          onBlur={onCommit}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          // 16px keeps iOS Safari from zooming the page when the field is focused.
          className="w-full min-w-0 bg-transparent text-[16px] font-semibold text-gray-900 outline-none placeholder:font-normal placeholder:text-gray-400"
        />
        <span className="shrink-0 text-[13px] text-gray-400">{filterText("currency")}</span>
      </span>
    </label>
  );
}
