// src/Pages/Components/ScrollToTopButton.jsx
import { useState, useEffect } from "react";
import { MdOutlineArrowUpward } from "react-icons/md";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page scrolls down 300px
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    isVisible && (
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 z-50 hidden h-12 w-12 items-center justify-center rounded-full bg-white text-gray-700 shadow-[0_8px_24px_-8px_rgba(20,20,9,0.35)] ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:bg-[#FDC700] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141409] lg:flex"
        aria-label="Scroll to top"
      >
        <MdOutlineArrowUpward size={22} />
      </button>
    )
  );
}
