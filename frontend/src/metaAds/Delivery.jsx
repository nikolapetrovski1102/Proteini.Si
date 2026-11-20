import { useEffect, useState } from "react";
import { api } from "./api";
import {
  AGE_PRESETS,
  BUDGET_PRESETS,
  COUNTRIES,
  DURATION_PRESETS,
  GENDERS,
  GOALS,
  PLACEMENTS,
  runDays,
  toDeliveryPayload,
  toLocalInput,
} from "./deliveryOptions";
import { Field } from "./ui";
import { dot, inputClass } from "./format";
import Select from "./Select";

const Choice = ({ selected, onClick, title, hint, disabled }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`rounded-xl border p-3 text-left text-sm transition disabled:opacity-40 ${
      selected ? "border-[#141409] ring-2 ring-[#FDC700] bg-white" : "border-[#e7e4da] bg-white hover:border-[#141409]"
    }`}
  >
    <div className="font-semibold text-base">{title}</div>
    {hint && <div className="text-xs text-[#6b6b63] mt-0.5">{hint}</div>}
  </button>
);

const Quick = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-sm underline-offset-2 ${active ? "font-bold text-[#141409] underline decoration-2 decoration-[#FDC700]" : "text-[#6b6b63] underline hover:text-[#141409]"}`}
  >
    {children}
  </button>
);

const Group = ({ title, children, aside }) => (
  <div className="space-y-3">
    <div className="flex items-baseline justify-between gap-3">
      <h3 className="font-display text-lg uppercase tracking-wide">{title}</h3>
      {aside && <div className="text-sm text-[#6b6b63]">{aside}</div>}
    </div>
    {children}
  </div>
);

const fmtCount = (n) => (n == null ? "–" : n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e4 ? `${Math.round(n / 1e3)}K` : n.toLocaleString("de-DE"));

/** Meta's audience size + daily reach guess, refreshed (debounced) when targeting or budget changes. */
function Estimate({ d, configured, currency }) {
  const [state, setState] = useState({ loading: false, data: null, error: "" });
  const days = runDays(d);
  const daily = d.budgetType === "lifetime" ? (days ? Number(d.lifetimeBudget) / days : 0) : Number(d.dailyBudget);
  const key = JSON.stringify([d.goal, d.countries, d.ageMin, d.ageMax, d.gender, d.placements, Math.round(daily * 100)]);

  useEffect(() => {
    if (!configured || !d.countries.length) return undefined;
    const timer = setTimeout(() => {
      setState((s) => ({ ...s, loading: true, error: "" }));
      api
        .estimate({ ...toDeliveryPayload(d, ""), budgetType: "daily", dailyBudget: daily || 0 })
        .then((data) => setState({ loading: false, data, error: "" }), (e) => setState({ loading: false, data: null, error: e.message }));
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, configured]);

  const e = state.data;
  return (
    <div className="rounded-xl bg-[#141409] text-white p-4 space-y-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">Meta's estimate</div>
      {!configured ? (
        <div className="text-sm text-white/70">Available once Meta is connected.</div>
      ) : state.error ? (
        <div className="text-sm text-white/70">No estimate right now ({state.error}).</div>
      ) : (
        <div className={`grid grid-cols-2 gap-4 ${state.loading ? "opacity-60" : ""}`}>
          <div>
            <div className="text-xs text-white/60">People in this audience</div>
            <div className="font-display text-3xl leading-tight">
              {e?.audienceLower != null ? `${fmtCount(e.audienceLower)}–${fmtCount(e.audienceUpper)}` : state.loading ? "…" : "–"}
            </div>
          </div>
          <div>
            <div className="text-xs text-white/60">Reached per day</div>
            <div className="font-display text-3xl leading-tight text-[#FDC700]">
              {e?.dailyReachLower != null ? `${fmtCount(e.dailyReachLower)}–${fmtCount(e.dailyReachUpper)}` : state.loading ? "…" : "–"}
            </div>
          </div>
        </div>
      )}
      <div className="text-xs text-white/50">{dot(daily ? `at about ${daily.toFixed(2)} ${currency}/day` : null, "a guess, not a promise")}</div>
    </div>
  );
}

export default function Delivery({ value: d, onChange, adSets, status }) {
  const set = (patch) => onChange({ ...d, ...patch });
  const currency = status?.currency || "";
  const days = runDays(d);
  const lifetime = d.budgetType === "lifetime";
  const total = lifetime ? Number(d.lifetimeBudget) || 0 : days ? days * (Number(d.dailyBudget) || 0) : null;

  const setDuration = (n) => {
    const start = d.startTime ? new Date(d.startTime) : new Date();
    set({ endTime: n ? toLocalInput(new Date(start.getTime() + n * 86400000)) : "" });
  };
  const ageKey = `${d.ageMin}-${d.ageMax}`;
  const selectedAdSet = adSets.find((s) => s.id === d.adSetId);

  return (
    <div className="space-y-7">
      <div className="grid sm:grid-cols-2 gap-3">
        <Choice selected={d.mode === "new"} onClick={() => set({ mode: "new" })} title="New campaign" hint="Set the goal, budget, dates and audience here." />
        <Choice
          selected={d.mode === "existing"}
          onClick={() => set({ mode: "existing" })}
          title="Add to an existing ad set"
          hint={adSets.length ? `${adSets.length} active or paused ad sets. Budget and audience stay as they are.` : "No active or paused ad sets found."}
          disabled={!adSets.length}
        />
      </div>

      {d.mode === "existing" ? (
        <Group title="Ad set">
          <Select
            size="lg"
            label="Ad set"
            placeholder="Choose the ad set…"
            value={d.adSetId}
            onChange={(v) => set({ adSetId: v })}
            options={adSets.map((s) => ({ value: s.id, label: dot(s.campaignName, s.name, s.status?.toLowerCase()) }))}
          />
          {selectedAdSet && (
            <div className="text-sm text-[#6b6b63]">{dot(`Campaign ${selectedAdSet.campaignName || "–"}`, selectedAdSet.status?.toLowerCase())}</div>
          )}
        </Group>
      ) : (
        <>
          <Group title="Goal">
            <div className="grid sm:grid-cols-3 gap-3">
              {GOALS.map((g) => (
                <Choice
                  key={g.value}
                  selected={d.goal === g.value}
                  onClick={() => set({ goal: g.value })}
                  title={g.label}
                  hint={g.value === "SALES" && !status?.pixelConfigured ? "Needs the Pixel on the server first." : g.hint}
                  disabled={g.value === "SALES" && !status?.pixelConfigured}
                />
              ))}
            </div>
          </Group>

          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-7">
              <Group
                title="Budget"
                aside={
                  <div className="flex gap-4">
                    <Quick active={!lifetime} onClick={() => set({ budgetType: "daily" })}>
                      Per day
                    </Quick>
                    <Quick active={lifetime} onClick={() => set({ budgetType: "lifetime", endTime: d.endTime || toLocalInput(Date.now() + 7 * 86400000) })}>
                      Total for the run
                    </Quick>
                  </div>
                }
              >
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative w-44">
                    <input
                      className={`${inputClass} !text-2xl font-display !py-2 pr-14`}
                      type="number"
                      min="1"
                      step="1"
                      value={lifetime ? d.lifetimeBudget : d.dailyBudget}
                      onChange={(e) => set(lifetime ? { lifetimeBudget: e.target.value } : { dailyBudget: e.target.value })}
                      aria-label={lifetime ? "Total budget" : "Daily budget"}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#6b6b63]">{currency}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {(lifetime ? BUDGET_PRESETS.map((n) => n * 7) : BUDGET_PRESETS).map((n) => (
                      <Quick key={n} active={Number(lifetime ? d.lifetimeBudget : d.dailyBudget) === n} onClick={() => set(lifetime ? { lifetimeBudget: n } : { dailyBudget: n })}>
                        {n} {currency}
                      </Quick>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-[#6b6b63]">
                  {lifetime
                    ? days
                      ? `About ${(total / days).toFixed(2)} ${currency} per day over ${days} days.`
                      : "Pick an end date for a total budget."
                    : total != null
                      ? `About ${Math.ceil(total)} ${currency} in total over ${days} days. Meta may spend up to 75% more on a good day, but evens it out over the week.`
                      : "Runs until you pause it. Meta may spend up to 75% more on a good day, but evens it out over the week."}
                </div>
              </Group>

              <Group
                title="Schedule"
                aside={
                  <div className="flex flex-wrap gap-x-4">
                    {DURATION_PRESETS.map((n) => (
                      <Quick key={n} active={days === n} onClick={() => setDuration(n)}>
                        {n} days
                      </Quick>
                    ))}
                    {!lifetime && (
                      <Quick active={!d.endTime} onClick={() => setDuration(0)}>
                        No end
                      </Quick>
                    )}
                  </div>
                }
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Start" hint="Empty = in 5 minutes">
                    <input className={inputClass} type="datetime-local" value={d.startTime} onChange={(e) => set({ startTime: e.target.value })} />
                  </Field>
                  <Field label="End" hint={lifetime ? "Needed for a total budget" : "Empty = runs until paused"}>
                    <input className={inputClass} type="datetime-local" value={d.endTime} min={d.startTime || undefined} onChange={(e) => set({ endTime: e.target.value })} />
                  </Field>
                </div>
              </Group>

              <Group title="Audience">
                <div className="grid sm:grid-cols-3 gap-5">
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wide text-[#6b6b63] mb-1.5">Countries</span>
                    <div className="space-y-1.5 text-sm">
                      {COUNTRIES.map((c) => (
                        <label key={c.code} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={d.countries.includes(c.code)}
                            onChange={(e) => set({ countries: e.target.checked ? [...d.countries, c.code] : d.countries.filter((x) => x !== c.code) })}
                          />
                          {c.label}
                        </label>
                      ))}
                    </div>
                    {!d.countries.length && <div className="text-sm text-red-700 mt-1">Pick at least one country.</div>}
                  </div>
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wide text-[#6b6b63] mb-1.5">Age</span>
                    <div className="flex items-center gap-2">
                      <input className={inputClass} type="number" min="18" max="65" value={d.ageMin} onChange={(e) => set({ ageMin: e.target.value })} aria-label="Minimum age" />
                      <span>–</span>
                      <input className={inputClass} type="number" min="18" max="65" value={d.ageMax} onChange={(e) => set({ ageMax: e.target.value })} aria-label="Maximum age" />
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                      {AGE_PRESETS.map(([a, b]) => (
                        <Quick key={`${a}-${b}`} active={ageKey === `${a}-${b}`} onClick={() => set({ ageMin: a, ageMax: b })}>
                          {b === 65 ? `${a}+` : `${a}–${b}`}
                        </Quick>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wide text-[#6b6b63] mb-1.5">Gender</span>
                    <div className="space-y-1.5 text-sm">
                      {GENDERS.map((g) => (
                        <label key={g.value} className="flex items-center gap-2">
                          <input type="radio" checked={d.gender === g.value} onChange={() => set({ gender: g.value })} />
                          {g.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </Group>

              <Group title="Placements">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PLACEMENTS.map((p) => (
                    <Choice key={p.value} selected={d.placements === p.value} onClick={() => set({ placements: p.value })} title={p.label} hint={p.hint} />
                  ))}
                </div>
              </Group>

              <Field label="Campaign name" hint="Defaults to the ad name">
                <input className={inputClass} value={d.campaignName} onChange={(e) => set({ campaignName: e.target.value })} />
              </Field>
            </div>

            <div className="lg:sticky lg:top-4 self-start space-y-3">
              <Estimate d={d} configured={!!status?.configured} currency={currency} />
              <div className="rounded-xl border border-[#e7e4da] bg-[#f6f5f1] p-4 text-sm space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-[#6b6b63]">Summary</div>
                <div className="font-display text-2xl leading-tight">
                  {lifetime ? `${d.lifetimeBudget || 0} ${currency} total` : `${d.dailyBudget || 0} ${currency} / day`}
                </div>
                <div>{dot(GOALS.find((g) => g.value === d.goal)?.label, days ? `${days} days` : "no end date")}</div>
                <div className="text-[#6b6b63]">
                  {dot(
                    d.countries.map((c) => COUNTRIES.find((x) => x.code === c)?.label || c).join(", ") || "no country",
                    `${d.ageMin}–${d.ageMax}`,
                    GENDERS.find((g) => g.value === d.gender)?.label,
                    PLACEMENTS.find((p) => p.value === d.placements)?.label,
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
