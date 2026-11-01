import { useEffect, useState, useRef } from "react";
import { FaPlay } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { useLanguage } from "./translation/LanguageContext";
import { api } from "../services/api";

export default function Video() {
  const { translate } = useLanguage();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const thumbsRef = useRef(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  // Track arrow visibility
  const [showUpArrow, setShowUpArrow] = useState(false);
  const [showDownArrow, setShowDownArrow] = useState(true);

  // Helper function to get full image URL
  const getThumbnailUrl = (thumbnailPath) => {
    if (!thumbnailPath) return null;
    if (thumbnailPath.startsWith("http")) return thumbnailPath;
    if (thumbnailPath.startsWith("/")) {
      return `https://proteini.mk${thumbnailPath}`;
    }
    return thumbnailPath;
  };

  // Extract YouTube embed URL from various formats
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";

    // If it's already an embed URL, return as is
    if (url.includes("/embed/")) return url;

    // Extract video ID from different URL formats
    let videoId = null;

    // Format: https://www.youtube.com/watch?v=VIDEO_ID
    if (url.includes("watch?v=")) {
      videoId = url.split("watch?v=")[1]?.split("&")[0];
    }
    // Format: https://youtu.be/VIDEO_ID
    else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    }
    // Format: https://www.youtube.com/embed/VIDEO_ID
    else if (url.includes("/embed/")) {
      videoId = url.split("/embed/")[1]?.split("?")[0];
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }

    return url;
  };

  // Fetch videos from API
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const data = await api.getYouTubeVideos();
      setVideos(data);
      if (data && data.length > 0) {
        setSelectedVideo(data[0]);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Scroll function
  const scrollThumbnails = (direction) => {
    if (!thumbsRef.current) return;

    if (direction === "top") {
      thumbsRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else if (direction === "bottom") {
      thumbsRef.current.scrollTo({
        top: thumbsRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // Update arrow visibility function
  const updateArrowVisibility = () => {
    if (!thumbsRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = thumbsRef.current;

    const tolerance = 2;
    setShowUpArrow(scrollTop > 0);
    setShowDownArrow(
      Math.ceil(scrollTop + clientHeight) < scrollHeight - tolerance,
    );
  };

  useEffect(() => {
    if (thumbsRef.current) {
      updateArrowVisibility();
      thumbsRef.current.addEventListener("scroll", updateArrowVisibility);
      return () =>
        thumbsRef.current?.removeEventListener("scroll", updateArrowVisibility);
    }
  }, [videos]);

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") closePopup();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleImageError = (videoId) => {
    setImageErrors((prev) => ({ ...prev, [videoId]: true }));
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center sm:pt-[80px] sm:pb-[94px] bg-black">
        <div className="w-full max-w-[1240px] flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="w-full flex justify-center sm:pt-[80px] sm:pb-[94px] bg-black">
        <div className="w-full max-w-[1240px] flex flex-col text-center">
          <span className="text-[24px] max-sm:text-[20px] mb-[7px] text-white font-bold">
            {translate("video")}
          </span>
          <span className="text-[#FDC700] text-[13px] font-extrabold">
            {translate("showAll")}
            {" >"}
          </span>
          <div className="text-center py-20 text-gray-500">
            No videos available. Check back soon!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center sm:pt-[80px] sm:pb-[94px] pt-12 pb-12 bg-black">
      <div className="w-full max-w-[1240px] flex flex-col">
        {/* TITLE */}
        <div className="flex flex-col mb-[50px] items-center">
          <span className="text-[24px] max-sm:text-[20px] mb-[7px] text-white font-bold">
            {translate("video")}
          </span>
          <span className="text-[#FDC700] text-[13px] font-extrabold">
            {translate("showAll")}
            {" >"}
          </span>
        </div>

        <div className="flex max-md:flex-col w-full gap-[20px] px-4">
          {/* MAIN VIDEO */}
          {selectedVideo && (
            <div className="cursor-pointer group flex-1" onClick={openPopup}>
              <div className="relative w-full aspect-video bg-gray-800">
                {!imageErrors[selectedVideo.id] ? (
                  <img
                    src={getThumbnailUrl(selectedVideo.thumbnailPath)}
                    alt={selectedVideo.title}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(selectedVideo.id)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <span className="text-gray-400">
                      Thumbnail not available
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 hover:bg-black/70 transition flex items-center justify-center">
                  <FaPlay className="text-white text-6xl transform group-hover:scale-125 transition duration-300" />
                </div>
              </div>
              <div className="mt-[16px]">
                <span className="text-white font-bold">
                  {selectedVideo.title}
                </span>
              </div>
              {selectedVideo.viewCount > 0 && (
                <div className="mt-1 text-gray-400 text-sm">
                  👁️ {selectedVideo.viewCount.toLocaleString()} views
                </div>
              )}
            </div>
          )}

          {/* THUMBNAILS */}
          <div className="relative lg:w-1/3">
            {showUpArrow && (
              <button
                onClick={() => scrollThumbnails("top")}
                className="absolute top-[0px] left-[20%] transform -translate-x-1/2 z-10 bg-white bg-opacity-50 text-black w-[60px] h-[60px] flex justify-center items-center max-md:hidden"
              >
                <IoIosArrowUp size={25} color="#00000072" />
              </button>
            )}

            <div
              ref={thumbsRef}
              className="thumbs-container flex flex-col max-md:flex-row gap-[10px] md:max-h-[460px] sm:max-h-[350px] max-h-[200px] relative overflow-y-auto"
            >
              {videos.map((item, index) => (
                <div
                  key={item.id}
                  className={`min-w-[130px] flex mb-[16px] cursor-pointer transition-opacity hover:opacity-80 ${
                    selectedVideo?.id === item.id ? "opacity-100" : "opacity-70"
                  }`}
                  onClick={() => setSelectedVideo(item)}
                >
                  {!imageErrors[item.id] ? (
                    <img
                      src={getThumbnailUrl(item.thumbnailPath)}
                      alt={item.title}
                      className="w-[178px] h-[100px] object-cover"
                      onError={() => handleImageError(item.id)}
                    />
                  ) : (
                    <div className="w-[178px] h-[100px] bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}
                  <span className="text-white text-[13px] font-bold pl-[15px] max-lg:hidden line-clamp-2">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>

            {showDownArrow && (
              <button
                onClick={() => scrollThumbnails("bottom")}
                className="absolute bottom-[0px] left-[20%] transform -translate-x-1/2 z-10 bg-white bg-opacity-50 text-black w-[60px] h-[60px] flex justify-center items-center max-md:hidden"
              >
                <IoIosArrowDown size={25} color="#00000072" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* POPUP */}
      {isPopupOpen && selectedVideo && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={closePopup}
        >
          <div
            className="relative w-[80vw] max-w-[1200px] aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closePopup}
              className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300 transition"
            >
              ✕
            </button>
            <iframe
              className="w-full h-full rounded-lg"
              src={`${getYouTubeEmbedUrl(selectedVideo.videoUrl)}?autoplay=1&rel=0`}
              title={selectedVideo.title}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
