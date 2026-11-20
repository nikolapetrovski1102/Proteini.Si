// Delivery (campaign / ad set) defaults and the payload sent to the API.
export const COUNTRIES = [
  { code: "MK", label: "North Macedonia" },
  { code: "AL", label: "Albania" },
  { code: "XK", label: "Kosovo" },
];

export const GOALS = [
  { value: "TRAFFIC", label: "Traffic", hint: "Most clicks to the shop for the budget. Best default." },
  { value: "AWARENESS", label: "Reach", hint: "Show it to as many different people as possible." },
  { value: "SALES", label: "Sales", hint: "Optimise for purchases. Needs the Meta Pixel." },
];

export const PLACEMENTS = [
  { value: "auto", label: "Automatic", hint: "Facebook + Instagram, everywhere. Usually cheapest." },
  { value: "feeds", label: "Feeds only", hint: "Facebook feed and Instagram feed." },
  { value: "stories", label: "Stories & Reels", hint: "Full-screen spots on both apps." },
  { value: "facebook", label: "Facebook only", hint: "All Facebook placements." },
  { value: "instagram", label: "Instagram only", hint: "All Instagram placements." },
];

export const GENDERS = [
  { value: "all", label: "Everyone" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
];

export const AGE_PRESETS = [
  [18, 24],
  [18, 34],
  [25, 44],
  [35, 65],
  [18, 65],
];

export const BUDGET_PRESETS = [5, 10, 20, 30, 50];
export const DURATION_PRESETS = [3, 7, 14, 30];

export const defaultDelivery = () => ({
  mode: "new",
  adSetId: "",
  campaignName: "",
  goal: "TRAFFIC",
  budgetType: "daily",
  dailyBudget: 10,
  lifetimeBudget: 70,
  startTime: "",
  endTime: "",
  countries: ["MK"],
  ageMin: 18,
  ageMax: 65,
  gender: "all",
  placements: "auto",
});

const toIso = (local) => (local ? new Date(local).toISOString() : null);

/** "2026-11-18T10:30" in local time, for datetime-local inputs. */
export const toLocalInput = (date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

/** Whole days between start (or now) and end; null when there is no end. */
export const runDays = (d) => {
  if (!d.endTime) return null;
  const start = d.startTime ? new Date(d.startTime) : new Date();
  return Math.max(0, Math.ceil((new Date(d.endTime) - start) / 86400000));
};

export const toDeliveryPayload = (d, adName) => ({
  mode: d.mode,
  adSetId: d.mode === "existing" ? d.adSetId : null,
  campaignName: d.campaignName.trim() || adName?.trim() || null,
  goal: d.goal,
  budgetType: d.budgetType,
  dailyBudget: d.budgetType === "daily" ? Number(d.dailyBudget) || 0 : 0,
  lifetimeBudget: d.budgetType === "lifetime" ? Number(d.lifetimeBudget) || 0 : 0,
  startTime: toIso(d.startTime),
  endTime: toIso(d.endTime),
  countries: d.countries,
  ageMin: Number(d.ageMin) || 18,
  ageMax: Number(d.ageMax) || 65,
  gender: d.gender,
  placements: d.placements,
});
