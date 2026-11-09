import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../services/api";
import { BrandLoader } from "./Components/Loaders/BrandLoader";
import { useNavigate } from "react-router-dom";

const SLIDE_MS = 8000;

// Full-screen hero carousel for the home page.
export default function Slider() {
  const navigate = useNavigate();
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  const touchStartX = useRef(null);
  const sectionRef = useRef(null);
  const [ratios, setRatios] = useState({}); // natural width/height per slide image

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .getHomeSliders()
      .then((data) => {
        if (cancelled) return;
        if (!Array.isArray(data)) {
          setError("Invalid data format from API");
          return;
        }
        setSliders(data.filter((slider) => slider.isActive === true));
      })
      .catch((err) => {
        console.error("Failed to fetch sliders:", err);
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const count = sliders.length;

  const goTo = useCallback(
    (index) => {
      if (!count) return;
      setCurrentIndex(((index % count) + count) % count);
    },
    [count],
  );

  const next = useCallback(() => goTo(currentIndex + 1), [goTo, currentIndex]);
  const prev = useCallback(() => goTo(currentIndex - 1), [goTo, currentIndex]);

  // Auto-advance; restarts whenever the slide changes so manual navigation resets the timer.
  useEffect(() => {
    if (count < 2 || paused) return;
    const timer = setTimeout(next, SLIDE_MS);
    return () => clearTimeout(timer);
  }, [count, paused, next, currentIndex]);

  useEffect(() => {
    const handleKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [next, prev]);

  const getImageUrl = (slider) =>
    isMobile && slider.mobileImageUrl ? slider.mobileImageUrl : slider.imageUrl;

  const handleSlideClick = (slider) => {
    if (slider.clickUrl && slider.clickUrl.trim() !== "") {
      const url = slider.clickUrl.trim();
      // Same-site links navigate inside the app (no full reload); anything else opens normally.
      let internal = url.startsWith("/") && !url.startsWith("//");
      let path = url;
      if (!internal) {
        try {
          const parsed = new URL(url, window.location.origin);
          if (parsed.origin === window.location.origin) {
            internal = true;
            path = parsed.pathname + parsed.search + parsed.hash;
          }
        } catch {
          /* not a URL, fall through */
        }
      }
      if (internal) navigate(path);
      else window.location.assign(url);
    }
  };

  // The hero takes the banner's own shape (width 100%, height from its aspect ratio, capped at
  // the visible screen), so the whole banner is shown and nothing is cropped on the sides.
  // Until the first image reports its size we assume the usual banner shape (3:1 desktop, 2:1 mobile).
  const firstRatio = (sliders[0] && ratios[sliders[0].id]) || (isMobile ? 2 : 3);

  // A slide whose shape differs from the hero is shown whole over a blurred copy of itself.
  const needsBackdrop = (slider) => {
    const r = ratios[slider.id];
    return Boolean(r) && Math.abs(r / firstRatio - 1) > 0.03;
  };

  if (loading) {
    return (
      <section
        className="home-section w-full flex items-center justify-center bg-[#141409]"
        style={{ aspectRatio: isMobile ? 2 : 3, maxHeight: "calc(100svh - var(--hero-top, var(--header-h)))", minHeight: 220 }}
      >
        <BrandLoader variant="shaker" size={150} />
      </section>
    );
  }

  if (error || count === 0) {
    if (error) console.error("Error loading slider:", error);
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="home-section group/hero relative w-full overflow-hidden bg-[#141409] select-none"
      style={{
        aspectRatio: firstRatio,
        maxHeight: "calc(100svh - var(--hero-top, var(--header-h)))",
      }}
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
      }}
    >
      {sliders.map((slider, i) => {
        const active = i === currentIndex;
        const backdrop = needsBackdrop(slider);
        return (
          <div
            key={slider.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              active ? "opacity-100 z-[1]" : "opacity-0 z-0 pointer-events-none"
            } ${slider.clickUrl ? "cursor-pointer" : ""}`}
            onClick={() => handleSlideClick(slider)}
            aria-hidden={!active}
          >
            {backdrop && (
              <img
                src={getImageUrl(slider)}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-125 object-cover opacity-60 blur-2xl"
              />
            )}
            <img
              src={getImageUrl(slider)}
              alt={slider.title || `slide-${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : undefined}
              onLoad={(e) => {
                const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
                if (w && h && ratios[slider.id] !== w / h) {
                  setRatios((prev) => ({ ...prev, [slider.id]: w / h }));
                }
              }}
              className="relative h-full w-full object-contain"
            />
          </div>
        );
      })}

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={prev}
            className="group absolute left-4 top-1/2 z-[3] -translate-y-1/2 flex h-11 w-11 opacity-0 group-hover/hero:opacity-100 focus-visible:opacity-100 shadow-md items-center justify-center rounded-full bg-white/70 backdrop-blur transition hover:bg-white hover:scale-105 max-sm:hidden"
          >
            <img
              src="/logos/left-arrow.svg"
              alt=""
              className="h-5 w-5 transition group-hover:-translate-x-0.5"
            />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={next}
            className="group absolute right-4 top-1/2 z-[3] -translate-y-1/2 flex h-11 w-11 opacity-0 group-hover/hero:opacity-100 focus-visible:opacity-100 shadow-md items-center justify-center rounded-full bg-white/70 backdrop-blur transition hover:bg-white hover:scale-105 max-sm:hidden"
          >
            <img
              src="/logos/right-arrow.svg"
              alt=""
              className="h-5 w-5 transition group-hover:translate-x-0.5"
            />
          </button>

          {/* Progress indicators */}
          <div
            className="absolute bottom-0.5 left-1/2 z-[3] flex -translate-x-1/2 sm:bottom-4 sm:gap-1.5 sm:rounded-full sm:bg-black/25 sm:px-2.5 sm:py-1.5"
          >
            {sliders.map((slider, i) => (
              <button
                key={slider.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === currentIndex}
                onClick={() => goTo(i)}
                className="flex h-6 items-center px-[2px] sm:h-auto sm:px-0"
              >
                <span className={`relative block h-[3px] overflow-hidden rounded-full bg-white/60 shadow-[0_1px_3px_rgba(0,0,0,0.35)] transition-[width] duration-300 sm:h-1 sm:w-10 sm:bg-white/40 sm:shadow-none ${i === currentIndex ? "w-5" : "w-2"}`}>
                {i === currentIndex && (
                  <span
                    key={`${currentIndex}-${paused}`}
                    className="absolute inset-0 origin-left rounded-full bg-[#FDC700]"
                    style={{
                      animation: paused
                        ? "none"
                        : `hero-progress ${SLIDE_MS}ms linear forwards`,
                      transform: paused ? "scaleX(1)" : undefined,
                    }}
                  />
                )}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

    </section>
  );
}
