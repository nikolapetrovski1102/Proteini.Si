// Ready-made ad copy (the shop's customers read Macedonian and Albanian; English for tourists/expats).
export const PRIMARY_TEXT_PRESETS = [
  { group: "MK", label: "Sale", text: "🔥 Попусти на омилените суплементи! Нарачај денес — брза достава низ цела Македонија." },
  { group: "MK", label: "Range", text: "💪 Сè што ти треба за тренинг на едно место. Оригинални производи, брза достава до твојата врата." },
  { group: "MK", label: "New", text: "🆕 Ново во Proteini.mk! Погледни ги новите производи и нарачај онлајн." },
  { group: "MK", label: "Last chance", text: "⏳ Акцијата трае кратко! Искористи ги цените додека има залиха." },
  { group: "MK", label: "Protein", text: "🥛 Протеин за посилни тренинзи и побрзо закрепнување. Оригинални брендови по најдобри цени." },
  { group: "MK", label: "Creatine", text: "⚡ Креатин за повеќе сила и енергија на секој тренинг. Нарачај онлајн, плати при достава." },
  { group: "MK", label: "Cash on delivery", text: "🚚 Нарачај денес, плати при достава. Брза испорака низ цела Македонија." },
  { group: "AL", label: "Sale", text: "🔥 Zbritje në suplementet tuaja të preferuara! Porosit sot — dërgesë e shpejtë në gjithë Maqedoninë." },
  { group: "AL", label: "Range", text: "💪 Gjithçka që të duhet për stërvitje në një vend. Produkte origjinale, dërgesë e shpejtë deri te dera jote." },
  { group: "AL", label: "Last chance", text: "⏳ Oferta zgjat pak! Përfito nga çmimet derisa ka stok." },
  { group: "EN", label: "Sale", text: "🔥 Deals on your favourite supplements! Order today — fast delivery across North Macedonia." },
];

export const EMOJIS = ["🔥", "💪", "⚡", "🆕", "⏳", "🚚", "✅", "🎁", "💥", "🏋️", "🥛", "👉"];

/** Quick inserts for the primary text, computed from the cards. */
export const textInserts = (cards) => {
  const discounts = cards.map((c) => (c.salePrice && c.price > c.salePrice ? Math.floor((1 - c.salePrice / c.price) * 100) : 0));
  const maxDiscount = Math.max(0, ...discounts);
  const prices = cards.map((c) => Number(c.salePrice || c.price)).filter((n) => n > 0);
  const brands = [...new Set(cards.map((c) => c.brand).filter(Boolean))];
  const inserts = [];
  if (maxDiscount > 0) inserts.push({ label: `до -${maxDiscount}%`, text: `до -${maxDiscount}%` });
  if (prices.length) inserts.push({ label: "lowest price", text: `од ${Math.ceil(Math.min(...prices)).toLocaleString("de-DE")} MKD` });
  if (brands.length) inserts.push({ label: "brands", text: brands.slice(0, 4).join(", ") });
  inserts.push({ label: "shop link", text: "proteini.mk" });
  return inserts;
};

export const CTAS = [
  { value: "SHOP_NOW", label: "Shop now" },
  { value: "ORDER_NOW", label: "Order now" },
  { value: "BUY_NOW", label: "Buy now" },
  { value: "GET_OFFER", label: "Get offer" },
  { value: "LEARN_MORE", label: "Learn more" },
  { value: "SIGN_UP", label: "Sign up" },
  { value: "CONTACT_US", label: "Contact us" },
];

export const ctaLabel = (value) => CTAS.find((c) => c.value === value)?.label ?? "Shop now";

// Meta cuts carousel headlines around 32-40 characters and descriptions around 20-30.
export const HEADLINE_MAX = 40;
export const DESCRIPTION_MAX = 30;
export const PRIMARY_MAX = 500;
// Meta shows about this much primary text before "… See more".
export const PRIMARY_VISIBLE = 125;
