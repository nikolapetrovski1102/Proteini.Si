// Ready-made ad copy (the shop's customers read Macedonian and Albanian).
export const PRIMARY_TEXT_PRESETS = [
  { label: "Sale · MK", text: "🔥 Попусти на омилените суплементи! Нарачај денес — брза достава низ цела Македонија." },
  { label: "Range · MK", text: "💪 Сè што ти треба за тренинг на едно место. Оригинални производи, брза достава до твојата врата." },
  { label: "New · MK", text: "🆕 Ново во Proteini.mk! Погледни ги новите производи и нарачај онлајн." },
  { label: "Last chance · MK", text: "⏳ Акцијата трае кратко! Искористи ги цените додека има залиха." },
  { label: "Sale · AL", text: "🔥 Zbritje në suplementet tuaja të preferuara! Porosit sot — dërgesë e shpejtë në gjithë Maqedoninë." },
];

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
