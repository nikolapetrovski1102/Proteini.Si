import { useState } from "react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function PriceRangeFilter({
  min = 0,
  max = 10000,
  valueMin,
  valueMax,
  onCommit,
  compact = false,
}) {
  const safeMin = Number.isFinite(Number(valueMin)) ? Number(valueMin) : min;
  const safeMax = Number.isFinite(Number(valueMax)) ? Number(valueMax) : max;

  return (
    <PriceRangeEditor
      key={`${min}-${max}-${safeMin}-${safeMax}`}
      min={min}
      max={max}
      initialMin={safeMin}
      initialMax={safeMax}
      onCommit={onCommit}
      compact={compact}
    />
  );
}

function PriceRangeEditor({
  min,
  max,
  initialMin,
  initialMax,
  onCommit,
  compact,
}) {
  const [draftMin, setDraftMin] = useState(clamp(initialMin, min, max));
  const [draftMax, setDraftMax] = useState(clamp(initialMax, min, max));

  const updateMin = (value) =>
    setDraftMin(clamp(Number(value) || 0, min, draftMax));
  const updateMax = (value) =>
    setDraftMax(clamp(Number(value) || 0, draftMin, max));

  return (
    <div className={compact ? "w-full" : "pr-3"}>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <label className="text-[11px] text-gray-600">
          Minimum
          <input
            type="number"
            min={min}
            max={draftMax}
            step="50"
            value={draftMin}
            onChange={(event) => updateMin(event.target.value)}
            className="mt-1 w-full border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-[#2096D8]"
          />
        </label>
        <label className="text-[11px] text-gray-600">
          Maximum
          <input
            type="number"
            min={draftMin}
            max={max}
            step="50"
            value={draftMax}
            onChange={(event) => updateMax(event.target.value)}
            className="mt-1 w-full border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-[#2096D8]"
          />
        </label>
      </div>
      <label className="block text-[11px] text-gray-600">
        From {draftMin.toLocaleString()} MKD
        <input
          type="range"
          min={min}
          max={max}
          step="50"
          value={draftMin}
          onChange={(event) => updateMin(event.target.value)}
          className="mt-1 w-full accent-[#FDC700]"
        />
      </label>
      <label className="mt-2 block text-[11px] text-gray-600">
        To {draftMax.toLocaleString()} MKD
        <input
          type="range"
          min={min}
          max={max}
          step="50"
          value={draftMax}
          onChange={(event) => updateMax(event.target.value)}
          className="mt-1 w-full accent-[#FDC700]"
        />
      </label>
      <button
        type="button"
        onClick={() => onCommit(draftMin, draftMax)}
        className="mt-3 w-full bg-[#FDC700] px-3 py-2 text-xs font-semibold text-black hover:bg-[#e7b700]"
      >
        Apply price
      </button>
    </div>
  );
}
