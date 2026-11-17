import { COUNTRIES, GOALS } from "./deliveryOptions";
import { Field } from "./ui";
import { inputClass } from "./format";


export default function Delivery({ value: d, onChange, adSets, status }) {
  const set = (patch) => onChange({ ...d, ...patch });
  const currency = status?.currency || "";
  const days = d.startTime && d.endTime ? Math.max(0, Math.ceil((new Date(d.endTime) - new Date(d.startTime)) / 86400000)) : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-1.5">
          <input type="radio" checked={d.mode === "new"} onChange={() => set({ mode: "new" })} />
          New campaign
        </label>
        <label className="flex items-center gap-1.5">
          <input type="radio" checked={d.mode === "existing"} onChange={() => set({ mode: "existing" })} />
          Add to an existing ad set
        </label>
      </div>

      {d.mode === "existing" ? (
        <Field label="Ad set" hint={adSets.length ? "Budget and audience come from the ad set" : "No active or paused ad sets found"}>
          <select className={inputClass} value={d.adSetId} onChange={(e) => set({ adSetId: e.target.value })}>
            <option value="">Choose…</option>
            {adSets.map((s) => (
              <option key={s.id} value={s.id}>
                {[s.campaignName, s.name, s.status?.toLowerCase()].filter(Boolean).join(" · ")}
              </option>
            ))}
          </select>
        </Field>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-3">
            {GOALS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => set({ goal: g.value })}
                className={`rounded-xl border p-3 text-left text-sm ${
                  d.goal === g.value ? "border-[#141409] ring-2 ring-[#FDC700]" : "border-[#e7e4da] hover:border-[#141409]"
                }`}
              >
                <div className="font-semibold">{g.label}</div>
                <div className="text-xs text-[#6b6b63]">{g.hint}</div>
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field
              label={`Daily budget${currency ? ` (${currency})` : ""}`}
              hint={days ? `About ${Math.ceil(days * (Number(d.dailyBudget) || 0))} ${currency} over ${days} days` : "Meta may spend up to 75% more on a good day"}
            >
              <input className={inputClass} type="number" min="1" step="1" value={d.dailyBudget} onChange={(e) => set({ dailyBudget: e.target.value })} />
            </Field>
            <Field label="Start" hint="Empty = in 5 minutes">
              <input className={inputClass} type="datetime-local" value={d.startTime} onChange={(e) => set({ startTime: e.target.value })} />
            </Field>
            <Field label="End" hint="Empty = runs until paused">
              <input className={inputClass} type="datetime-local" value={d.endTime} min={d.startTime || undefined} onChange={(e) => set({ endTime: e.target.value })} />
            </Field>
            <Field label="Campaign name" hint="Defaults to the ad name">
              <input className={inputClass} value={d.campaignName} onChange={(e) => set({ campaignName: e.target.value })} />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wide text-[#6b6b63] mb-1.5">Countries</span>
              <div className="space-y-1 text-sm">
                {COUNTRIES.map((c) => (
                  <label key={c.code} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={d.countries.includes(c.code)}
                      onChange={(e) =>
                        set({
                          countries: e.target.checked ? [...d.countries, c.code] : d.countries.filter((x) => x !== c.code),
                        })
                      }
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>
            <Field label="Age">
              <div className="flex items-center gap-2">
                <input className={inputClass} type="number" min="18" max="65" value={d.ageMin} onChange={(e) => set({ ageMin: e.target.value })} />
                <span>to</span>
                <input className={inputClass} type="number" min="18" max="65" value={d.ageMax} onChange={(e) => set({ ageMax: e.target.value })} />
              </div>
            </Field>
            <Field label="Where" hint="Automatic usually gets the cheapest results">
              <select className={inputClass} value={d.placements} onChange={(e) => set({ placements: e.target.value })}>
                <option value="auto">Automatic (Facebook + Instagram)</option>
                <option value="facebook">Facebook only</option>
                <option value="instagram">Instagram only</option>
              </select>
            </Field>
          </div>
          {!d.countries.length && <div className="text-sm text-red-700">Pick at least one country.</div>}
        </>
      )}
    </div>
  );
}
