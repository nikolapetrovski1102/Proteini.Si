// Shared text helpers. Details are plain text joined with " · " (no pills/chips).
export const inputClass =
  "w-full rounded-lg border border-[#e7e4da] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#141409] focus:ring-2 focus:ring-[#FDC700]/50";

export const dot = (...parts) => parts.filter((p) => p !== null && p !== undefined && p !== "").join(" · ");
