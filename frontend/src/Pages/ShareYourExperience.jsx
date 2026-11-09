import { useState, useEffect, useRef } from "react";
import { useLanguage } from "./translation/LanguageContext";
import { api } from "../services/api";
import { BrandLoader } from "./Components/Loaders/BrandLoader";

export default function ShareYourExperience() {
  const { translate } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const modalContentRef = useRef(null);

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) {
      return `https://proteini.mk${imagePath}`;
    }
    return imagePath;
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await api.getInstagramPosts();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (post, index) => {
    setSelectedPost(post);
    setCurrentIndex(index);
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
  };

  const closeModal = () => {
    setSelectedPost(null);
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setSelectedPost(posts[currentIndex - 1]);
      setCurrentIndex(currentIndex - 1);
      // Reset scroll position when changing posts
      if (modalContentRef.current) {
        modalContentRef.current.scrollTop = 0;
      }
    }
  };

  const goToNext = () => {
    if (currentIndex < posts.length - 1) {
      setSelectedPost(posts[currentIndex + 1]);
      setCurrentIndex(currentIndex + 1);
      // Reset scroll position when changing posts
      if (modalContentRef.current) {
        modalContentRef.current.scrollTop = 0;
      }
    }
  };

  const openInstagramLink = (url) => {
    window.open(url, "_blank");
  };

  // Prevent scroll chaining when touching the modal content
  const handleModalTouchMove = (e) => {
    if (!modalContentRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = modalContentRef.current;
    const isAtTop = scrollTop <= 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;

    if (
      (isAtTop && e.touches[0].clientY > 0) ||
      (isAtBottom && e.touches[0].clientY < 0)
    ) {
      e.preventDefault();
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedPost) return;
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPost, currentIndex, posts]);

  if (loading) {
    return (
      <div id="social" className="home-section home-tint relative w-full flex justify-center pb-12 sm:pb-[80px] bg-gradient-to-b from-white via-[#fdf4f8] to-[#fff8e6]">
        <div className="w-full max-w-[1240px] flex flex-col text-center px-[15px]">
          <h2 className="pt-12 sm:pt-[80px] mb-2 font-display font-bold uppercase tracking-tight text-[30px] leading-[0.95] text-[#141409] sm:text-5xl">
            #proteinisi
          </h2>
          <span className="mb-6 sm:mb-[50px] text-[13px] text-[#6b6b6b] leading-[16px] font-bold">
            {translate("shareYourExperience")}
          </span>
          <div className="flex justify-center items-center py-20">
            <BrandLoader variant="scoop" size={120} />
          </div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div id="social" className="home-section home-tint relative w-full flex justify-center pb-12 sm:pb-[80px] bg-gradient-to-b from-white via-[#fdf4f8] to-[#fff8e6]">
        <div className="w-full max-w-[1240px] flex flex-col text-center px-[15px]">
          <h2 className="pt-12 sm:pt-[80px] mb-2 font-display font-bold uppercase tracking-tight text-[30px] leading-[0.95] text-[#141409] sm:text-5xl">
            #proteinisi
          </h2>
          <span className="mb-6 sm:mb-[50px] text-[13px] text-[#6b6b6b] leading-[16px] font-bold">
            {translate("shareYourExperience")}
          </span>
          <div className="text-center py-20 text-gray-500">
            {translate("noInstagramPosts")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div id="social" className="home-section home-tint relative w-full flex justify-center pb-12 sm:pb-[80px] bg-gradient-to-b from-white via-[#fdf4f8] to-[#fff8e6]">
        <div className="w-full max-w-[1240px] flex flex-col text-center px-[15px]">
          <h2 className="pt-12 sm:pt-[80px] mb-2 font-display font-bold uppercase tracking-tight text-[30px] leading-[0.95] text-[#141409] sm:text-5xl">
            #proteinisi
          </h2>
          <span className="mb-6 sm:mb-[50px] text-[13px] text-[#6b6b6b] leading-[16px] font-bold">
            {translate("shareYourExperience")}
          </span>

          {/* Grid Layout - Mobile */}
          <div className="grid grid-cols-2 gap-[10px] md:hidden">
            {posts.slice(0, 6).map((post, index) => (
              <div
                key={post.id}
                className="relative group cursor-pointer overflow-hidden rounded-xl"
                onClick={() => openModal(post, index)}
              >
                <img
                  src={getImageUrl(post.imagePath)}
                  alt={post.description || "Instagram post"}
                  className="w-full object-cover aspect-square transition duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Crect x='2' y='2' width='20' height='20' rx='2.18'%3E%3C/rect%3E%3Cpath d='M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5'%3E%3C/path%3E%3C/svg%3E";
                    e.target.onerror = null;
                  }}
                />
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <img
                    src="/logos/instagram.svg"
                    className="w-6 h-6"
                    alt="instagram"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Grid Layout - Tablet and Desktop */}
          <div
            className="hidden md:grid grid-cols-4 gap-[12px]"
            style={{ gridAutoRows: "minmax(140px, auto)" }}
          >
            {posts.slice(0, 7).map((post, index) => (
              <div
                key={post.id}
                className="relative group cursor-pointer overflow-hidden rounded-xl"
                onClick={() => openModal(post, index)}
              >
                <img
                  src={getImageUrl(post.imagePath)}
                  alt={post.description || "Instagram post"}
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Crect x='2' y='2' width='20' height='20' rx='2.18'%3E%3C/rect%3E%3Cpath d='M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5'%3E%3C/path%3E%3C/svg%3E";
                    e.target.onerror = null;
                  }}
                />
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <img
                    src="/logos/instagram.svg"
                    className="w-6 h-6"
                    alt="instagram"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal - New mobile version, old desktop version */}
      {selectedPost && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeModal}
        >
          {/* Desktop modal - original design */}
          <div
            className="hidden md:flex md:flex-row relative bg-white max-w-5xl w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Navigation Arrows - Desktop */}
            {currentIndex > 0 && (
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
              >
                <img
                  src="/logos/left-arrow.svg"
                  alt="Previous"
                  className="w-10 h-10 bg-white/80 p-2 hover:bg-white transition"
                />
              </button>
            )}
            {currentIndex < posts.length - 1 && (
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10"
              >
                <img
                  src="/logos/right-arrow.svg"
                  alt="Next"
                  className="w-10 h-10 bg-white/80 p-2 hover:bg-white transition"
                />
              </button>
            )}

            {/* Left side - Image */}
            <div className="w-1/2 bg-gray-100 flex items-center justify-center p-4">
              <img
                src={getImageUrl(selectedPost.imagePath)}
                alt={selectedPost.description || "Instagram post"}
                className="w-full h-auto max-h-[70vh] object-contain"
                onError={(e) => {
                  e.target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Crect x='2' y='2' width='20' height='20' rx='2.18'%3E%3C/rect%3E%3Cpath d='M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5'%3E%3C/path%3E%3C/svg%3E";
                  e.target.onerror = null;
                }}
              />
            </div>

            {/* Right side - Content */}
            <div className="w-1/2 p-6 flex flex-col">
              <h2 className="text-2xl font-bold mb-4 break-words">
                {selectedPost.postedBy || "Instagram User"}
              </h2>

              <div className="flex-1 mb-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                  {selectedPost.description || "No description provided."}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-red-500 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span className="text-gray-600 font-medium">
                    {selectedPost.likeCount.toLocaleString()} likes
                  </span>
                </div>
              </div>

              <button
                onClick={() => openInstagramLink(selectedPost.postUrl)}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition duration-300"
              >
                View Post on Instagram
              </button>
            </div>
          </div>

          {/* Mobile modal - full screen with scroll */}
          <div
            className="relative bg-white w-full h-full md:hidden overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
            ref={modalContentRef}
            onTouchMove={handleModalTouchMove}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Image */}
            <div className="bg-gray-100 flex items-center justify-center max-h-[50vh]">
              <img
                src={getImageUrl(selectedPost.imagePath)}
                alt={selectedPost.description || "Instagram post"}
                className="w-full h-auto max-h-full object-contain"
                onError={(e) => {
                  e.target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Crect x='2' y='2' width='20' height='20' rx='2.18'%3E%3C/rect%3E%3Cpath d='M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5'%3E%3C/path%3E%3C/svg%3E";
                  e.target.onerror = null;
                }}
              />
            </div>

            {/* Content */}
            <div className="p-4">
              <h2 className="text-xl font-bold mb-3 break-words">
                {selectedPost.postedBy || "Instagram User"}
              </h2>

              <div className="mb-4">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {selectedPost.description || "No description provided."}
                </p>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-red-500 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span className="text-gray-600 font-medium text-sm">
                    {selectedPost.likeCount.toLocaleString()} likes
                  </span>
                </div>
              </div>

              <a
                href={selectedPost.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-center rounded-lg hover:from-purple-700 hover:to-pink-700 transition duration-300 text-sm"
              >
                View Post on Instagram
              </a>

              {/* Mobile Navigation Buttons */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${
                    currentIndex === 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 active:bg-gray-300"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={goToNext}
                  disabled={currentIndex === posts.length - 1}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${
                    currentIndex === posts.length - 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 active:bg-gray-300"
                  }`}
                >
                  Next
                </button>
              </div>

              {/* Mobile counter */}
              <div className="text-center text-xs text-gray-400 mt-3">
                {currentIndex + 1} / {posts.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
