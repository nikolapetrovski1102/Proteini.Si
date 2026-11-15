import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiCopy,
  FiDownload,
  FiEdit2,
  FiExternalLink,
  FiLink,
  FiPlus,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import { api } from "../../services/api";
import PromoScopeFields, { ScopeBadge } from "./PromoScopeFields";
import { emptyScope, scopeError, scopePayload } from "./promoScope";
import {
  AdminPage,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  FormSection,
  IconButton,
  Loading,
  Modal,
  Notice,
  Segmented,
  Toggle,
  VisibilityBadge,
  inputClass,
  selectClass,
  tableClass,
  tableWrapClass,
  tdClass,
  textareaClass,
  thClass,
  trClass,
} from "./AdminKit";
import { useConfirm, useToast } from "./adminFeedback";
import { formatDate, formatDateTime, formatMoney } from "./adminUtils";

/* ------------------------------------------------------------------ helpers */

const CYRILLIC = {
  а: "a", б: "b", в: "v", г: "g", д: "d", ѓ: "gj", е: "e", ж: "zh", з: "z", ѕ: "dz", и: "i",
  ј: "j", к: "k", л: "l", љ: "lj", м: "m", н: "n", њ: "nj", о: "o", п: "p", р: "r", с: "s",
  т: "t", ќ: "kj", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", џ: "dzh", ш: "sh",
  ё: "e", й: "j", ы: "y", э: "e", ю: "ju", я: "ja", ь: "", ъ: "", щ: "sht",
};

const latin = (text) =>
  String(text || "")
    .toLowerCase()
    .split("")
    .map((ch) => CYRILLIC[ch] ?? ch)
    .join("")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** First word of the name + the discount: "Марко Петров", 10 → "MARKO10". */
const suggestCode = (name, discount) => {
  const word = latin(name).replace(/^@/, "").split(/[^a-z0-9]+/).find(Boolean) || "";
  const number = Number(discount) > 0 ? String(Math.round(Number(discount))) : "";
  return `${word.slice(0, 20)}${number}`.toUpperCase();
};

/** "Марко Петров" → "marko-petrov" */
const suggestSlug = (text) =>
  latin(text)
    .replace(/^@/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const randomSlug = () => {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 6; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};

const shortUrl = (slug) => `${window.location.origin}/r/${slug}`;
const codeUrl = (code) => `${window.location.origin}/?code=${encodeURIComponent(code)}`;

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

const isoDate = (date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const periodRange = (period, custom) => {
  const today = new Date();
  if (period === "month") return { from: isoDate(new Date(today.getFullYear(), today.getMonth(), 1)), to: isoDate(today) };
  if (period === "30d") return { from: isoDate(new Date(today.getTime() - 29 * 86400000)), to: isoDate(today) };
  if (period === "custom") return { from: custom.from || "", to: custom.to || "" };
  return { from: "", to: "" };
};

const numberOrNull = (value) => (value === "" || value === null || value === undefined ? null : Number(value));
const discountLabel = (type, value) =>
  type === "percentage" ? `${Number(value)}%` : formatMoney(value);

const emptyQuick = {
  name: "",
  handle: "",
  email: "",
  phone: "",
  commissionPercent: 10,
  notes: "",
  code: "",
  discountType: "percentage",
  discountValue: 10,
  minimumOrderAmount: 0,
  perCustomerLimit: "",
  validUntil: "",
  slug: "",
  targetPath: "/",
  isActive: true,
  ...emptyScope,
};

const emptyLink = { slug: "", targetPath: "/", promoCodeId: "", affiliateId: "", label: "", isActive: true };
const emptyCode = { code: "", discountType: "percentage", discountValue: 10, minimumOrderAmount: 0, perCustomerLimit: "", validUntil: "", ...emptyScope };

function CopyButton({ text, label = "Copy link" }) {
  const toast = useToast();
  return (
    <IconButton
      icon={FiCopy}
      label={label}
      onClick={async (e) => {
        e.stopPropagation();
        if (await copyText(text)) toast.success("Copied");
      }}
    />
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white px-5 py-4 ring-1 ring-black/[0.06]">
      <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">{value}</p>
    </div>
  );
}

/* --------------------------------------------------------------------- page */

export default function AdminAffiliates() {
  const toast = useToast();
  const confirm = useConfirm();

  const [tab, setTab] = useState("affiliates");
  const [period, setPeriod] = useState("month");
  const [custom, setCustom] = useState({ from: "", to: "" });
  const range = useMemo(() => periodRange(period, custom), [period, custom]);

  const [affiliates, setAffiliates] = useState([]);
  const [links, setLinks] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quickOpen, setQuickOpen] = useState(false);
  const [quick, setQuick] = useState(emptyQuick);
  const [quickTouched, setQuickTouched] = useState({ code: false, slug: false });
  const [savingQuick, setSavingQuick] = useState(false);

  const [linkForm, setLinkForm] = useState(null); // { id, values }
  const [savingLink, setSavingLink] = useState(false);

  const [detailsId, setDetailsId] = useState(null);

  // Products and categories for the code "Applies to" picker; loaded once, the page works without them.
  const [catalog, setCatalog] = useState({ products: [], categories: [] });
  useEffect(() => {
    Promise.allSettled([api.getProducts(), api.getAdminCategories()]).then(([productRows, categoryRows]) =>
      setCatalog({
        products: productRows.status === "fulfilled" ? productRows.value || [] : [],
        categories: categoryRows.status === "fulfilled" ? categoryRows.value || [] : [],
      }),
    );
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [affiliateRows, linkRows, codeRows] = await Promise.all([
        api.getAdminAffiliates(range.from, range.to),
        api.getAdminShortLinks(range.from, range.to),
        api.getAdminPromotionCodes(),
      ]);
      setAffiliates(affiliateRows || []);
      setLinks(linkRows || []);
      setPromoCodes(codeRows || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [range.from, range.to]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(
    () =>
      affiliates.reduce(
        (sum, a) => ({
          clicks: sum.clicks + (a.clicks || 0),
          orders: sum.orders + (a.orders || 0),
          sales: sum.sales + Number(a.netSales || 0),
          commission: sum.commission + Number(a.commission || 0),
        }),
        { clicks: 0, orders: 0, sales: 0, commission: 0 },
      ),
    [affiliates],
  );

  /* ---- quick create ---- */

  const setQuickField = (field, value) => {
    setQuick((current) => {
      const next = { ...current, [field]: value };
      if (!quickTouched.code && (field === "name" || field === "discountValue" || field === "discountType")) {
        next.code = suggestCode(next.name, next.discountType === "percentage" ? next.discountValue : "");
      }
      if (!quickTouched.slug && field === "name") next.slug = suggestSlug(next.name);
      return next;
    });
    if (field === "code" || field === "slug") setQuickTouched((t) => ({ ...t, [field]: true }));
  };

  const openQuick = () => {
    setQuick(emptyQuick);
    setQuickTouched({ code: false, slug: false });
    setQuickOpen(true);
  };

  const saveQuick = async (e) => {
    e?.preventDefault();
    const scopeProblem = scopeError(quick);
    if (scopeProblem) {
      toast.error(scopeProblem);
      return;
    }
    setSavingQuick(true);
    try {
      await api.quickCreateAffiliate({
        ...quick,
        commissionPercent: Number(quick.commissionPercent || 0),
        discountValue: Number(quick.discountValue || 0),
        minimumOrderAmount: Number(quick.minimumOrderAmount || 0),
        perCustomerLimit: numberOrNull(quick.perCustomerLimit),
        validUntil: quick.validUntil || null,
        ...scopePayload(quick),
      });
      const url = shortUrl(quick.slug.toLowerCase());
      const copied = await copyText(url);
      toast.success(copied ? `Created. Link copied: ${url}` : `Created: ${url}`);
      setQuickOpen(false);
      load();
    } catch (saveError) {
      toast.error(saveError.message);
    } finally {
      setSavingQuick(false);
    }
  };

  /* ---- short links ---- */

  const openLink = (link = null, preset = {}) =>
    setLinkForm({
      id: link?.shortLinkId || null,
      values: link
        ? {
            slug: link.slug,
            targetPath: link.targetPath || "/",
            promoCodeId: link.promoCodeId ?? "",
            affiliateId: link.affiliateId ?? "",
            label: link.label || "",
            isActive: link.isActive,
          }
        : { ...emptyLink, slug: randomSlug(), ...preset },
    });

  const saveLink = async (e) => {
    e?.preventDefault();
    if (!linkForm) return;
    setSavingLink(true);
    try {
      const v = linkForm.values;
      await api.saveAdminShortLink(
        {
          slug: v.slug,
          targetPath: v.targetPath,
          promoCodeId: numberOrNull(v.promoCodeId),
          affiliateId: numberOrNull(v.affiliateId),
          label: v.label || null,
          isActive: v.isActive,
        },
        linkForm.id,
      );
      if (!linkForm.id) await copyText(shortUrl(v.slug.toLowerCase()));
      toast.success(linkForm.id ? "Link saved" : "Link created and copied");
      setLinkForm(null);
      load();
    } catch (saveError) {
      toast.error(saveError.message);
    } finally {
      setSavingLink(false);
    }
  };

  const deleteLink = async (link) => {
    const ok = await confirm({
      title: "Delete short link?",
      message: `${shortUrl(link.slug)} will stop working. Orders already made with its code stay counted.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await api.deleteAdminShortLink(link.shortLinkId);
      toast.success("Link deleted");
      load();
    } catch (deleteError) {
      toast.error(deleteError.message);
    }
  };

  const exportCsv = async () => {
    try {
      await api.downloadAffiliateReport(range.from, range.to);
    } catch (exportError) {
      toast.error(exportError.message);
    }
  };

  const setLinkValue = (field, value) =>
    setLinkForm((current) => {
      const values = { ...current.values, [field]: value };
      // Picking a code that belongs to an affiliate fills the affiliate too.
      if (field === "promoCodeId" && value && !current.values.affiliateId) {
        const owner = promoCodes.find((c) => String(c.promoCodeId) === String(value))?.affiliateId;
        if (owner) values.affiliateId = owner;
      }
      return { ...current, values };
    });

  /* ---- render ---- */

  return (
    <AdminPage
      eyebrow="Shop"
      title="Affiliates & links"
      description="Give influencers and partners their own discount code and a short link. Opening the link remembers the code for 30 days and applies it at checkout automatically. Sales and commission are counted from orders that used their codes."
      actions={
        <>
          <Button variant="secondary" icon={FiDownload} onClick={exportCsv}>
            Export CSV
          </Button>
          {tab === "links" ? (
            <Button icon={FiPlus} onClick={() => openLink()}>
              New short link
            </Button>
          ) : (
            <Button icon={FiPlus} onClick={openQuick}>
              New affiliate
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-wrap items-end gap-3">
        <Segmented
          value={period}
          onChange={setPeriod}
          options={[
            { value: "month", label: "This month" },
            { value: "30d", label: "Last 30 days" },
            { value: "all", label: "All time" },
            { value: "custom", label: "Custom" },
          ]}
        />
        {period === "custom" && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              aria-label="From"
              className={`${inputClass} w-auto`}
              value={custom.from}
              onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))}
            />
            <span className="text-sm text-gray-500">to</span>
            <input
              type="date"
              aria-label="To"
              className={`${inputClass} w-auto`}
              value={custom.to}
              onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Link clicks" value={totals.clicks.toLocaleString("mk-MK")} />
        <Stat label="Orders with codes" value={totals.orders.toLocaleString("mk-MK")} />
        <Stat label="Sales (after discount)" value={formatMoney(totals.sales)} />
        <Stat label="Commission" value={formatMoney(totals.commission)} />
      </div>

      {error && <Notice tone="error">{error}</Notice>}

      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: "affiliates", label: "Affiliates", count: affiliates.length },
          { value: "links", label: "Short links", count: links.length },
        ]}
      />

      {loading ? (
        <Loading />
      ) : tab === "affiliates" ? (
        <Card bodyClassName="p-0">
          {affiliates.length === 0 ? (
            <EmptyState
              icon={FiUsers}
              title="No affiliates yet"
              text="Create one to get a ready code (e.g. MARKO10) and a short link to send them."
              action={<Button icon={FiPlus} onClick={openQuick}>New affiliate</Button>}
            />
          ) : (
            <div className={tableWrapClass}>
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>Affiliate</th>
                    <th className={thClass}>Code</th>
                    <th className={thClass}>Link</th>
                    <th className={`${thClass} text-right`}>Clicks</th>
                    <th className={`${thClass} text-right`}>Orders</th>
                    <th className={`${thClass} text-right`}>Sales</th>
                    <th className={`${thClass} text-right`}>Commission</th>
                    <th className={thClass}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliates.map((a) => (
                    <tr key={a.affiliateId} className={`${trClass} cursor-pointer`} onClick={() => setDetailsId(a.affiliateId)}>
                      <td className={tdClass}>
                        <p className="font-semibold text-gray-900">{a.name}</p>
                        <p className="text-xs text-gray-500">
                          {[a.handle, `${Number(a.commissionPercent)}% commission`].filter(Boolean).join(" · ")}
                        </p>
                      </td>
                      <td className={tdClass}>
                        {a.activeCodes ? (
                          <span className="font-mono text-[13px] font-semibold">{a.activeCodes}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className={tdClass}>
                        {a.primarySlug ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="font-mono text-[13px] text-gray-600">/r/{a.primarySlug}</span>
                            <CopyButton text={shortUrl(a.primarySlug)} />
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className={`${tdClass} text-right tabular-nums`}>{a.clicks}</td>
                      <td className={`${tdClass} text-right tabular-nums`}>{a.orders}</td>
                      <td className={`${tdClass} text-right tabular-nums`}>{formatMoney(a.netSales)}</td>
                      <td className={`${tdClass} text-right font-semibold tabular-nums`}>{formatMoney(a.commission)}</td>
                      <td className={tdClass}>
                        <VisibilityBadge active={a.isActive} on="Active" off="Off" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        <Card bodyClassName="p-0">
          {links.length === 0 ? (
            <EmptyState
              icon={FiLink}
              title="No short links yet"
              text="Short links open any page of the shop and can carry a discount code that is applied at checkout."
              action={<Button icon={FiPlus} onClick={() => openLink()}>New short link</Button>}
            />
          ) : (
            <LinksTable links={links} onEdit={openLink} onDelete={deleteLink} showAffiliate />
          )}
        </Card>
      )}

      {/* ---------------------------------------------------- quick create */}
      <Modal
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
        title="New affiliate"
        description="Creates the person, their discount code and their short link in one step."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setQuickOpen(false)}>Cancel</Button>
            <Button type="submit" form="affiliate-quick" loading={savingQuick}>Create & copy link</Button>
          </>
        }
      >
        <form id="affiliate-quick" onSubmit={saveQuick} className="space-y-7">
          <FormSection title="Person">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" required>
                <input className={inputClass} value={quick.name} onChange={(e) => setQuickField("name", e.target.value)} required maxLength={150} />
              </Field>
              <Field label="Instagram / TikTok handle">
                <input className={inputClass} value={quick.handle} placeholder="@handle" onChange={(e) => setQuickField("handle", e.target.value)} maxLength={150} />
              </Field>
              <Field label="Email">
                <input type="email" className={inputClass} value={quick.email} onChange={(e) => setQuickField("email", e.target.value)} maxLength={320} />
              </Field>
              <Field label="Phone">
                <input className={inputClass} value={quick.phone} onChange={(e) => setQuickField("phone", e.target.value)} maxLength={50} />
              </Field>
              <Field label="Commission %" hint="Of sales after the code discount, delivery excluded.">
                <input type="number" min="0" max="100" step="0.5" className={inputClass} value={quick.commissionPercent} onChange={(e) => setQuickField("commissionPercent", e.target.value)} />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Discount code" description="What the customer gets. The code is suggested from the name; you can change it.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Code" required>
                <input className={`${inputClass} font-mono uppercase`} value={quick.code} onChange={(e) => setQuickField("code", e.target.value.toUpperCase())} required maxLength={50} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Type">
                  <select className={selectClass} value={quick.discountType} onChange={(e) => setQuickField("discountType", e.target.value)}>
                    <option value="percentage">% off</option>
                    <option value="fixed">Fixed (ден.)</option>
                  </select>
                </Field>
                <Field label="Value">
                  <input type="number" min="0" step="0.01" className={inputClass} value={quick.discountValue} onChange={(e) => setQuickField("discountValue", e.target.value)} />
                </Field>
              </div>
              <Field label="Minimum order (ден.)">
                <input type="number" min="0" className={inputClass} value={quick.minimumOrderAmount} onChange={(e) => setQuickField("minimumOrderAmount", e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Uses per customer" hint="Empty = unlimited">
                  <input type="number" min="1" className={inputClass} value={quick.perCustomerLimit} onChange={(e) => setQuickField("perCustomerLimit", e.target.value)} />
                </Field>
                <Field label="Valid until" hint="Empty = no end">
                  <input type="date" className={inputClass} value={quick.validUntil} onChange={(e) => setQuickField("validUntil", e.target.value)} />
                </Field>
              </div>
            </div>
          </FormSection>

          <FormSection title="Applies to" description="Which products the code discounts. The minimum order still counts the whole cart.">
            <PromoScopeFields
              value={quick}
              onChange={(scope) => setQuick((current) => ({ ...current, ...scope }))}
              products={catalog.products}
              categories={catalog.categories}
            />
          </FormSection>

          <FormSection title="Short link" description="Send this link to the affiliate. It opens the page below with the code already saved for checkout.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Link" required hint={quick.slug ? shortUrl(quick.slug.toLowerCase()) : "Letters, numbers and dashes."}>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-sm text-gray-500">/r/</span>
                  <input className={`${inputClass} font-mono lowercase`} value={quick.slug} onChange={(e) => setQuickField("slug", e.target.value.toLowerCase())} required maxLength={60} pattern="[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]" />
                </div>
              </Field>
              <Field label="Opens page" hint="A shop path such as / or /product/123, or a full proteini.mk address.">
                <input className={inputClass} value={quick.targetPath} onChange={(e) => setQuickField("targetPath", e.target.value)} maxLength={500} />
              </Field>
            </div>
          </FormSection>

          <Field label="Notes (only admins see this)">
            <textarea className={textareaClass} value={quick.notes} onChange={(e) => setQuickField("notes", e.target.value)} maxLength={1000} />
          </Field>
        </form>
      </Modal>

      {detailsId && (
        <AffiliateDetailsModal
          id={detailsId}
          range={range}
          onClose={() => setDetailsId(null)}
          onChanged={load}
          onNewLink={(preset) => openLink(null, preset)}
          onEditLink={openLink}
          onDeleteLink={deleteLink}
          linksVersion={links}
          catalog={catalog}
        />
      )}

      {/* ------------------------------------------------------- link form */}
      <Modal
        open={Boolean(linkForm)}
        onClose={() => setLinkForm(null)}
        title={linkForm?.id ? "Edit short link" : "New short link"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setLinkForm(null)}>Cancel</Button>
            <Button type="submit" form="short-link-form" loading={savingLink}>{linkForm?.id ? "Save" : "Create & copy"}</Button>
          </>
        }
      >
        {linkForm && (
          <form id="short-link-form" onSubmit={saveLink} className="space-y-4">
            <Field label="Link" required hint={shortUrl((linkForm.values.slug || "…").toLowerCase())}>
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-sm text-gray-500">/r/</span>
                <input className={`${inputClass} font-mono lowercase`} value={linkForm.values.slug} onChange={(e) => setLinkValue("slug", e.target.value.toLowerCase())} required maxLength={60} />
                <Button variant="secondary" size="sm" onClick={() => setLinkValue("slug", randomSlug())}>Random</Button>
              </div>
            </Field>
            <Field label="Opens page" hint="A shop path such as / or /product/123, or a full proteini.mk address.">
              <input className={inputClass} value={linkForm.values.targetPath} onChange={(e) => setLinkValue("targetPath", e.target.value)} maxLength={500} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Discount code" hint="Saved for checkout when the link is opened.">
                <select className={selectClass} value={linkForm.values.promoCodeId} onChange={(e) => setLinkValue("promoCodeId", e.target.value)}>
                  <option value="">No code</option>
                  {promoCodes.map((c) => (
                    <option key={c.promoCodeId} value={c.promoCodeId}>
                      {c.code}
                      {c.affiliateName ? ` (${c.affiliateName})` : ""}
                      {c.isActive ? "" : " – off"}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Affiliate" hint="Clicks are shown under this person.">
                <select className={selectClass} value={linkForm.values.affiliateId} onChange={(e) => setLinkValue("affiliateId", e.target.value)}>
                  <option value="">None</option>
                  {affiliates.map((a) => (
                    <option key={a.affiliateId} value={a.affiliateId}>{a.name}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Label" hint="For you, e.g. “Instagram story, March”.">
              <input className={inputClass} value={linkForm.values.label} onChange={(e) => setLinkValue("label", e.target.value)} maxLength={150} />
            </Field>
            <Toggle checked={linkForm.values.isActive} onChange={(v) => setLinkValue("isActive", v)} label="Link works" description="When off, the link opens the homepage without a code." />
          </form>
        )}
      </Modal>

    </AdminPage>
  );
}

/* ------------------------------------------------------------- links table */

function LinksTable({ links, onEdit, onDelete, showAffiliate = false }) {
  return (
    <div className={tableWrapClass}>
      <table className={tableClass}>
        <thead>
          <tr>
            <th className={thClass}>Link</th>
            <th className={thClass}>Opens</th>
            <th className={thClass}>Code</th>
            {showAffiliate && <th className={thClass}>Affiliate</th>}
            <th className={`${thClass} text-right`}>Clicks</th>
            <th className={`${thClass} text-right`}>All-time</th>
            <th className={thClass}>Status</th>
            <th className={thClass} aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {links.map((l) => (
            <tr key={l.shortLinkId} className={trClass}>
              <td className={tdClass}>
                <p className="font-mono text-[13px] font-semibold text-gray-900">/r/{l.slug}</p>
                {l.label && <p className="text-xs text-gray-500">{l.label}</p>}
              </td>
              <td className={`${tdClass} max-w-[220px] truncate font-mono text-[12px] text-gray-600`} title={l.targetPath}>
                {l.targetPath}
              </td>
              <td className={tdClass}>
                {l.code ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="font-mono text-[13px] font-semibold">{l.code}</span>
                    {l.codeIsActive === false && <Badge tone="red">off</Badge>}
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              {showAffiliate && <td className={tdClass}>{l.affiliateName || <span className="text-gray-400">—</span>}</td>}
              <td className={`${tdClass} text-right tabular-nums`}>{l.periodClicks}</td>
              <td className={`${tdClass} text-right tabular-nums text-gray-500`}>{l.totalClicks}</td>
              <td className={tdClass}>
                <VisibilityBadge active={l.isActive} on="Works" off="Off" />
              </td>
              <td className={`${tdClass} whitespace-nowrap text-right`}>
                <CopyButton text={shortUrl(l.slug)} />
                <IconButton
                  icon={FiExternalLink}
                  label="Open the page it leads to (no click counted)"
                  onClick={() => window.open(l.targetPath, "_blank", "noopener")}
                />
                <IconButton icon={FiEdit2} label="Edit" onClick={() => onEdit(l)} />
                <IconButton icon={FiTrash2} label="Delete" tone="danger" onClick={() => onDelete(l)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------------------------------------------------- details modal */

function AffiliateDetailsModal({ id, range, onClose, onChanged, onNewLink, onEditLink, onDeleteLink, linksVersion, catalog }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [details, setDetails] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [codeForm, setCodeForm] = useState(null);
  const [savingCode, setSavingCode] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await api.getAdminAffiliate(id, range.from, range.to);
      setDetails(data);
      const a = data.affiliate;
      setForm({
        name: a.name,
        handle: a.handle || "",
        email: a.email || "",
        phone: a.phone || "",
        commissionPercent: a.commissionPercent,
        notes: a.notes || "",
        isActive: a.isActive,
      });
    } catch (loadError) {
      setError(loadError.message);
    }
  }, [id, range.from, range.to]);

  // Reload when the parent list changes (a link was added/edited/deleted from here).
  useEffect(() => {
    load();
  }, [load, linksVersion]);

  const save = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      await api.saveAdminAffiliate({ ...form, commissionPercent: Number(form.commissionPercent || 0) }, id);
      toast.success("Saved");
      onChanged();
    } catch (saveError) {
      toast.error(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const ok = await confirm({
      title: `Delete ${details.affiliate.name}?`,
      message:
        "If any order used their codes, the affiliate is archived instead: codes and links are switched off and the sales history is kept.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      const result = await api.deleteAdminAffiliate(id);
      toast.success(result.message || "Deleted");
      onChanged();
      onClose();
    } catch (deleteError) {
      toast.error(deleteError.message);
    }
  };

  const addCode = async (e) => {
    e?.preventDefault();
    const scopeProblem = scopeError(codeForm);
    if (scopeProblem) {
      toast.error(scopeProblem);
      return;
    }
    setSavingCode(true);
    try {
      await api.addAffiliateCode(id, {
        code: codeForm.code,
        description: `Affiliate: ${details.affiliate.name}`,
        discountType: codeForm.discountType,
        discountValue: Number(codeForm.discountValue || 0),
        minimumOrderAmount: Number(codeForm.minimumOrderAmount || 0),
        perCustomerLimit: numberOrNull(codeForm.perCustomerLimit),
        validUntil: codeForm.validUntil || null,
        isActive: true,
        ...scopePayload(codeForm),
      });
      toast.success("Code added");
      setCodeForm(null);
      load();
      onChanged();
    } catch (saveError) {
      toast.error(saveError.message);
    } finally {
      setSavingCode(false);
    }
  };

  const a = details?.affiliate;
  const commissionable = details?.orders?.filter((o) => o.isCommissionable) || [];
  const commissionTotal = commissionable.reduce((s, o) => s + Number(o.commission || 0), 0);
  const salesTotal = commissionable.reduce((s, o) => s + Number(o.netSales || 0), 0);

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={a ? a.name : "Affiliate"}
      description={a ? [a.handle, `${Number(a.commissionPercent)}% commission`, `since ${formatDate(a.createdAt)}`].filter(Boolean).join(" · ") : undefined}
      footer={
        details && (
          <>
            <Button variant="dangerSoft" icon={FiTrash2} onClick={remove} className="mr-auto">Delete</Button>
            <Button variant="ghost" onClick={onClose}>Close</Button>
            <Button type="submit" form="affiliate-edit" loading={saving}>Save details</Button>
          </>
        )
      }
    >
      {error && <Notice tone="error">{error}</Notice>}
      {!details ? (
        !error && <Loading />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Paid / valid orders" value={commissionable.length} />
            <Stat label="Sales" value={formatMoney(salesTotal)} />
            <Stat label="Commission" value={formatMoney(commissionTotal)} />
            <Stat label="Clicks" value={details.links.reduce((s, l) => s + (l.periodClicks || 0), 0)} />
          </div>

          <form id="affiliate-edit" onSubmit={save}>
            <FormSection title="Details">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Name" required>
                  <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={150} />
                </Field>
                <Field label="Handle">
                  <input className={inputClass} value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })} maxLength={150} />
                </Field>
                <Field label="Commission %">
                  <input type="number" min="0" max="100" step="0.5" className={inputClass} value={form.commissionPercent} onChange={(e) => setForm({ ...form, commissionPercent: e.target.value })} />
                </Field>
                <Field label="Email">
                  <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={320} />
                </Field>
                <Field label="Phone">
                  <input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={50} />
                </Field>
                <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Active" className="self-end" />
                <Field label="Notes" className="sm:col-span-3">
                  <textarea className={textareaClass} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={1000} />
                </Field>
              </div>
            </FormSection>
          </form>

          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-gray-900">Codes</h3>
              {!codeForm && (
                <Button
                  size="sm"
                  variant="secondary"
                  icon={FiPlus}
                  onClick={() => setCodeForm({ ...emptyCode, code: suggestCode(a.name, emptyCode.discountValue) })}
                >
                  Add code
                </Button>
              )}
            </div>
            {codeForm && (
              <form onSubmit={addCode} className="mb-4 grid gap-3 rounded-2xl bg-[#faf9f6] p-4 ring-1 ring-black/[0.05] sm:grid-cols-6">
                <Field label="Code" className="sm:col-span-2">
                  <input className={`${inputClass} font-mono uppercase`} value={codeForm.code} onChange={(e) => setCodeForm({ ...codeForm, code: e.target.value.toUpperCase() })} required maxLength={50} />
                </Field>
                <Field label="Type">
                  <select className={selectClass} value={codeForm.discountType} onChange={(e) => setCodeForm({ ...codeForm, discountType: e.target.value })}>
                    <option value="percentage">% off</option>
                    <option value="fixed">Fixed (ден.)</option>
                  </select>
                </Field>
                <Field label="Value">
                  <input type="number" min="0" className={inputClass} value={codeForm.discountValue} onChange={(e) => setCodeForm({ ...codeForm, discountValue: e.target.value })} />
                </Field>
                <Field label="Min. order">
                  <input type="number" min="0" className={inputClass} value={codeForm.minimumOrderAmount} onChange={(e) => setCodeForm({ ...codeForm, minimumOrderAmount: e.target.value })} />
                </Field>
                <Field label="Valid until">
                  <input type="date" className={inputClass} value={codeForm.validUntil} onChange={(e) => setCodeForm({ ...codeForm, validUntil: e.target.value })} />
                </Field>
                <Field label="Applies to" className="sm:col-span-6">
                  <PromoScopeFields
                    value={codeForm}
                    onChange={(scope) => setCodeForm((current) => ({ ...current, ...scope }))}
                    products={catalog.products}
                    categories={catalog.categories}
                  />
                </Field>
                <div className="flex items-center justify-end gap-2 sm:col-span-6">
                  <Button variant="ghost" size="sm" onClick={() => setCodeForm(null)}>Cancel</Button>
                  <Button type="submit" size="sm" loading={savingCode}>Add code</Button>
                </div>
              </form>
            )}
            {details.codes.length === 0 ? (
              <p className="text-sm text-gray-500">No codes yet.</p>
            ) : (
              <div className={`${tableWrapClass} rounded-2xl ring-1 ring-black/[0.06]`}>
                <table className={tableClass}>
                  <thead>
                    <tr>
                      <th className={thClass}>Code</th>
                      <th className={thClass}>Discount</th>
                      <th className={thClass}>Valid until</th>
                      <th className={`${thClass} text-right`}>Orders</th>
                      <th className={`${thClass} text-right`}>Sales</th>
                      <th className={thClass}>Status</th>
                      <th className={thClass} aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {details.codes.map((c) => (
                      <tr key={c.promoCodeId} className={trClass}>
                        <td className={tdClass}>
                          <span className="font-mono font-semibold">{c.code}</span>
                          <ScopeBadge code={c} products={catalog.products} categories={catalog.categories} className="mt-1 block w-fit" />
                        </td>
                        <td className={tdClass}>
                          {discountLabel(c.discountType, c.discountValue)}
                          {Number(c.minimumOrderAmount) > 0 && (
                            <span className="text-xs text-gray-500"> · from {formatMoney(c.minimumOrderAmount)}</span>
                          )}
                        </td>
                        <td className={tdClass}>{c.validUntil ? formatDate(c.validUntil) : "No end"}</td>
                        <td className={`${tdClass} text-right tabular-nums`}>{c.orders}</td>
                        <td className={`${tdClass} text-right tabular-nums`}>{formatMoney(c.netSales)}</td>
                        <td className={tdClass}>
                          <VisibilityBadge active={c.isActive} on="Active" off="Off" />
                        </td>
                        <td className={`${tdClass} whitespace-nowrap text-right`}>
                          <CopyButton text={codeUrl(c.code)} label="Copy direct link with this code (?code=)" />
                          <IconButton
                            icon={FiLink}
                            label="Make a short link for this code"
                            onClick={() => onNewLink({ promoCodeId: c.promoCodeId, affiliateId: id, slug: suggestSlug(`${a.name}-${c.code}`) })}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Edit or switch off codes under Promotions &amp; gifts. Any code can be shared directly as {codeUrl("CODE")}.
            </p>
          </section>

          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-gray-900">Short links</h3>
              <Button
                size="sm"
                variant="secondary"
                icon={FiPlus}
                onClick={() =>
                  onNewLink({
                    affiliateId: id,
                    promoCodeId: details.codes.find((c) => c.isActive)?.promoCodeId ?? "",
                    slug: suggestSlug(a.name) || randomSlug(),
                  })
                }
              >
                Add link
              </Button>
            </div>
            {details.links.length === 0 ? (
              <p className="text-sm text-gray-500">No links yet.</p>
            ) : (
              <div className="rounded-2xl ring-1 ring-black/[0.06]">
                <LinksTable links={details.links} onEdit={onEditLink} onDelete={onDeleteLink} />
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-3 text-sm font-bold text-gray-900">Orders in this period</h3>
            {details.orders.length === 0 ? (
              <p className="text-sm text-gray-500">No orders with their codes in this period.</p>
            ) : (
              <div className={`${tableWrapClass} rounded-2xl ring-1 ring-black/[0.06]`}>
                <table className={tableClass}>
                  <thead>
                    <tr>
                      <th className={thClass}>Order</th>
                      <th className={thClass}>Date</th>
                      <th className={thClass}>Customer</th>
                      <th className={thClass}>Code</th>
                      <th className={`${thClass} text-right`}>Sales</th>
                      <th className={`${thClass} text-right`}>Commission</th>
                      <th className={thClass}>Counts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.orders.map((o) => (
                      <tr key={o.orderId} className={trClass}>
                        <td className={`${tdClass} font-mono text-[13px]`}>#{o.orderNumber}</td>
                        <td className={tdClass}>{formatDateTime(o.orderDate)}</td>
                        <td className={tdClass}>{o.customerName || "—"}</td>
                        <td className={`${tdClass} font-mono text-[13px]`}>{o.code}</td>
                        <td className={`${tdClass} text-right tabular-nums`}>{formatMoney(o.netSales)}</td>
                        <td className={`${tdClass} text-right tabular-nums`}>{o.isCommissionable ? formatMoney(o.commission) : "—"}</td>
                        <td className={tdClass}>
                          {o.isCommissionable ? (
                            <Badge tone="green">Yes</Badge>
                          ) : (
                            <Badge tone="neutral">
                              No · {o.paymentMethod === "credit_card" && !["completed", "paid"].includes(o.paymentStatus) ? "not paid" : o.orderStatus}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </Modal>
  );
}
