import { useState, useEffect } from "react";
import { useLanguage } from "./translation/LanguageContext";
import { api } from "../services/api";
import { BrandLoader } from "./Components/Loaders/BrandLoader";
import Reveal from "./HomePages/sections/Reveal";

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

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) {
      return `https://proteini.mk${imagePath}`;
    }
    return imagePath;
  };

  const fallbackSrc =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Crect x='2' y='2' width='20' height='20' rx='2.18'%3E%3C/rect%3E%3Cpath d='M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5'%3E%3C/path%3E%3C/svg%3E";
  const onImgError = (e) => {
    e.target.src = fallbackSrc;
    e.target.onerror = null;
  };

  if (loading) {
    return (
      <section className="home-section w-full flex justify-center bg-[#f4f4f1] py-20">
        <BrandLoader variant="shaker" size={120} />
      </section>
    );
  }

  if (partners.length === 0 && awards.length === 0) return null;

  // The track scrolls by -50%, so it holds two identical halves. Each half repeats the
  // partner list until it is wide enough (~10 logos) to fill a desktop viewport.
  const animateMarquee = partners.length > 4;
  const half = animateMarquee
    ? Array.from({ length: Math.ceil(10 / partners.length) }, () => partners).flat()
    : partners;
  const marqueeItems = animateMarquee ? [...half, ...half] : partners;

  return (
    <section
      id="partners"
      className="home-section home-tint relative w-full overflow-hidden bg-gradient-to-b from-[#f4f4f1] to-white py-12 sm:py-24"
    >

      <div className="relative mx-auto w-full max-w-[1240px] px-4 sm:px-[25px]">
        {partners.length > 0 && (
          <Reveal className="mb-12 sm:mb-20">
            <div className="mb-6 text-center sm:mb-10">
              <h2 className="font-display font-bold uppercase tracking-tight text-[30px] leading-[0.95] sm:text-5xl">{translate("partners")}</h2>
            </div>

            <div
              className="marquee relative overflow-hidden"
              style={{
                maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
                WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
              }}
            >
              <div className={`flex w-max gap-4 sm:gap-6 ${animateMarquee ? "marquee-track" : "mx-auto"}`}>
                {marqueeItems.map((partner, i) => (
                  <a
                    key={`${partner.id}-${i}`}
                    href={partner.url || undefined}
                    target={partner.url ? "_blank" : undefined}
                    rel={partner.url ? "noopener noreferrer" : undefined}
                    aria-hidden={i >= partners.length ? "true" : undefined}
                    tabIndex={i >= partners.length ? -1 : undefined}
                    className="group flex h-24 w-36 flex-shrink-0 items-center justify-center rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:h-28 sm:w-44"
                    title={partner.name}
                  >
                    <img
                      src={getImageUrl(partner.imagePath)}
                      alt={partner.name}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain grayscale opacity-70 transition duration-300 group-hover:grayscale-0 group-hover:opacity-100"
                      onError={onImgError}
                    />
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {awards.length > 0 && (
          <div>
            <Reveal className="mb-6 text-center sm:mb-10">
              <h2 className="font-display font-bold uppercase tracking-tight text-[30px] leading-[0.95] sm:text-5xl">{translate("awardsAndCertificates")}</h2>
            </Reveal>

            <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
              {awards.map((award, i) => (
                <Reveal key={award.id} variant="scale" delay={Math.min(i, 8) * 80}>
                  <div className="group flex w-[104px] flex-col items-center rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-[#FDC700] sm:w-[190px] sm:p-6">
                    <div className="relative mb-2.5 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br from-[#fff6cc] to-white ring-1 ring-[#FDC700]/40 sm:mb-4 sm:h-28 sm:w-28">
                      <img
                        src={getImageUrl(award.imagePath)}
                        alt={award.name}
                        loading="lazy"
                        className="h-12 w-12 object-contain transition duration-500 group-hover:scale-110 sm:h-20 sm:w-20"
                        onError={onImgError}
                      />
                    </div>
                    <span className="text-[12px] font-semibold leading-tight text-gray-700 sm:text-[13px]">
                      {award.name}
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
