// Delivery (campaign / ad set) defaults and the payload sent to the API.
export const COUNTRIES = [
  { code: "MK", label: "North Macedonia" },
  { code: "AL", label: "Albania" },
  { code: "XK", label: "Kosovo" },
];

export const GOALS = [
  { value: "TRAFFIC", label: "Traffic", hint: "Most clicks to the shop for the budget" },
  { value: "AWARENESS", label: "Reach", hint: "Show it to as many people as possible" },
  { value: "SALES", label: "Sales", hint: "Optimise for purchases (needs the Pixel)" },
];

export const defaultDelivery = () => ({
  mode: "new",
  adSetId: "",
  campaignName: "",
  goal: "TRAFFIC",
  dailyBudget: 10,
  startTime: "",
  endTime: "",
  countries: ["MK"],
  ageMin: 18,
  ageMax: 65,
  placements: "auto",
});

const toIso = (local) => (local ? new Date(local).toISOString() : null);

export const toDeliveryPayload = (d, adName) => ({
  mode: d.mode,
  adSetId: d.mode === "existing" ? d.adSetId : null,
  campaignName: d.campaignName.trim() || adName?.trim() || null,
  goal: d.goal,
  dailyBudget: Number(d.dailyBudget) || 0,
  startTime: toIso(d.startTime),
  endTime: toIso(d.endTime),
  countries: d.countries,
  ageMin: Number(d.ageMin) || 18,
  ageMax: Number(d.ageMax) || 65,
  placements: d.placements,
});
