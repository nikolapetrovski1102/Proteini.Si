import { useState, useEffect } from "react";
import { useLanguage } from "./translation/LanguageContext";
import { api } from "../services/api";
import { InlineLoader } from "./Components/Loaders/BrandLoader";
import Reveal from "./HomePages/sections/Reveal";
import { useCutoutImage } from "./HomePages/sections/useCutoutImage";

// Uploads are served from the site's own host (proxied to the API in `vite dev`), so a
// relative path keeps the image same-origin: useCutoutImage can only read its pixels then.
const getImageUrl = (imagePath) => imagePath || null;

const fallbackSrc =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Crect x='2' y='2' width='20' height='20' rx='2.18'%3E%3C/rect%3E%3Cpath d='M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5'%3E%3C/path%3E%3C/svg%3E";
const onImgError = (e) => {
  e.target.src = fallbackSrc;
  e.target.onerror = null;
};

// Logo/badge image with its white background removed (see useCutoutImage), so it sits
// directly on the section background without a tile behind it.
function CutoutImg({ path, alt, className }) {
  const { src } = useCutoutImage(getImageUrl(path));
  return <img src={src} alt={alt} loading="lazy" draggable="false" className={className} onError={onImgError} />;
}

export default function Partners() {
  const { translate } = useLanguage();
  const [partners, setPartners] = useState([]);
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartnersAndAwards();
  }, []);

  const fetchPartnersAndAwards = async () => {
    try {
      const data = await api.getPartners();
      // Separate partners and awards
      const partnersList = data.filter(
        (item) => item.type === "partner" && item.isActive,
      );
      const awardsList = data.filter(
        (item) => item.type === "award" && item.isActive,
      );
      setPartners(partnersList);
      setAwards(awardsList);
    } catch (error) {
      console.error("Error fetching partners:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="home-section w-full flex justify-center bg-[#f4f4f1] py-20">
        <InlineLoader size={36} />
      </section>
    );
  }

  if (partners.length === 0 && awards.length === 0) return null;

  // Each marquee track scrolls by -50%, so it holds two identical halves. A half repeats
  // the list until it is wide enough (~10 logos) to fill a desktop viewport.
  const animateMarquee = partners.length > 4;
  const buildTrack = (list) => {
    if (!animateMarquee) return list;
    const half = Array.from({ length: Math.ceil(10 / list.length) }, () => list).flat();
    return [...half, ...half];
  };
  // Second row starts halfway through the list and runs the other way, so the two rows
  // never show the same logo stacked on top of each other.
  const shift = Math.floor(partners.length / 2);
  const rows = animateMarquee
    ? [
        { items: buildTrack(partners), reverse: false },
        { items: buildTrack([...partners.slice(shift), ...partners.slice(0, shift)]), reverse: true },
      ]
    : [{ items: partners, reverse: false }];

  const marqueeMask = "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)";
  const heading =
    "font-display font-bold uppercase tracking-tight text-[30px] leading-[0.95] text-[#141409] [text-wrap:balance] sm:text-5xl";
  const accent = <span className="mb-3 block h-1.5 w-12 rounded-full bg-[#FDC700]" aria-hidden="true" />;

  return (
    // Stays light in dark mode too (home-tint-keep): the logos are transparent and many
    // have dark lettering that would disappear on a dark background.
    <section
      id="partners"
      className="home-section home-tint home-tint-keep relative w-full overflow-hidden bg-[#f4f4f1] py-14 sm:py-24"
    >
      {partners.length > 0 && (
        <>
          <Reveal className="mx-auto mb-8 w-full max-w-[1240px] px-4 sm:mb-12 sm:px-[25px]">
            {accent}
            <h2 className={heading}>{translate("partners")}</h2>
          </Reveal>

          <Reveal className="flex flex-col gap-6 sm:gap-10">
            {rows.map((row, r) => (
              <div
                key={r}
                className="marquee relative overflow-hidden"
                style={{ maskImage: marqueeMask, WebkitMaskImage: marqueeMask }}
              >
                <div
                  className={`flex w-max items-center gap-10 sm:gap-16 ${
                    animateMarquee ? `marquee-track ${row.reverse ? "marquee-reverse" : ""}` : "mx-auto"
                  }`}
                >
                  {row.items.map((partner, i) => {
                    const duplicate = r > 0 || i >= partners.length;
                    return (
                      <a
                        key={`${partner.id}-${i}`}
                        href={partner.url || undefined}
                        target={partner.url ? "_blank" : undefined}
                        rel={partner.url ? "noopener noreferrer" : undefined}
                        aria-hidden={duplicate ? "true" : undefined}
                        tabIndex={duplicate ? -1 : undefined}
                        title={partner.name}
                        className="group flex h-16 w-28 flex-shrink-0 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141409] sm:h-20 sm:w-36"
                      >
                        <CutoutImg
                          path={partner.imagePath}
                          alt={partner.name}
                          className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-110"
                        />
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
          </Reveal>
        </>
      )}

      {awards.length > 0 && (
        <div
          className={`mx-auto w-full max-w-[1240px] px-4 sm:px-[25px] ${partners.length > 0 ? "mt-14 sm:mt-24" : ""}`}
        >
          <Reveal>
            <div className="flex flex-col gap-8 border-t border-[#141409]/10 pt-10 sm:pt-16 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
              <div className="max-w-sm">
                {accent}
                <h2 className={heading}>{translate("awardsAndCertificates")}</h2>
              </div>

              <div className="grid grid-cols-3 gap-4 sm:flex sm:flex-wrap sm:gap-14 lg:justify-end">
                {awards.map((award, i) => (
                  <Reveal key={award.id} variant="scale" delay={Math.min(i, 8) * 90}>
                    <figure className="group flex flex-col items-center text-center">
                      <div className="mb-3 flex h-24 w-full items-center justify-center sm:h-28 sm:w-28">
                        <CutoutImg
                          path={award.imagePath}
                          alt={award.name}
                          className="max-h-full max-w-full object-contain drop-shadow-[0_10px_18px_rgba(20,20,9,0.18)] transition duration-300 group-hover:-translate-y-1.5 group-hover:-rotate-3"
                        />
                      </div>
                      <figcaption className="text-[11px] font-bold uppercase tracking-wider text-[#141409]/60 sm:text-xs">
                        {award.name}
                      </figcaption>
                    </figure>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      )}
    </section>
  );
}
