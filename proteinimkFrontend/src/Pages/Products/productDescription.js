const allowedTags = new Set([
  "p", "br", "strong", "b", "em", "i", "ul", "ol", "li",
  "h2", "h3", "h4", "blockquote",
]);
const discardedTags = new Set([
  "script", "style", "iframe", "object", "embed", "svg", "math", "form",
  "input", "button", "textarea", "select", "img", "video", "audio",
]);

const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);

// Product descriptions can contain pasted HTML. Keep only text and the small
// set of formatting elements that the storefront supports.
export function sanitizeDescriptionHtml(html) {
  if (typeof document === "undefined") return "";
  const source = new DOMParser().parseFromString(String(html || ""), "text/html");
  const target = document.createElement("div");

  const appendSafe = (node, parent) => {
    if (node.nodeType === Node.TEXT_NODE) {
      parent.appendChild(document.createTextNode(node.textContent));
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const tag = node.tagName.toLowerCase();
    if (discardedTags.has(tag)) return;
    const destination = allowedTags.has(tag)
      ? document.createElement(tag)
      : tag === "div"
        ? document.createElement("p")
        : tag === "span" && (/^(bold|[6-9]00)$/.test(node.style.fontWeight))
          ? document.createElement("strong")
          : parent;
    if (destination !== parent) parent.appendChild(destination);
    node.childNodes.forEach((child) => appendSafe(child, destination));
  };

  source.body.childNodes.forEach((node) => appendSafe(node, target));
  return target.innerHTML;
}

export function descriptionForStorage(html) {
  const safe = sanitizeDescriptionHtml(html).trim();
  if (!safe) return "";
  return /^</.test(safe) ? safe : `<p>${safe}</p>`;
}

export function descriptionFromLegacy(mainDescriptions, otherTitle, otherText) {
  const descriptions = Array.isArray(mainDescriptions)
    ? mainDescriptions.filter((value) => typeof value === "string" && value.trim())
    : [];
  const hasFormattedDescription = descriptions.length === 1 &&
    /^\s*<(?:p|div|ul|ol|h[2-4]|blockquote|strong|b|em|i|br)\b/i.test(descriptions[0]);
  const main = hasFormattedDescription
    ? sanitizeDescriptionHtml(descriptions[0])
    : descriptions.length
      ? `<ul>${descriptions.map((value) => `<li>${escapeHtml(value)}</li>`).join("")}</ul>`
      : "";
  const title = otherTitle?.trim() ? `<h3>${escapeHtml(otherTitle)}</h3>` : "";
  const body = otherText?.trim()
    ? otherText.trim().split(/\n\s*\n/).map((paragraph) =>
        `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`).join("")
    : "";
  return `${main}${title}${body}`;
}
