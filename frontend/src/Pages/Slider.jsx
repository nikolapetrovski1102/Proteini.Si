import { useEffect, useState, useRef } from "react";
import { api } from "../services/api";

export default function Slider() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const intervalRef = useRef(null);
  const sliderTrackRef = useRef(null);

  // Check screen size for responsive images
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch sliders from API
  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const data = await api.getHomeSliders();

        if (!data || !Array.isArray(data)) {
          console.error("Data is not an array:", data);
          setError("Invalid data format from API");
          setLoading(false);
          return;
        }

        const activeSliders = data.filter((slider) => slider.isActive === true);
        setSliders(activeSliders);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch sliders:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchSliders();
  }, []);

  // Get the correct image URL based on screen size
  const getImageUrl = (slider) => {
    if (isMobile && slider.mobileImageUrl) {
      return slider.mobileImageUrl;
    }
    return slider.imageUrl;
  };

  const updateSlider = (index) => {
    if (!sliders.length) return;
    const offset = -index * 100;
    if (sliderTrackRef.current) {
      sliderTrackRef.current.style.transform = `translateX(${offset}%)`;
    }
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    if (!sliders.length) return;
    const nextIndex = currentIndex + 1 >= sliders.length ? 0 : currentIndex + 1;
    updateSlider(nextIndex);
  };

  const prevSlide = () => {
    if (!sliders.length) return;
    const prevIndex =
      currentIndex - 1 < 0 ? sliders.length - 1 : currentIndex - 1;
    updateSlider(prevIndex);
  };

  const resetInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(nextSlide, 10000);
  };

  const handleSlideClick = (slider) => {
    if (slider.clickUrl && slider.clickUrl.trim() !== "") {
      window.location.href = slider.clickUrl;
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") {
        nextSlide();
        resetInterval();
      }
      if (e.key === "ArrowLeft") {
        prevSlide();
        resetInterval();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [currentIndex]);

  // Auto-slide
  useEffect(() => {
    if (sliders.length > 0) {
      intervalRef.current = setInterval(nextSlide, 10000);
      return () => clearInterval(intervalRef.current);
    }
  }, [currentIndex, sliders.length]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-64 lg:mt-6">
        <div className="text-gray-500">Loading slider...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center items-center h-64 lg:mt-6">
        <div className="text-red-500">Error loading slider: {error}</div>
      </div>
    );
  }

  if (sliders.length === 0) {
    return (
      <div className="w-full flex justify-center items-center h-64 lg:mt-6">
        <div className="text-gray-500">No sliders available</div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center lg:mt-6">
      <div className="w-full flex items-center justify-center lg:px-8 relative">
        {/* Left arrow */}
        <img
          src="/logos/left-arrow.svg"
          alt="leftArrow"
          className="w-12 h-12 bg-[#ffffff99] cursor-pointer z-10 absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity p-3"
          onClick={() => {
            prevSlide();
            resetInterval();
          }}
        />

        {/* Slider container */}
        <div className="overflow-hidden flex-1 lg:mx-4 relative lg:max-w-[1520px] max-lg:w-full">
          <div
            ref={sliderTrackRef}
            className="flex transition-transform duration-500 ease-in-out max-lg:w-full"
          >
            {sliders.map((slider, i) => (
              <div
                key={slider.id}
                className="w-full flex-shrink-0 cursor-pointer flex items-center justify-center"
                onClick={() => handleSlideClick(slider)}
              >
                <img
                  src={getImageUrl(slider)}
                  className="w-full object-contain"
                  style={{
                    aspectRatio: isMobile ? "" : "16/9",
                    maxHeight: isMobile ? "400px" : "570px",
                    maxWidth: "1520px",
                  }}
                  alt={`slide-${i}`}
                />
              </div>
            ))}
          </div>

          {/* Indicators */}
          {sliders.length > 1 && (
            <div className="absolute bottom-14 left-36 flex gap-2 max-md:hidden">
              {sliders.map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-1 rounded cursor-pointer transition-colors ${
                    i === currentIndex
                      ? "bg-[#e98286]"
                      : "bg-gray-400 hover:bg-gray-300"
                  }`}
                  onClick={() => {
                    updateSlider(i);
                    resetInterval();
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>

        {/* Right arrow */}
        <img
          src="/logos/right-arrow.svg"
          alt="rightArrow"
          className="w-12 h-12 bg-[#ffffff99] cursor-pointer z-10 absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity p-2.5"
          onClick={() => {
            nextSlide();
            resetInterval();
          }}
        />
      </div>
    </div>
  );
}
