const BACKEND_ORIGIN = "https://proteini.mk";

const legacyHomepageImages = {
  "/img/gym-1.jpg": "/img/homepage-cards/gain-muscle-mass.webp",
  "/img/gym-2.jpg": "/img/homepage-cards/lose-weight.webp",
  "/img/gym-3.jpg": "/img/homepage-cards/vitality-lifestyle.webp",
  "/img/gym-4.jpg": "/img/homepage-cards/improve-form-endurance.webp",
  "/img/gym-6.jpg": "/img/homepage-cards/running.webp",
  "/img/gym-7.jpg": "/img/homepage-cards/team-sports.webp",
  "/img/gym-8.jpg": "/img/homepage-cards/fitness-bodybuilding.webp",
};

export const getHomepageCardImageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  // Admin uploads live on the API server. Bundled homepage images should stay
  // relative so they also work in local, preview, and staging deployments.
  if (path.startsWith("/uploads/")) return `${BACKEND_ORIGIN}${path}`;

  return legacyHomepageImages[path] || path;
};
