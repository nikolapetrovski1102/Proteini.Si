import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiPercent, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { api } from "../../services/api";
import { formatMkd, roundMkd } from "../../utils/formatPrice";
import {
  AdminPage,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  IconButton,
  Loading,
  Modal,
  Notice,
  SearchInput,
  Segmented,
  Toggle,
  inputClass,
} from "./AdminKit";
import { useConfirm, useToast } from "./adminFeedback";

/*
 * Automatic discounts: a % off chosen products (single flavor/weight variants), brands or categories,
 * or a new price per product variant (the shop works out the % from it). No code; the shop shows the new price.
 */

const SCOPES = [
  { value: "products", label: "Производи", many: "производи", atLeast: "барем еден производ", selected: ["избран производ", "избрани производи"] },
  { value: "brands", label: "Брендови", many: "брендови", atLeast: "барем еден бренд", selected: ["избран бренд", "избрани брендови"] },
  { value: "categories", label: "Категории", many: "категории", atLeast: "барем една категорија", selected: ["избрана категорија", "избрани категории"] },
];

const TYPES = [
  { value: "percent", label: "Процент попуст" },
  { value: "price", label: "Нова цена" },
];

const emptyForm = { name: "", type: "percent", percentage: "", appliesTo: "products", targetIds: [], items: [], startsOn: "", endsOn: "", isActive: true };

/** Product discount items are single variants: "productId:variantId" (variant 0 = product without variants). */
const itemKey = (productId, variantId) => `${productId}:${variantId || 0}`;
const parseAmount = (value) => Number(String(value ?? "").replace(/\./g, "").replace(",", "."));

/** "2 kg", "908 g", or the packaging name when no weight is set. */
const weightText = (o) => {
  const grams = Number(o.weight_Grams);
  if (grams > 0) return grams >= 1000 ? `${Number((grams / 1000).toFixed(2))} kg` : `${Math.round(grams)} g`;
  return o.packaging_Name || "";
};

/** What the shop shows as the discount for a new price: same rounding as the product page. */
const percentOff = (price, newPrice) => (price > 0 && newPrice > 0 && newPrice < price ? Math.round(((price - newPrice) / price) * 100) : null);

const dayOnly = (value) => (value ? String(value).slice(0, 10) : "");
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const formatDay = (value) => {
  const day = dayOnly(value);
  if (!day) return "";
  const [y, m, d] = day.split("-");
  return `${d}.${m}.${y}`;
};
const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;
const formatPercent = (value) => `${Number(value).toLocaleString("mk-MK", { maximumFractionDigits: 2 })}%`;

/** Live, scheduled, ended or off, from the switch and the dates. */
function statusOf(discount) {
  const now = today();
  if (!discount.is_Active) return { label: "Исклучен", tone: "neutral" };
  if (discount.starts_On && dayOnly(discount.starts_On) > now) return { label: `Почнува ${formatDay(discount.starts_On)}`, tone: "blue" };
  if (discount.ends_On && dayOnly(discount.ends_On) < now) return { label: "Завршен", tone: "neutral" };
  return { label: "Активен", tone: "green", live: true };
}

const GONE = "Ставката повеќе не е достапна";

const toggleId = (ids, id) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);

export default function AdminDiscounts() {
  const confirm = useConfirm();
  const toast = useToast();
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      setDiscounts((await api.getAdminDiscounts()) || []);
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // The pickers' options. A failure here only empties that list.
    api.getAdminDiscountItems().then((rows) => setProducts(rows || []), () => {});
    api.getAdminBrands().then((rows) => setBrands(rows || []), () => {});
    api.getAdminCategories().then((rows) => setCategories(rows || []), () => {});
  }, []);

  // Every option as { id, name, depth, sub } for the current "applies to".
  const options = useMemo(() => {
    const byName = (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    return {
      // One row per variant, already sorted by product name and weight.
      products: products.map((o) => {
        const details = [o.flavor_Name, weightText(o)].filter(Boolean).join(" · ");
        return {
          id: itemKey(o.product_Id, o.variant_Id),
          productId: o.product_Id,
          variantId: o.variant_Id || 0,
          name: o.product_Name || `Производ #${o.product_Id}`,
          details,
          label: [o.product_Name, details].filter(Boolean).join(" · "),
          sub: o.brand_Name || "",
          price: Number(o.price) || 0,
        };
      }),
      brands: brands.map((b) => ({ id: b.brand_Id, name: b.brand_Name, sub: plural(b.product_Count || 0, "производ", "производи") })).sort(byName),
      categories: (() => {
        // Parents first, each followed by its subcategories.
        const known = new Set(categories.map((c) => c.category_Id));
        const order = (a, b) => (a.display_Order || 0) - (b.display_Order || 0) || (a.category_Name || "").localeCompare(b.category_Name || "");
        const rows = [];
        const visit = (parentId, depth) => {
          categories
            .filter((c) => (parentId == null ? !c.parent_Category_Id || !known.has(c.parent_Category_Id) : c.parent_Category_Id === parentId))
            .sort(order)
            .forEach((c) => {
              rows.push({ id: c.category_Id, name: c.category_Name, depth, sub: "" });
              if (depth < 6) visit(c.category_Id, depth + 1);
            });
        };
        visit(null, 0);
        return rows;
      })(),
    };
  }, [products, brands, categories]);

  const itemByKey = useMemo(() => new Map(options.products.map((o) => [o.id, o])), [options.products]);
  const nameOf = (scope, id) => options[scope]?.find((o) => o.id === id)?.name || `#${id}`;
  const itemLabel = (key) => itemByKey.get(key)?.label || GONE;

  const targetsText = (d) => {
    const scope = d.applies_To;
    const names = scope === "products" ? (d.items || []).map((i) => itemLabel(itemKey(i.product_Id, i.variant_Id))) : (d.target_Ids || []).map((id) => nameOf(scope, id));
    const shown = names.length > 3 ? `${names.slice(0, 3).join(", ")} и уште ${names.length - 3}` : names.join(", ");
    return `${SCOPES.find((s) => s.value === scope)?.label || scope}: ${shown}`;
  };

  // New-price discounts: the % each item ends up with, from its normal price.
  const pricePercents = (d) =>
    (d.items || [])
      .map((i) => percentOff(itemByKey.get(itemKey(i.product_Id, i.variant_Id))?.price, Number(i.new_Price)))
      .filter((pct) => pct != null);

  const badgeText = (d) => {
    if (d.discount_Type !== "price") return `−${Math.round(d.percentage)}%`;
    const pcts = pricePercents(d);
    return pcts.length ? `−${Math.max(...pcts)}%` : "MKD";
  };

  const amountText = (d) => {
    if (d.discount_Type !== "price") return `${formatPercent(d.percentage)} попуст`;
    const items = d.items || [];
    if (items.length === 1) return `Нова цена ${formatMkd(items[0].new_Price)}`;
    const pcts = pricePercents(d);
    return pcts.length ? `Нови цени, од ${Math.min(...pcts)}% до ${Math.max(...pcts)}% попуст` : "Нови цени";
  };

  const datesText = (d) => {
    if (d.starts_On && d.ends_On) return `${formatDay(d.starts_On)} до ${formatDay(d.ends_On)}`;
    if (d.starts_On) return `Од ${formatDay(d.starts_On)}`;
    if (d.ends_On) return `До ${formatDay(d.ends_On)}`;
    return "Без краен датум";
  };

  const startNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setSearch("");
    setOpen(true);
  };

  const edit = (discount) => {
    setEditing(discount);
    setForm({
      name: discount.name || "",
      type: discount.discount_Type === "price" ? "price" : "percent",
      percentage: discount.percentage == null ? "" : String(discount.percentage),
      appliesTo: discount.applies_To || "products",
      targetIds: discount.target_Ids || [],
      items: (discount.items || []).map((i) => ({
        key: itemKey(i.product_Id, i.variant_Id),
        productId: i.product_Id,
        variantId: i.variant_Id || 0,
        newPrice: i.new_Price == null ? "" : String(roundMkd(i.new_Price)),
      })),
      startsOn: dayOnly(discount.starts_On),
      endsOn: dayOnly(discount.ends_On),
      isActive: !!discount.is_Active,
    });
    setSearch("");
    setOpen(true);
  };

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const toggleItem = (option) =>
    setForm((c) =>
      c.items.some((i) => i.key === option.id)
        ? { ...c, items: c.items.filter((i) => i.key !== option.id) }
        : { ...c, items: [...c.items, { key: option.id, productId: option.productId, variantId: option.variantId, newPrice: "" }] },
    );

  const setItemPrice = (key, newPrice) => setForm((c) => ({ ...c, items: c.items.map((i) => (i.key === key ? { ...i, newPrice } : i)) }));

  const payloadOf = (f) => ({
    name: f.name.trim(),
    type: f.appliesTo === "products" ? f.type : "percent",
    percentage: f.type === "price" && f.appliesTo === "products" ? null : Number(String(f.percentage).replace(",", ".")),
    appliesTo: f.appliesTo,
    targetIds: f.appliesTo === "products" ? [] : f.targetIds,
    items: f.appliesTo === "products" ? f.items.map((i) => ({ productId: i.productId, variantId: i.variantId, newPrice: f.type === "price" ? parseAmount(i.newPrice) : null })) : [],
    startsOn: f.startsOn || null,
    endsOn: f.endsOn || null,
    isActive: f.isActive,
  });

  const submit = async (event) => {
    event?.preventDefault();
    const payload = payloadOf(form);
    const scope = SCOPES.find((s) => s.value === form.appliesTo);
    const chosen = form.appliesTo === "products" ? payload.items.length : payload.targetIds.length;
    const badPrice =
      payload.type === "price" &&
      payload.items.find((i) => {
        const normal = itemByKey.get(itemKey(i.productId, i.variantId))?.price;
        return !(i.newPrice > 0) || (normal > 0 && i.newPrice >= normal);
      });
    const problem = !payload.name
      ? "Внесете име на попустот."
      : !chosen
        ? `Изберете ${scope.atLeast}.`
        : payload.type === "percent" && !(payload.percentage > 0 && payload.percentage < 100)
          ? "Попустот мора да е поголем од 0% и помал од 100%."
          : badPrice
            ? `Внесете нова цена пониска од редовната за ${itemLabel(itemKey(badPrice.productId, badPrice.variantId))}.`
          : payload.startsOn && payload.endsOn && payload.startsOn > payload.endsOn
            ? "Крајниот датум мора да е ист или по почетниот."
            : null;
    if (problem) {
      toast.error(problem);
      return;
    }
    setSaving(true);
    try {
      if (editing) await api.updateAdminDiscount(editing.discount_Id, payload);
      else await api.createAdminDiscount(payload);
      toast.success(editing ? "Попустот е зачуван. Цените во продавницата се ажурирани." : "Попустот е додаден. Цените во продавницата се ажурирани.");
      setOpen(false);
      await load();
    } catch (saveError) {
      toast.error(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (discount) => {
    setBusyId(discount.discount_Id);
    try {
      await api.updateAdminDiscount(discount.discount_Id, {
        name: discount.name,
        type: discount.discount_Type || "percent",
        percentage: discount.percentage,
        appliesTo: discount.applies_To,
        targetIds: discount.target_Ids || [],
        items: (discount.items || []).map((i) => ({ productId: i.product_Id, variantId: i.variant_Id, newPrice: i.new_Price })),
        startsOn: dayOnly(discount.starts_On) || null,
        endsOn: dayOnly(discount.ends_On) || null,
        isActive: !discount.is_Active,
      });
      toast.success(discount.is_Active ? `„${discount.name}“ е исклучен. Цените се вратени на редовни.` : `„${discount.name}“ е вклучен.`);
      await load();
    } catch (toggleError) {
      toast.error(toggleError.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (discount) => {
    const ok = await confirm({
      title: `Да се избрише „${discount.name}“?`,
      message: "Производите се враќаат на редовната цена (или на својата акциска цена, ако ја имале).",
      confirmLabel: "Избриши",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await api.deleteAdminDiscount(discount.discount_Id);
      toast.success("Попустот е избришан.");
      await load();
    } catch (deleteError) {
      toast.error(deleteError.message);
    }
  };

  const scope = SCOPES.find((s) => s.value === form.appliesTo) || SCOPES[0];
  const isProducts = form.appliesTo === "products";
  const showPercent = !isProducts || form.type === "percent";
  const percentValue = Number(String(form.percentage).replace(",", "."));
  const selectedKeys = useMemo(() => new Set(form.items.map((i) => i.key)), [form.items]);
  const visibleOptions = useMemo(() => {
    const rows = options[form.appliesTo] || [];
    const term = search.trim().toLowerCase();
    // Every word must match the name, flavor, weight or brand ("whey choco 2 kg").
    const words = term.split(/\s+/).filter(Boolean);
    const matched = words.length
      ? rows.filter((o) => {
          const text = `${o.name} ${o.details || ""} ${o.sub}`.toLowerCase();
          return words.every((w) => text.includes(w));
        })
      : rows;
    return matched.slice(0, 300);
  }, [options, form.appliesTo, search]);

  return (
    <AdminPage
      eyebrow="Продавница"
      title="Попусти"
      count={loading ? undefined : discounts.length}
      description="Намалете ја цената за процент на избрани производи, на сите производи од бренд или на цела категорија, или поставете нова цена на поединечни производи. Не треба код: продавницата ја прикажува новата цена со прецртана стара цена и процентот попуст, а наплатата е по новата цена."
      actions={
        <Button icon={FiPlus} onClick={startNew}>
          Нов попуст
        </Button>
      }
    >
      {error && <Notice tone="error">{error}</Notice>}

      <Notice tone="info" title="Како функционира">
        Производите се избираат по вкус и големина. Ако една ставка е во повеќе активни попусти, важи најниската цена. Сопствената акциска цена на производот останува
        ако е веќе пониска. Промо и партнерските кодови и понатаму се применуваат врз намалената цена. Почетниот и крајниот датум стапуваат на сила сами, во рок од околу 10 минути.
      </Notice>

      <Card bodyClassName="">
        {loading ? (
          <Loading label="Се вчитуваат попустите…" />
        ) : discounts.length === 0 ? (
          <EmptyState
            icon={FiPercent}
            title="Сè уште нема попусти"
            text="На пример: 15% попуст на сите USN производи до крајот на месецот."
            action={
              <Button icon={FiPlus} onClick={startNew}>
                Нов попуст
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-black/[0.06]">
            {discounts.map((d) => {
              const status = statusOf(d);
              return (
                <li key={d.discount_Id} className="flex flex-wrap items-center gap-3 px-5 py-4 sm:flex-nowrap">
                  <span className="flex h-12 w-14 shrink-0 items-center justify-center rounded-lg bg-[#141409] font-display text-lg font-bold text-[#FDC700] tabular-nums">
                    {badgeText(d)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-bold text-gray-900">{d.name}</span>
                      <Badge tone={status.tone} dot>
                        {status.label}
                      </Badge>
                    </p>
                    <p className="mt-0.5 truncate text-xs text-gray-600">{targetsText(d)}</p>
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {[
                        amountText(d),
                        plural(d.product_Count, "производ", "производи"),
                        status.live && d.live_Count < d.product_Count ? `${d.live_Count} со овој попуст` : null,
                        datesText(d),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Toggle
                      checked={d.is_Active}
                      disabled={busyId === d.discount_Id}
                      onChange={() => toggleActive(d)}
                      label={<span className="sr-only">{d.is_Active ? `Исклучи ${d.name}` : `Вклучи ${d.name}`}</span>}
                      className="px-2"
                    />
                    <IconButton icon={FiEdit2} label={`Измени ${d.name}`} onClick={() => edit(d)} />
                    <IconButton icon={FiTrash2} tone="danger" label={`Избриши ${d.name}`} onClick={() => remove(d)} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Modal
        size="lg"
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Измени: ${editing.name}` : "Нов попуст"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Откажи
            </Button>
            <Button onClick={submit} loading={saving}>
              {editing ? "Зачувај ги промените" : "Додај попуст"}
            </Button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-5">
          <div className={`grid gap-4 ${showPercent ? "sm:grid-cols-[1fr_140px]" : ""}`}>
            <Field label="Име" required hint="Го гледате само вие, на пр. „Black Friday USN“.">
              <input required maxLength={150} className={inputClass} value={form.name} onChange={(e) => setField("name", e.target.value)} />
            </Field>
            {showPercent && (
              <Field label="Попуст" required>
                <div className="relative">
                  <input
                    required
                    inputMode="decimal"
                    className={`${inputClass} pr-9 tabular-nums`}
                    value={form.percentage}
                    placeholder="15"
                    onChange={(e) => setField("percentage", e.target.value.replace(/[^0-9.,]/g, ""))}
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">%</span>
                </div>
              </Field>
            )}
          </div>

          <Field label="Се однесува на" required>
            <div className="space-y-3">
              <Segmented
                value={form.appliesTo}
                onChange={(appliesTo) => {
                  setSearch("");
                  setForm((c) =>
                    appliesTo === c.appliesTo
                      ? c
                      : { ...c, appliesTo, targetIds: [], items: [], type: appliesTo === "products" ? c.type : "percent" },
                  );
                }}
                options={SCOPES.map((s) => ({ value: s.value, label: s.label }))}
              />
              <p className="text-sm text-gray-500">
                {form.appliesTo === "products" && "Само вкусовите и големините што ќе ги штиклирате."}
                {form.appliesTo === "brands" && "Сите производи од штиклираните брендови, вклучително и оние што ќе се додадат подоцна."}
                {form.appliesTo === "categories" && "Сите производи во штиклираните категории и нивните поткатегории, вклучително и оние што ќе се додадат подоцна."}
              </p>
              {isProducts && (
                <div className="space-y-2">
                  <Segmented value={form.type} onChange={(type) => setField("type", type)} options={TYPES} />
                  <p className="text-sm text-gray-500">
                    {form.type === "price"
                      ? "Внесете ја акциската цена за секоја ставка. Продавницата сама го прикажува процентот попуст, пресметан од редовната цена."
                      : "Ист процент попуст на секоја штиклирана ставка."}
                  </p>
                </div>
              )}

              {isProducts && form.items.length > 0 && (
                <div className="rounded-xl ring-1 ring-black/[0.08]">
                  <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] px-3 py-2">
                    <p className="text-sm font-bold text-gray-900">{plural(form.items.length, "избрана ставка", "избрани ставки")}</p>
                    <button type="button" onClick={() => setField("items", [])} className="text-xs font-bold text-gray-500 underline hover:text-gray-900">
                      Исчисти
                    </button>
                  </div>
                  <ul className="max-h-72 divide-y divide-black/[0.05] overflow-y-auto">
                    {form.items.map((item) => {
                      const option = itemByKey.get(item.key);
                      const normal = option?.price || 0;
                      const newPrice =
                        form.type === "price" ? parseAmount(item.newPrice) : normal > 0 && percentValue > 0 && percentValue < 100 ? roundMkd((normal * (100 - percentValue)) / 100) : 0;
                      const pct = percentOff(normal, newPrice);
                      const tooHigh = form.type === "price" && newPrice > 0 && normal > 0 && newPrice >= normal;
                      return (
                        <li key={item.key} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2 text-sm sm:flex-nowrap">
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-gray-900">{option?.name || GONE}</p>
                            <p className="truncate text-xs text-gray-500">
                              {[option?.details, normal ? `Редовна ${formatMkd(normal)}` : null].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                          {form.type === "price" ? (
                            <div className="relative w-32 shrink-0">
                              <input
                                inputMode="numeric"
                                aria-label={`Нова цена за ${option?.label || "ставка"}`}
                                className={`${inputClass} pr-12 tabular-nums ${tooHigh ? "ring-red-400" : ""}`}
                                value={item.newPrice}
                                placeholder={normal ? String(Math.max(1, roundMkd(normal * 0.9))) : ""}
                                onChange={(e) => setItemPrice(item.key, e.target.value.replace(/[^0-9]/g, ""))}
                              />
                              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">MKD</span>
                            </div>
                          ) : (
                            <span className="shrink-0 tabular-nums text-gray-900">{newPrice ? formatMkd(newPrice) : "—"}</span>
                          )}
                          <span className={`w-20 shrink-0 text-right text-sm font-bold tabular-nums ${tooHigh ? "text-red-600" : "text-gray-900"}`}>
                            {tooHigh ? "Превисока" : pct != null ? `−${pct}%` : "—"}
                          </span>
                          <IconButton icon={FiX} label={`Отстрани ${option?.label || "ставка"}`} onClick={() => setForm((c) => ({ ...c, items: c.items.filter((i) => i.key !== item.key) }))} />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {!isProducts && form.targetIds.length > 0 && (
                <p className="text-sm text-gray-800">
                  <span className="font-bold">{plural(form.targetIds.length, scope.selected[0], scope.selected[1])}:</span>{" "}
                  {form.targetIds.map((id) => nameOf(form.appliesTo, id)).join(" · ")}{" "}
                  <button type="button" onClick={() => setField("targetIds", [])} className="ml-1 text-xs font-bold text-gray-500 underline hover:text-gray-900">
                    Исчисти
                  </button>
                </p>
              )}
              {form.appliesTo !== "categories" && (
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder={isProducts ? "Пребарај по производ, вкус, тежина или бренд…" : `Пребарај ${scope.many}…`}
                  label={`Пребарај ${scope.many}`}
                />
              )}
              <div className="max-h-64 overflow-y-auto rounded-xl ring-1 ring-black/[0.08]">
                {visibleOptions.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-gray-500">Нема пронајдени {scope.many}.</p>
                ) : (
                  visibleOptions.map((o) => {
                    const checked = isProducts ? selectedKeys.has(o.id) : form.targetIds.includes(o.id);
                    return (
                      <label
                        key={o.id}
                        className="flex min-h-[40px] cursor-pointer items-center gap-3 rounded-lg px-3 py-1.5 text-sm text-gray-800 hover:bg-black/[0.03]"
                        style={{ paddingLeft: 12 + (o.depth || 0) * 20 }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => (isProducts ? toggleItem(o) : setField("targetIds", toggleId(form.targetIds, o.id)))}
                          className="h-4 w-4 shrink-0 accent-[#141409]"
                        />
                        {isProducts ? (
                          <span className="min-w-0 flex-1">
                            <span className="block truncate">{o.name}</span>
                            <span className="block truncate text-xs text-gray-500">{[o.details, o.sub].filter(Boolean).join(" · ")}</span>
                          </span>
                        ) : (
                          <span className="min-w-0 flex-1 truncate">{o.name}</span>
                        )}
                        {isProducts ? (
                          <span className="shrink-0 text-xs tabular-nums text-gray-500">{o.price ? formatMkd(o.price) : ""}</span>
                        ) : (
                          o.sub && <span className="shrink-0 text-xs text-gray-400">{o.sub}</span>
                        )}
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Почнува на" hint="Празно: почнува веднаш.">
              <input type="date" className={inputClass} value={form.startsOn} onChange={(e) => setField("startsOn", e.target.value)} />
            </Field>
            <Field label="Завршува на" hint="Последен ден на попустот. Празно: трае додека не го исклучите.">
              <input type="date" className={inputClass} value={form.endsOn} min={form.startsOn || undefined} onChange={(e) => setField("endsOn", e.target.value)} />
            </Field>
          </div>

          <Toggle
            checked={form.isActive}
            onChange={(value) => setField("isActive", value)}
            label="Вклучен"
            description="Исклучете го за да го паузирате попустот без да го бришете. Цените веднаш се враќаат на редовни."
          />
          <button type="submit" className="hidden" />
        </form>
      </Modal>
    </AdminPage>
  );
}
