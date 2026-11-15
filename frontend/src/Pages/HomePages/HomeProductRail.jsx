import { useCallback, useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

/**
 * Horizontal, snap-scrolling product row.
 *
 *  controls="side"   – arrow buttons float over the row edges, only when there is something to scroll to
 *  controls="bottom" – a draggable scrollbar under the row, with the arrow buttons below it
 *  tone="dark"       – light scrollbar for dark section backgrounds
 */
export default function HomeProductRail({ children, label = "products", controls = "side", tone = "light" }) {
  const ref = useRef(null);
  const trackRef = useRef(null);
  const [state, setState] = useState({ start: true, end: true, thumb: 1, offset: 0 });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const thumb = el.scrollWidth > 0 ? Math.min(1, el.clientWidth / el.scrollWidth) : 1;
    setState({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft >= max - 4,
      thumb,
      offset: max > 0 ? (el.scrollLeft / max) * (1 - thumb) : 0,
    });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return undefined;
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    observer?.observe(el);
    return () => observer?.disconnect();
  }, [update, children]);

  const scroll = (direction) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  };

  // Scrollbar: click the track to jump there, drag the thumb to scrub.
  const scrubTo = (clientX, grabRatio) => {
    const el = ref.current;
    const track = trackRef.current;
    if (!el || !track) return;
    const rect = track.getBoundingClientRect();
    const usable = rect.width * (1 - state.thumb);
    if (usable <= 0) return;
    const left = clientX - rect.left - grabRatio * rect.width * state.thumb;
    const ratio = Math.min(1, Math.max(0, left / usable));
    el.scrollTo({ left: ratio * (el.scrollWidth - el.clientWidth), behavior: "auto" });
  };

  const onTrackPointerDown = (event) => {
    const track = trackRef.current;
    if (!track) return;
    event.preventDefault();
    const rect = track.getBoundingClientRect();
    const thumbLeft = rect.left + state.offset * rect.width;
    const thumbWidth = state.thumb * rect.width;
    const onThumb = event.clientX >= thumbLeft && event.clientX <= thumbLeft + thumbWidth;
    // Keep the grab point under the finger; a track click centres the thumb on it.
    const grab = onThumb ? (event.clientX - thumbLeft) / thumbWidth : 0.5;
    const el = ref.current;
    if (el) el.style.scrollSnapType = "none";
    scrubTo(event.clientX, grab);
    const move = (e) => scrubTo(e.clientX, grab);
    const up = () => {
      if (el) el.style.scrollSnapType = "";
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const row = (
    <div
      ref={ref}
      onScroll={update}
      className={`-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pt-2 sm:-mx-2 sm:gap-5 sm:px-2 [&::-webkit-scrollbar]:hidden ${
        controls === "bottom" ? "pb-4" : "scroll-smooth pb-8"
      }`}
      style={{ scrollbarWidth: "none" }}
    >
      {children}
    </div>
  );

  if (controls === "bottom") {
    const scrollable = state.thumb < 1;
    const button =
      "flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-900 shadow-[0_6px_20px_-8px_rgba(0,0,0,0.35)] ring-1 ring-black/5 transition duration-200 hover:bg-[#FDC700] active:scale-95 disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141409]";

    return (
      <div>
        {row}
        {scrollable && (
          <>
            <div
              ref={trackRef}
              onPointerDown={onTrackPointerDown}
              role="scrollbar"
              aria-orientation="horizontal"
              aria-valuenow={Math.round((state.offset / Math.max(1e-6, 1 - state.thumb)) * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Scroll ${label}`}
              className="group relative mt-2 flex h-5 cursor-pointer touch-none items-center"
            >
              <span className={`absolute inset-x-0 h-1 rounded-full ${tone === "dark" ? "bg-white/15" : "bg-black/10"}`} />
              <span
                className={`absolute h-1.5 rounded-full transition-[height] duration-200 group-hover:h-2 ${tone === "dark" ? "bg-[#FDC700]" : "bg-[#141409]"}`}
                style={{ width: `${state.thumb * 100}%`, left: `${state.offset * 100}%` }}
              />
            </div>
            <div className="mt-3 flex justify-center gap-3">
              <button type="button" onClick={() => scroll(-1)} disabled={state.start} aria-label={`Scroll ${label} left`} className={button}>
                <FiChevronLeft size={22} />
              </button>
              <button type="button" onClick={() => scroll(1)} disabled={state.end} aria-label={`Scroll ${label} right`} className={button}>
                <FiChevronRight size={22} />
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  const arrow =
    "absolute top-[38%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-900 shadow-[0_6px_20px_-6px_rgba(0,0,0,0.35)] ring-1 ring-black/5 transition duration-200 hover:scale-105 hover:bg-[#FDC700] sm:flex";

  return (
    <div className="relative">
      {!state.start && (
        <button type="button" onClick={() => scroll(-1)} aria-label={`Scroll ${label} left`} className={`${arrow} -left-5`}>
          <FiChevronLeft size={22} />
        </button>
      )}
      {row}
      {!state.end && (
        <button type="button" onClick={() => scroll(1)} aria-label={`Scroll ${label} right`} className={`${arrow} -right-5`}>
          <FiChevronRight size={22} />
        </button>
      )}
    </div>
  );
}
