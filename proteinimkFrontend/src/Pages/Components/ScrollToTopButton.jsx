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
        className="fixed bottom-12 right-12 z-50 bg-[#ffffff] hover:bg-[#e8e8e8] p-3 border border-[#828282] outline-none"
        aria-label="Scroll to top"
      >
        <MdOutlineArrowUpward size={24} color="#828282" />
      </button>
    )
  );
}
