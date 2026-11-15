import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiClock, FiMail, FiRefreshCw, FiSave, FiSend } from "react-icons/fi";
import { api } from "../../services/api";
import {
  AdminPage,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  FormSection,
  Loading,
  Notice,
  Segmented,
  Toggle,
  inputClass,
  tableClass,
  tableWrapClass,
  tdClass,
  textareaClass,
  thClass,
  trClass,
} from "./AdminKit";
import { useConfirm, useToast } from "./adminFeedback";
import { formatDateTime } from "./adminUtils";

const EDITABLE = [
  "isActive",
  "sendTime",
  "delayValue",
  "subject",
  "preheader",
  "heading",
  "body",
  "buttonText",
  "buttonUrl",
  "couponCode",
  "couponText",
  "subjectAl",
  "preheaderAl",
  "headingAl",
  "bodyAl",
  "buttonTextAl",
  "couponTextAl",
];

const ALBANIAN_FIELDS = ["subjectAl", "preheaderAl", "headingAl", "bodyAl", "buttonTextAl", "couponTextAl"];

const LANGUAGES = [
  { value: "mk", label: "Македонски" },
  { value: "al", label: "Shqip" },
];

const TEMPLATE_INFO = {
  welcome: {
    label: "Welcome",
    when: "Sent to new accounts with marketing consent, once their account is at least the delay old (and at most 3 days).",
    delayLabel: "Wait after sign-up (hours)",
    delayMin: 0,
    delayMax: 48,
  },
  abandoned_checkout: {
    label: "Abandoned checkout",
    when: "Sent to people who reached checkout but did not order, at least the delay later (and at most 48 hours).",
    delayLabel: "Wait after leaving checkout (hours)",
    delayMin: 1,
    delayMax: 47,
  },
  replenishment: {
    label: "Reorder reminder",
    when: "Sent this many days before a delivered product runs out (one dose a day × quantity, counted from the order date).",
    delayLabel: "Days before it runs out",
    delayMin: 0,
    delayMax: 30,
  },
  new_discount: {
    label: "New discount",
    when: "Sent once to everyone with marketing consent when a discount from Discounts starts, with its products. Goes out at the next send time; people who already got a marketing email that day get it on a later day, within the delay. Text can use {popust} (discount name) and {procent} (biggest saving).",
    delayLabel: "Announce for (days after it starts)",
    delayMin: 1,
    delayMax: 14,
  },
};

const STATUS_TONE = { sent: "green", failed: "red", skipped: "neutral" };

const pickDraft = (template) => Object.fromEntries(EDITABLE.map((key) => [key, template?.[key] ?? ""]));

const toPayload = (draft, language) => ({
  ...draft,
  ...Object.fromEntries(ALBANIAN_FIELDS.map((key) => [key, draft[key] || null])),
  delayValue: Number(draft.delayValue) || 0,
  preheader: draft.preheader || null,
  buttonUrl: draft.buttonUrl || null,
  couponCode: draft.couponCode || null,
  couponText: draft.couponText || null,
  language: language || "mk",
});

export default function AdminMarketingEmails() {
  const toast = useToast();
  const confirm = useConfirm();
  const [templates, setTemplates] = useState([]);
  const [log, setLog] = useState(null);
  const [selected, setSelected] = useState("welcome");
  // Which language's text is being edited; the preview and test email follow it.
  const [lang, setLang] = useState("mk");
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [preview, setPreview] = useState({ subject: "", html: "", error: "", loading: false });
  const previewRequest = useRef(0);

  const load = useCallback(async () => {
    setError("");
    try {
      const [templateResponse, logResponse] = await Promise.all([
        api.getMarketingEmailTemplates(),
        api.getMarketingEmailLog(100),
      ]);
      setTemplates(templateResponse.data || []);
      setLog(logResponse.data || null);
    } catch (e) {
      setError(e.message || "Could not load the marketing emails.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const current = useMemo(() => templates.find((t) => t.code === selected), [templates, selected]);

  useEffect(() => {
    if (current) setDraft(pickDraft(current));
  }, [current]);

  const dirty = useMemo(
    () => current && draft && EDITABLE.some((key) => String(draft[key] ?? "") !== String(current[key] ?? "")),
    [current, draft]
  );

  // Live preview of the unsaved draft, debounced so typing doesn't spam the API.
  useEffect(() => {
    if (!draft || !selected) return undefined;
    const id = ++previewRequest.current;
    setPreview((p) => ({ ...p, loading: true }));
    const timer = setTimeout(async () => {
      try {
        const response = await api.previewMarketingEmailTemplate(selected, toPayload(draft, lang));
        if (id === previewRequest.current)
          setPreview({ subject: response.subject, html: response.html, error: "", loading: false });
      } catch (e) {
        if (id === previewRequest.current) setPreview((p) => ({ ...p, error: e.message, loading: false }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [draft, selected, lang]);

  const set = (key) => (value) => setDraft((d) => ({ ...d, [key]: value }));
  const setFromInput = (key) => (e) => set(key)(e.target.value);
  // Content field in the language being edited ("subject" → "subjectAl" for Albanian).
  const albanian = lang === "al";
  const k = (key) => (albanian ? `${key}Al` : key);
  // Albanian fields show the Macedonian text as a placeholder: empty = the Macedonian text is sent.
  const fallback = (key) => (albanian ? draft?.[key] || "" : undefined);
  const contentInput = (key) => ({
    value: draft?.[k(key)] ?? "",
    onChange: setFromInput(k(key)),
    placeholder: fallback(key),
  });
  const missingAlbanian = draft ? ALBANIAN_FIELDS.filter((key) => !draft[key]).length : 0;

  const selectTemplate = async (code) => {
    if (code === selected) return;
    if (
      dirty &&
      !(await confirm({ title: "Discard changes?", message: "You have unsaved changes to this email.", confirmLabel: "Discard", tone: "danger" }))
    )
      return;
    setSelected(code);
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await api.updateMarketingEmailTemplate(selected, toPayload(draft));
      setTemplates((list) => list.map((t) => (t.code === selected ? response.data : t)));
      toast.success(draft.isActive ? "Saved. This email is active." : "Saved. This email is switched off.");
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    setTesting(true);
    try {
      const response = await api.sendMarketingTestEmail(selected, toPayload(draft, lang));
      toast.success(response.message || "Test email sent to your address.");
    } catch (e) {
      toast.error(e.message || "Test email failed");
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <Loading label="Loading marketing emails…" />;

  const info = TEMPLATE_INFO[selected] || TEMPLATE_INFO.welcome;
  const labelFor = (code) => TEMPLATE_INFO[code]?.label || templates.find((t) => t.code === code)?.name || code;

  return (
    <AdminPage
      eyebrow="Shop"
      title="Marketing emails"
      description="Emails in Macedonian or Albanian (the customer's site language) for people who agreed to marketing (cookie banner, newsletter or checkout). Each one goes out every day at its send time (Skopje time), and nobody gets more than one marketing email in 20 hours."
      actions={
        <Button variant="secondary" icon={FiRefreshCw} onClick={load}>
          Refresh
        </Button>
      }
    >
      {error && (
        <Notice tone="error" className="mb-6">
          {error}
        </Notice>
      )}

      {log && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Consented contacts" value={log.consentedContacts} />
          <Stat label="Unsubscribed" value={log.unsubscribed} />
          <Stat
            label="Sending on this server"
            value={log.enabled ? "On" : "Off"}
            hint={
              log.enabled
                ? log.allowedRecipients > 0
                  ? `Only to ${log.allowedRecipients} allowed address(es)`
                  : "To all consented contacts"
                : "Marketing__Enabled is false"
            }
          />
          <Stat label="Server time" value={log.localTime?.slice(11) || "—"} hint={log.timeZone} />
        </div>
      )}

      {log && !log.enabled && (
        <Notice tone="warning" className="mb-6">
          Sending is off on this server, so active templates will not go out. You can still preview and send yourself a test.
        </Notice>
      )}

      <Segmented
        className="mb-5 flex-wrap"
        value={selected}
        onChange={selectTemplate}
        options={templates.map((t) => ({
          value: t.code,
          label: `${labelFor(t.code)}${t.isActive ? " ●" : ""}`,
        }))}
      />

      {current && draft && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,620px)]">
          <Card
            title={current.name}
            description={info.when}
            actions={
              <>
                <Badge tone={current.isActive ? "green" : "neutral"} dot>
                  {current.isActive ? "Active" : "Off"}
                </Badge>
                <Badge tone="neutral">{`${current.sentLast30Days} sent in 30 days`}</Badge>
              </>
            }
          >
            <div className="space-y-7">
              <FormSection title="Schedule">
                <Toggle
                  checked={draft.isActive}
                  onChange={set("isActive")}
                  label="Send this email automatically"
                  description="Off by default. Check the preview and a test email before switching it on."
                  className="-mx-3 mb-3"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Send time (Skopje)" hint="Between 08:00 and 20:00.">
                    <input
                      type="time"
                      min="08:00"
                      max="20:00"
                      step="900"
                      className={inputClass}
                      value={draft.sendTime}
                      onChange={setFromInput("sendTime")}
                    />
                  </Field>
                  <Field label={info.delayLabel} hint={`${info.delayMin} to ${info.delayMax}`}>
                    <input
                      type="number"
                      min={info.delayMin}
                      max={info.delayMax}
                      className={inputClass}
                      value={draft.delayValue}
                      onChange={setFromInput("delayValue")}
                    />
                  </Field>
                </div>
              </FormSection>

              <FormSection
                title="Content"
                description={
                  albanian
                    ? "Albanian text, sent to customers who use the site in Albanian. An empty field sends the Macedonian text (shown in grey). Same placeholders: {ime} (or “mik”), {proizvod}, {kod}."
                    : "Placeholders: {ime} = first name (or “пријателе”), {proizvod} = product name (reorder email), {kod} = coupon code."
                }
              >
                <Segmented className="mb-4" value={lang} onChange={setLang} options={LANGUAGES} />
                {albanian && missingAlbanian > 0 && (
                  <Notice tone="warning" className="mb-4">
                    {missingAlbanian} Albanian field(s) are empty, so those parts go out in Macedonian.
                  </Notice>
                )}
                <div className="space-y-4">
                  <Field label="Subject" required={!albanian}>
                    <input className={inputClass} maxLength={200} {...contentInput("subject")} />
                  </Field>
                  <Field label="Preheader" hint="The grey line shown after the subject in the inbox.">
                    <input className={inputClass} maxLength={300} {...contentInput("preheader")} />
                  </Field>
                  <Field label="Heading" required={!albanian}>
                    <input className={inputClass} maxLength={200} {...contentInput("heading")} />
                  </Field>
                  <Field label="Text" hint="An empty line starts a new paragraph." required={!albanian}>
                    <textarea className={`${textareaClass} min-h-[180px]`} {...contentInput("body")} />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Button text" required={!albanian}>
                      <input className={inputClass} maxLength={60} {...contentInput("buttonText")} />
                    </Field>
                    <Field
                      label="Button link"
                      hint={selected === "replenishment" ? "Empty = the product's page." : "Starts with / or https://"}
                    >
                      <input className={inputClass} maxLength={300} value={draft.buttonUrl} onChange={setFromInput("buttonUrl")} />
                    </Field>
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="Coupon (optional)"
                description="Create the code under Promotions first. Leave the code empty to send the email without a coupon."
              >
                <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
                  <Field label="Code">
                    <input
                      className={`${inputClass} uppercase`}
                      maxLength={50}
                      value={draft.couponCode}
                      onChange={(e) => set("couponCode")(e.target.value.toUpperCase())}
                    />
                  </Field>
                  <Field label={albanian ? "Coupon text (Albanian)" : "Coupon text"}>
                    <input className={inputClass} maxLength={300} {...contentInput("couponText")} />
                  </Field>
                </div>
              </FormSection>

              <div className="flex flex-wrap items-center gap-3 border-t border-black/[0.06] pt-5">
                <Button icon={FiSave} loading={saving} disabled={!dirty} onClick={save}>
                  Save
                </Button>
                <Button variant="secondary" icon={FiSend} loading={testing} onClick={sendTest}>
                  Send me a test
                </Button>
                {dirty && (
                  <Button variant="ghost" onClick={() => setDraft(pickDraft(current))}>
                    Discard changes
                  </Button>
                )}
                <span className="text-xs text-gray-500">
                  Last saved {formatDateTime(current.updatedAt)}
                  {current.updatedBy ? ` by ${current.updatedBy}` : ""}
                </span>
              </div>
            </div>
          </Card>

          <Card
            title="Preview"
            description={
              preview.subject
                ? `${albanian ? "Albanian" : "Macedonian"} · Subject: ${preview.subject}`
                : "Sample customer and real products on sale."
            }
            actions={preview.loading ? <Badge tone="neutral">Updating…</Badge> : null}
            bodyClassName="p-0"
            className="xl:sticky xl:top-6 xl:self-start"
          >
            {preview.error && (
              <Notice tone="error" className="m-4">
                {preview.error}
              </Notice>
            )}
            {preview.html ? (
              <iframe
                title="Email preview"
                srcDoc={preview.html}
                sandbox="allow-popups"
                className="block h-[780px] w-full rounded-b-2xl bg-[#f6f5f1]"
              />
            ) : (
              !preview.error && <Loading label="Rendering…" className="py-20" />
            )}
          </Card>
        </div>
      )}

      <Card title="Recent sends" description="Latest 100 marketing emails." className="mt-6" bodyClassName="p-0">
        {log?.entries?.length ? (
          <div className={tableWrapClass}>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>When</th>
                  <th className={thClass}>Email</th>
                  <th className={thClass}>To</th>
                  <th className={thClass}>Status</th>
                </tr>
              </thead>
              <tbody>
                {log.entries.map((entry) => (
                  <tr key={entry.id} className={trClass}>
                    <td className={`${tdClass} whitespace-nowrap`}>{formatDateTime(entry.sentAt)}</td>
                    <td className={tdClass}>{labelFor(entry.templateCode)}</td>
                    <td className={tdClass}>{entry.email}</td>
                    <td className={tdClass}>
                      <Badge tone={STATUS_TONE[entry.status] || "neutral"}>{entry.status}</Badge>
                      {entry.error && <span className="ml-2 text-xs text-gray-500">{entry.error}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={FiMail} title="Nothing sent yet" text="Sends appear here once an active template goes out." />
        )}
      </Card>
    </AdminPage>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="rounded-2xl bg-white px-5 py-4 ring-1 ring-black/[0.06]">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
        {label === "Server time" && <FiClock aria-hidden="true" />}
        {label}
      </p>
      <p className="mt-1 text-2xl font-black tracking-tight text-gray-900">{value ?? "—"}</p>
      {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
