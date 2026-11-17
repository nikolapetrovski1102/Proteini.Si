import { useEffect, useMemo, useState } from "react";
import { FiGlobe } from "react-icons/fi";
import { api } from "../../services/api";
import {
  AdminPage,
  Button,
  Card,
  EmptyState,
  Loading,
  Notice,
  SearchInput,
  Segmented,
  inputClass,
} from "./AdminKit";
import { useToast } from "./adminFeedback";

const KIND_LABEL = { row: "row", column: "column header", cell: "text in a cell" };
const PAGE_SIZE = 60;

const usesLabel = (count) => `used ${count} time${count === 1 ? "" : "s"}`;

export default function AdminNutritionLabels() {
  const toast = useToast();
  const [labels, setLabels] = useState([]);
  const [edits, setEdits] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("missing");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setLabels(await api.getNutritionLabels());
      setEdits({});
    } catch (e) {
      setError(e.message || "Failed to load nutrition labels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const valueOf = (label, lang) => edits[label.mk]?.[lang] ?? label[lang] ?? "";
  const isMissing = (label) => !valueOf(label, "al").trim() || !valueOf(label, "en").trim();

  const missingCount = useMemo(
    () => labels.filter((l) => !(l.al || "").trim() || !(l.en || "").trim()).length,
    [labels],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return labels.filter((l) => {
      if (filter === "missing" && (l.al || "").trim() && (l.en || "").trim() && !edits[l.mk]) return false;
      if (!q) return true;
      return [l.mk, valueOf(l, "al"), valueOf(l, "en")].some((v) => v.toLowerCase().includes(q));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labels, query, filter, edits]);

  const changed = Object.keys(edits).filter((mk) => {
    const label = labels.find((l) => l.mk === mk);
    if (!label) return false;
    return (edits[mk].al ?? label.al ?? "") !== (label.al ?? "") || (edits[mk].en ?? label.en ?? "") !== (label.en ?? "");
  });

  const setValue = (mk, lang, value) =>
    setEdits((prev) => ({ ...prev, [mk]: { ...prev[mk], [lang]: value } }));

  const save = async () => {
    if (!changed.length) return;
    setSaving(true);
    try {
      const items = changed.map((mk) => {
        const label = labels.find((l) => l.mk === mk);
        return { mk, al: valueOf(label, "al").trim(), en: valueOf(label, "en").trim() };
      });
      await api.saveNutritionLabels(items);
      setLabels((prev) =>
        prev.map((l) => {
          const item = items.find((i) => i.mk === l.mk);
          return item ? { ...l, al: item.al || null, en: item.en || null } : l;
        }),
      );
      setEdits({});
      toast.success(`Saved ${items.length} label${items.length === 1 ? "" : "s"}`);
    } catch (e) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPage
      eyebrow="Shop"
      title="Nutrition labels"
      description="Albanian and English names for the words used in the product nutrition tables. One translation applies to every product that uses the same word. Words without a translation show in Macedonian."
      count={labels.length}
      actions={
        <Button onClick={save} disabled={!changed.length || saving}>
          {saving ? "Saving…" : changed.length ? `Save ${changed.length} change${changed.length === 1 ? "" : "s"}` : "Save"}
        </Button>
      }
    >
      {error && (
        <Notice tone="error" className="mb-4">
          {error}
        </Notice>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          value={filter}
          onChange={(v) => {
            setFilter(v);
            setLimit(PAGE_SIZE);
          }}
          options={[
            { value: "missing", label: "Missing a translation", count: missingCount },
            { value: "all", label: "All", count: labels.length },
          ]}
        />
        <SearchInput
          value={query}
          onChange={(v) => {
            setQuery(v);
            setLimit(PAGE_SIZE);
          }}
          placeholder="Search Macedonian, Albanian or English…"
          className="sm:w-80"
        />
      </div>

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FiGlobe}
          title={filter === "missing" && !query ? "Everything is translated" : "No labels found"}
          text={filter === "missing" && !query ? "Every word in the nutrition tables has an Albanian and English name." : "Try a different search."}
        />
      ) : (
        <Card bodyClassName="p-0">
          <ul className="divide-y divide-black/[0.05]">
            {filtered.slice(0, limit).map((label) => (
              <li key={label.mk} className="grid gap-3 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-gray-900">{label.mk}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {[KIND_LABEL[label.kind] || label.kind, usesLabel(label.count), isMissing(label) ? "missing a translation" : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <label className="block min-w-0">
                  <span className="mb-1 block text-xs font-semibold text-gray-500 lg:sr-only">Albanian</span>
                  <input
                    className={inputClass}
                    value={valueOf(label, "al")}
                    onChange={(e) => setValue(label.mk, "al", e.target.value)}
                    placeholder="Albanian"
                    maxLength={400}
                    lang="sq"
                  />
                </label>
                <label className="block min-w-0">
                  <span className="mb-1 block text-xs font-semibold text-gray-500 lg:sr-only">English</span>
                  <input
                    className={inputClass}
                    value={valueOf(label, "en")}
                    onChange={(e) => setValue(label.mk, "en", e.target.value)}
                    placeholder="English"
                    maxLength={400}
                    lang="en"
                  />
                </label>
              </li>
            ))}
          </ul>
          {filtered.length > limit && (
            <div className="border-t border-black/[0.05] p-4 text-center">
              <Button variant="secondary" onClick={() => setLimit((l) => l + PAGE_SIZE)}>
                Show more ({filtered.length - limit} left)
              </Button>
            </div>
          )}
        </Card>
      )}
    </AdminPage>
  );
}
