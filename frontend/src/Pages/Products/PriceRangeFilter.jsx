import { useState } from "react";
import { filterText } from "../../utils/filterLabels";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const STEP = 50;

export default function PriceRangeFilter({ min = 0, max = 10000, valueMin, valueMax, onCommit }) {
  const safeMin = Number.isFinite(Number(valueMin)) && valueMin !== null ? Number(valueMin) : min;
  const safeMax = Number.isFinite(Number(valueMax)) && valueMax !== null ? Number(valueMax) : max;

  return (
    <PriceRangeEditor
      key={`${min}-${max}-${safeMin}-${safeMax}`}
      min={min}
      max={max}
      initialMin={clamp(safeMin, min, max)}
      initialMax={clamp(safeMax, min, max)}
      onCommit={onCommit}
    />
  );
}

function PriceRangeEditor({ min, max, initialMin, initialMax, onCommit }) {
  const [lo, setLo] = useState(initialMin);
  const [hi, setHi] = useState(initialMax);
  // Text drafts so the inputs can be cleared/typed freely before committing.
  const [loText, setLoText] = useState(String(initialMin));
  const [hiText, setHiText] = useState(String(initialMax));

  const span = Math.max(max - min, 1);
  const left = ((lo - min) / span) * 100;
  const right = 100 - ((hi - min) / span) * 100;

  const commit = (nextLo = lo, nextHi = hi) => {
    if (nextLo !== initialMin || nextHi !== initialMax) onCommit(nextLo, nextHi);
  };

  const setLow = (v) => {
    const next = clamp(v, min, hi);
    setLo(next);
    setLoText(String(next));
    return next;
  };
  const setHigh = (v) => {
    const next = clamp(v, lo, max);
    setHi(next);
    setHiText(String(next));
    return next;
  };

  const commitText = () => {
    const nextLo = clamp(Number(loText) || min, min, max);
    const nextHi = clamp(Number(hiText) || max, nextLo, max);
    setLo(nextLo);
    setHi(nextHi);
    setLoText(String(nextLo));
    setHiText(String(nextHi));
    commit(nextLo, nextHi);
  };

  const onKey = (e) => {
    if (e.key === "Enter") e.currentTarget.blur();
  };

  return (
    <div className="w-full">
      <div className="price-range relative h-6">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gray-200" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#141409]"
          style={{ left: `${left}%`, right: `${right}%` }}
        />
        <input
          type="range"
          aria-label={filterText("min")}
          min={min}
          max={max}
          step={STEP}
          value={lo}
          onChange={(e) => setLow(Number(e.target.value))}
          onPointerUp={() => commit()}
          onKeyUp={() => commit()}
          style={{ zIndex: lo > max - span * 0.1 ? 5 : 3 }}
        />
        <input
          type="range"
          aria-label={filterText("max")}
          min={min}
          max={max}
          step={STEP}
          value={hi}
          onChange={(e) => setHigh(Number(e.target.value))}
          onPointerUp={() => commit()}
          onKeyUp={() => commit()}
          style={{ zIndex: 4 }}
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <PriceInput
          label={filterText("min")}
          value={loText}
          onChange={setLoText}
          onBlur={commitText}
          onKeyDown={onKey}
        />
        <span className="text-gray-300">–</span>
        <PriceInput
          label={filterText("max")}
          value={hiText}
          onChange={setHiText}
          onBlur={commitText}
          onKeyDown={onKey}
        />
      </div>
    </div>
  );
}

function PriceInput({ label, value, onChange, onBlur, onKeyDown }) {
  return (
    <label className="flex min-w-0 flex-1 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 transition-colors focus-within:border-[#141409]">
      <span className="sr-only">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className="w-full min-w-0 bg-transparent text-[13px] font-semibold text-gray-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="shrink-0 text-[11px] text-gray-400">{filterText("currency")}</span>
    </label>
  );
}
