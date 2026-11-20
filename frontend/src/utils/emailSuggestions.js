// "Did you mean …?" suggestions for mistyped email domains (hotmal.com → hotmail.com).
// Keep the provider list and the typo map in sync with backend EmailSuggestions.cs.

// Most used first: on a tie the earlier domain wins.
export const KNOWN_EMAIL_DOMAINS = [
  // Global
  "gmail.com", "googlemail.com",
  "hotmail.com", "outlook.com", "live.com", "msn.com", "windowslive.com",
  "yahoo.com", "ymail.com", "rocketmail.com",
  "icloud.com", "me.com", "mac.com",
  "aol.com", "proton.me", "protonmail.com", "pm.me",
  "gmx.com", "gmx.net", "gmx.de", "gmx.at", "gmx.ch", "mail.com",
  "yandex.com", "yandex.ru", "mail.ru", "zoho.com", "tutanota.com", "tuta.io",
  "fastmail.com", "hey.com", "inbox.com", "email.com", "usa.com", "post.com",
  // Country versions of the big providers
  "hotmail.co.uk", "hotmail.de", "hotmail.fr", "hotmail.it", "hotmail.es", "hotmail.rs", "hotmail.com.tr",
  "outlook.de", "outlook.fr", "outlook.it", "outlook.es", "outlook.co.uk",
  "live.co.uk", "live.de", "live.fr", "live.it", "live.nl", "live.at", "live.se",
  "yahoo.co.uk", "yahoo.de", "yahoo.fr", "yahoo.it", "yahoo.es", "yahoo.gr", "yahoo.ca", "yahoo.com.au",
  // Europe / region
  "web.de", "t-online.de", "freenet.de", "arcor.de", "bluewin.ch", "libero.it", "virgilio.it", "tiscali.it",
  "orange.fr", "free.fr", "wanadoo.fr", "laposte.net", "sfr.fr", "seznam.cz", "wp.pl", "o2.pl", "onet.pl",
  "interia.pl", "abv.bg", "mail.bg", "dir.bg", "otenet.gr", "sbb.rs", "eunet.rs", "siol.net", "t-com.hr",
  "net.hr", "btinternet.com", "sky.com",
  // North America
  "comcast.net", "verizon.net", "att.net", "sbcglobal.net", "cox.net", "charter.net",
  // North Macedonia
  "t-home.mk", "t.mk", "mt.net.mk", "on.net.mk", "telekabel.com.mk", "neotel.net.mk",
  "ukim.edu.mk", "ugd.edu.mk", "uklo.edu.mk", "seeu.edu.mk", "finki.ukim.mk", "students.finki.ukim.mk",
  "proteini.mk", "proteini.si",
];

// Typos too far from the right domain for the distance check, or certain enough to block on.
export const EMAIL_DOMAIN_TYPOS = {
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gnail.com": "gmail.com",
  "gmal.com": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "outlok.com": "outlook.com",
  "outllok.com": "outlook.com",
  "outlook.co": "outlook.com",
  "iclod.com": "icloud.com",
  "icoud.com": "icloud.com",
  "g.mail.com": "gmail.com",
  "gmail.mk": "gmail.com",
  "hotmail.mk": "hotmail.com",
  "yahoo.mk": "yahoo.com",
  "outlook.mk": "outlook.com",
  "gmail.com.mk": "gmail.com",
  "hotmail.com.mk": "hotmail.com",
  "thome.mk": "t-home.mk",
  "t-home.com": "t-home.mk",
  "t-home.com.mk": "t-home.mk",
};

// Providers whose address almost always ends in .com: gmail.ru, hotmail.si, yahoo.mkd → .com
// (country versions in the list above are left alone).
const COM_PROVIDERS = ["gmail", "googlemail", "hotmail", "outlook", "yahoo", "ymail", "icloud", "protonmail", "aol"];

const KNOWN = new Set(KNOWN_EMAIL_DOMAINS);
const WITHOUT_DOTS = new Map(
  [...KNOWN_EMAIL_DOMAINS].reverse().map((domain) => [domain.replace(/[.-]/g, ""), domain]),
);

// Optimal string alignment distance: insert, delete, replace, swap two neighbours.
function editDistance(a, b, limit) {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let prevPrev = null;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost);
      if (prevPrev && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, prevPrev[j - 2] + 1);
      }
      row.push(value);
      rowMin = Math.min(rowMin, value);
    }
    if (rowMin > limit) return limit + 1;
    prevPrev = prev;
    prev = row;
  }
  return prev[b.length];
}

/** The corrected domain for a mistyped one, or null when it looks fine or is unknown. */
export function suggestEmailDomain(rawDomain) {
  const domain = (rawDomain || "").trim().toLowerCase().replace(/\.+$/, "");
  if (!domain || KNOWN.has(domain)) return null;
  if (EMAIL_DOMAIN_TYPOS[domain]) return EMAIL_DOMAIN_TYPOS[domain];

  const provider = COM_PROVIDERS.find((name) => domain.startsWith(`${name}.`));
  if (provider) return `${provider}.com`;

  // gmailcom, hot-mail.com, gmail.co.m
  const squashed = WITHOUT_DOTS.get(domain.replace(/[.-]/g, ""));
  if (squashed) return squashed;

  // Short domains (o2.pl, wp.pl) are only one key apart from each other, so allow
  // two mistakes only on longer ones.
  const limit = domain.length >= 9 ? 2 : 1;
  let best = null;
  let bestDistance = limit + 1;
  for (const known of KNOWN_EMAIL_DOMAINS) {
    const distance = editDistance(domain, known, limit);
    if (distance < bestDistance) {
      best = known;
      bestDistance = distance;
      if (distance === 1) break;
    }
  }
  return best;
}

/** The whole corrected address ("name@hotmail.com"), or null. */
export function getEmailTypoSuggestion(email) {
  const trimmed = (email || "").trim().toLowerCase();
  const atIndex = trimmed.indexOf("@");
  if (atIndex <= 0 || atIndex !== trimmed.lastIndexOf("@")) return null;
  const domain = trimmed.slice(atIndex + 1);
  if (domain.length < 3) return null;
  const suggested = suggestEmailDomain(domain);
  return suggested ? `${trimmed.slice(0, atIndex)}@${suggested}` : null;
}

/** True only for the listed, certain typos (safe to block on). */
export function isKnownEmailTypo(email) {
  const trimmed = (email || "").trim().toLowerCase();
  const atIndex = trimmed.lastIndexOf("@");
  return atIndex > 0 && Boolean(EMAIL_DOMAIN_TYPOS[trimmed.slice(atIndex + 1)]);
}
