import { useCallback, useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

/**
 * Horizontal, snap-scrolling product row with arrow buttons that only show
 * when there is something to scroll to.
 */
export default function HomeProductRail({ children, label = "products" }) {
  const ref = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
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

  const arrow =
    "absolute top-[38%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-900 shadow-[0_6px_20px_-6px_rgba(0,0,0,0.35)] ring-1 ring-black/5 transition duration-200 hover:scale-105 hover:bg-[#FDC700] sm:flex";

  return (
    <div className="relative">
      {!edges.start && (
        <button type="button" onClick={() => scroll(-1)} aria-label={`Scroll ${label} left`} className={`${arrow} -left-5`}>
          <FiChevronLeft size={22} />
        </button>
      )}
      <div
        ref={ref}
        onScroll={update}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-8 pt-2 sm:-mx-2 sm:gap-5 sm:px-2 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {children}
      </div>
      {!edges.end && (
        <button type="button" onClick={() => scroll(1)} aria-label={`Scroll ${label} right`} className={`${arrow} -right-5`}>
          <FiChevronRight size={22} />
        </button>
      )}
    </div>
  );
}
