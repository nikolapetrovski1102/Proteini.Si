const DEFAULTS = {
  title: "Proteini.si – Спортска исхрана и суплементи",
  description:
    "Спортска исхрана, протеини, креатин, витамини и суплементи за активен и здрав начин на живот.",
  image: "https://proteini.mk/img/proteini-landing.jpg",
  url: "https://proteini.mk/",
};

function ensureMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    for (const [name, value] of Object.entries(attributes)) {
      element.setAttribute(name, value);
    }
    document.head.appendChild(element);
  }
  return element;
}

function ensureCanonical() {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.appendChild(element);
  }
  return element;
}

export function applySeoMetadata(values = {}) {
  const metadata = { ...DEFAULTS, ...values };
  const description = ensureMeta('meta[name="description"]', {
    name: "description",
  });
  const ogTitle = ensureMeta('meta[property="og:title"]', {
    property: "og:title",
  });
  const ogDescription = ensureMeta('meta[property="og:description"]', {
    property: "og:description",
  });
  const ogImage = ensureMeta('meta[property="og:image"]', {
    property: "og:image",
  });
  const ogUrl = ensureMeta('meta[property="og:url"]', {
    property: "og:url",
  });
  const canonical = ensureCanonical();

  document.title = metadata.title;
  description.content = metadata.description;
  ogTitle.content = metadata.title;
  ogDescription.content = metadata.description;
  ogImage.content = metadata.image;
  ogUrl.content = metadata.url;
  canonical.href = metadata.url;

  return () => {
    document.title = DEFAULTS.title;
    description.content = DEFAULTS.description;
    ogTitle.content = DEFAULTS.title;
    ogDescription.content = DEFAULTS.description;
    ogImage.content = DEFAULTS.image;
    ogUrl.content = DEFAULTS.url;
    canonical.href = DEFAULTS.url;
  };
}
