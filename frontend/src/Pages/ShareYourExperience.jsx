import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiArrowUpRight, FiChevronLeft, FiChevronRight, FiHeart, FiInstagram, FiX } from "react-icons/fi";
import { useLanguage } from "./translation/LanguageContext";
import { api } from "../services/api";
import { InlineLoader } from "./Components/Loaders/BrandLoader";
import Reveal from "./HomePages/sections/Reveal";

const DEFAULT_HANDLE = "proteini.si_makedonija";
const VISIBLE = 5; // one featured tile + four small ones

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (/^(https?:|blob:|data:)/.test(imagePath)) return imagePath;
  if (imagePath.startsWith("/")) return `${import.meta.env.VITE_IMAGE_BASE_URL || "https://proteini.mk"}${imagePath}`;
  return imagePath;
};

// "https://www.instagram.com/p/DBowZDzsPCh/?utm_source=…" → "DBowZDzsPCh"
const shortcodeOf = (url) => url?.match(/instagram\.com\/(?:[\w.]+\/)?(?:p|reel|reels|tv)\/([\w-]+)/i)?.[1] || null;

// Instagram's official embed: always shows the real post, even when our copy of the picture is missing.
const embedUrlOf = (url) => {
  const code = shortcodeOf(url);
  return code ? `https://www.instagram.com/p/${code}/embed/captioned/` : null;
};

const embedMediaOf = (url) => {
  const code = shortcodeOf(url);
  return code ? `https://www.instagram.com/p/${code}/embed/` : null;
};

const formatLikes = (n) => Number(n || 0).toLocaleString("mk-MK");

export default function ShareYourExperience() {
  const { translate } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [broken, setBroken] = useState(() => new Set());
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    let alive = true;
    api
      .getInstagramPosts()
      .then((data) => alive && setPosts(Array.isArray(data) ? data : []))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const markBroken = useCallback((id) => {
    setBroken((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  const handle = useMemo(() => posts.find((p) => p.postedBy)?.postedBy || DEFAULT_HANDLE, [posts]);
  const profileUrl = `https://www.instagram.com/${handle}/`;
  const visible = posts.slice(0, VISIBLE);

  return (
    <section
      id="social"
      className="ig-section home-section home-tint relative w-full overflow-hidden bg-[#f6f5f1] py-14 sm:py-24"
    >
      {/* soft brand glow behind the grid */}
      <div
        aria-hidden="true"
        className="ig-glow pointer-events-none absolute -right-40 top-10 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(253,199,0,0.28),transparent_65%)]"
      />
      <div
        aria-hidden="true"
        className="ig-glow pointer-events-none absolute -left-48 bottom-0 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(221,42,123,0.12),transparent_65%)]"
      />

      <div className="relative mx-auto w-full max-w-[1240px] px-4 sm:px-[25px]">
        <Reveal className="mb-8 flex flex-col gap-5 sm:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="mb-3 block h-1.5 w-12 rounded-full bg-[#FDC700]" aria-hidden="true" />
            <h2 className="ig-heading font-display text-[34px] font-bold uppercase leading-[0.95] tracking-tight text-[#141409] sm:text-6xl">
              <span className="text-[#FDC700]">#</span>proteinisi
            </h2>
            <p className="ig-muted mt-3 max-w-md text-[15px] font-medium text-[#55554d] sm:text-base">
              {translate("shareYourExperience")}. {translate("igTagUs")}
            </p>
          </div>

          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 self-start rounded-full bg-[#141409] py-2 pl-2 pr-5 text-white shadow-[0_10px_30px_-12px_rgba(20,20,9,0.6)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDC700] focus-visible:ring-offset-2 md:self-auto"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)]">
              <FiInstagram size={20} aria-hidden="true" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/60">{translate("igFollowUs")}</span>
              <span className="text-sm font-bold">@{handle}</span>
            </span>
            <FiArrowUpRight size={18} className="ml-1 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </a>
        </Reveal>

        {loading ? (
          <div className="flex justify-center py-20">
            <InlineLoader size={36} />
          </div>
        ) : visible.length === 0 ? (
          <div className="ig-muted rounded-3xl border border-dashed border-black/10 py-16 text-center text-[#55554d]">
            {translate("noInstagramPosts")}
          </div>
        ) : (
          <Reveal className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {visible.map((post, i) => (
              <PostTile
                key={post.id}
                post={post}
                featured={i === 0}
                broken={broken.has(post.id) || !post.imagePath}
                onBroken={() => markBroken(post.id)}
                onOpen={() => setOpenIndex(i)}
                fallbackHandle={handle}
              />
            ))}
          </Reveal>
        )}
      </div>

      {openIndex !== null && posts[openIndex] && (
        <PostModal
          posts={posts}
          index={openIndex}
          setIndex={setOpenIndex}
          broken={broken}
          onBroken={markBroken}
          fallbackHandle={handle}
          translate={translate}
        />
      )}
    </section>
  );
}

function PostTile({ post, featured, broken, onBroken, onOpen, fallbackHandle }) {
  const caption = post.description?.trim();
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={caption ? caption.slice(0, 80) : "Instagram post"}
      className={`group relative aspect-square overflow-hidden rounded-2xl bg-[#141409] text-left shadow-[0_18px_40px_-24px_rgba(20,20,9,0.55)] ring-1 ring-black/5 transition duration-500 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDC700] focus-visible:ring-offset-2 sm:rounded-3xl ${
        featured ? "col-span-2 row-span-2" : ""
      }`}
    >
      {broken ? (
        embedMediaOf(post.postUrl) ? (
          <EmbedMedia url={embedMediaOf(post.postUrl)} title={caption} />
        ) : (
          <TextTile caption={caption} handle={post.postedBy || fallbackHandle} featured={featured} />
        )
      ) : (
        <img
          src={getImageUrl(post.imagePath)}
          alt={caption || "Instagram post"}
          loading="lazy"
          onError={onBroken}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
        />
      )}

      {/* IG badge */}
      <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#141409] shadow-sm backdrop-blur transition group-hover:scale-110 sm:h-9 sm:w-9">
        <FiInstagram size={16} aria-hidden="true" />
      </span>

      {/* bottom info: always on the featured tile, on hover for the small ones */}
      {(!broken || embedMediaOf(post.postUrl)) && (
        <div
          className={`absolute inset-x-0 bottom-0 flex flex-col gap-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-14 text-white transition duration-300 sm:p-5 sm:pt-16 ${
            featured ? "" : "md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
          }`}
        >
          {featured && caption && <p className="line-clamp-2 text-sm font-medium leading-snug sm:text-base">{caption}</p>}
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold sm:text-sm">
            <FiHeart size={14} className="fill-current text-[#ff4d6d]" aria-hidden="true" />
            {formatLikes(post.likeCount)}
          </span>
        </div>
      )}
    </button>
  );
}

// The plain (uncaptioned) embed, rendered at a fixed width, scaled to the tile and shifted up past
// Instagram's 54px profile header so only the photo shows. Clicks go to the tile underneath.
const EMBED_W = 400;
const EMBED_HEADER = 54;
function EmbedMedia({ url, title }) {
  const ref = useRef(null);
  const [box, setBox] = useState(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const measure = () => setBox(node.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);
  const scale = box ? box / EMBED_W : 1;
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden bg-[#0e0e0a]">
      {box && (
        <iframe
          src={url}
          title={title?.slice(0, 80) || "Instagram post"}
          loading="lazy"
          scrolling="no"
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 origin-top-left border-0"
          style={{
            width: EMBED_W,
            height: EMBED_W * 1.4 + EMBED_HEADER,
            top: -EMBED_HEADER * scale,
            transform: `scale(${scale})`,
          }}
        />
      )}
    </div>
  );
}

// Used when there is neither a picture nor a usable post link: a branded caption card.
function TextTile({ caption, handle, featured }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-between bg-[radial-gradient(120%_90%_at_100%_0%,rgba(253,199,0,0.35),transparent_55%),radial-gradient(90%_80%_at_0%_100%,rgba(214,41,118,0.35),transparent_60%)] p-4 text-white sm:p-6">
      <span className="font-display text-4xl font-bold leading-none text-[#FDC700] sm:text-5xl">“</span>
      <p
        className={`font-medium leading-snug text-white/90 ${
          featured ? "line-clamp-6 text-lg sm:text-2xl" : "line-clamp-4 text-xs sm:text-sm"
        }`}
      >
        {caption || "#proteinisi"}
      </p>
      <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-white/60 sm:text-xs">@{handle}</span>
    </div>
  );
}

function PostModal({ posts, index, setIndex, broken, onBroken, fallbackHandle, translate }) {
  const post = posts[index];
  const hasPrev = index > 0;
  const hasNext = index < posts.length - 1;
  const close = useCallback(() => setIndex(null), [setIndex]);
  const prev = useCallback(() => hasPrev && setIndex(index - 1), [hasPrev, index, setIndex]);
  const next = useCallback(() => hasNext && setIndex(index + 1), [hasNext, index, setIndex]);

  const embedUrl = embedUrlOf(post.postUrl);
  const showEmbed = (broken.has(post.id) || !post.imagePath) && embedUrl;
  const caption = post.description?.trim();
  const handle = post.postedBy || fallbackHandle;

  // Lock page scroll without jumping back to the top.
  useEffect(() => {
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, prev, next]);

  const navBtn =
    "flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 disabled:pointer-events-none disabled:opacity-30";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={caption?.slice(0, 80) || "Instagram post"}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-0 backdrop-blur-sm sm:p-6"
      onClick={close}
    >
      <button
        type="button"
        onClick={close}
        aria-label="Close"
        className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:right-6 sm:top-6"
      >
        <FiX size={22} />
      </button>

      <button type="button" aria-label="Previous" onClick={(e) => (e.stopPropagation(), prev())} disabled={!hasPrev} className={`${navBtn} absolute left-6 top-1/2 z-20 hidden -translate-y-1/2 md:flex`}>
        <FiChevronLeft size={24} />
      </button>
      <button type="button" aria-label="Next" onClick={(e) => (e.stopPropagation(), next())} disabled={!hasNext} className={`${navBtn} absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 md:flex`}>
        <FiChevronRight size={24} />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full flex-col overflow-y-auto overscroll-contain bg-white sm:h-auto sm:max-h-[88vh] sm:max-w-[960px] sm:overflow-hidden sm:rounded-3xl md:flex-row"
      >
        {/* media */}
        <div className="flex shrink-0 items-center justify-center bg-[#0e0e0a] md:w-[56%]">
          {showEmbed ? (
            <iframe
              key={embedUrl}
              src={embedUrl}
              title={caption?.slice(0, 80) || "Instagram post"}
              loading="lazy"
              allowTransparency
              className="h-[70vh] w-full max-w-[480px] border-0 bg-white md:h-[88vh] md:max-h-[720px]"
            />
          ) : (
            <img
              key={post.id}
              src={getImageUrl(post.imagePath)}
              alt={caption || "Instagram post"}
              onError={() => onBroken(post.id)}
              className="max-h-[60vh] w-full object-contain md:max-h-[88vh]"
            />
          )}
        </div>

        {/* details */}
        <div className="flex min-h-0 flex-1 flex-col p-5 sm:p-7">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)] p-[2px]">
              <span className="flex h-full w-full items-center justify-center rounded-full bg-white text-[#141409]">
                <FiInstagram size={16} />
              </span>
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-900">@{handle}</p>
              {post.postedDate && (
                <p className="text-xs text-gray-500">{new Date(post.postedDate).toLocaleDateString("mk-MK", { day: "numeric", month: "long", year: "numeric" })}</p>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 py-4 md:overflow-y-auto">
            {caption ? (
              <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-gray-700">{caption}</p>
            ) : (
              <p className="text-sm text-gray-500">#proteinisi</p>
            )}
          </div>

          <div className="space-y-3 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-1.5 font-semibold text-gray-900">
                <FiHeart size={16} className="fill-current text-[#ff4d6d]" aria-hidden="true" />
                {formatLikes(post.likeCount)}
              </span>
              <span className="text-xs font-medium text-gray-500">
                {index + 1} / {posts.length}
              </span>
            </div>
            <a
              href={post.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#141409] py-3 text-sm font-bold text-white transition hover:bg-black"
            >
              <FiInstagram size={16} aria-hidden="true" />
              {translate("igViewPost")}
              <FiArrowUpRight size={16} aria-hidden="true" />
            </a>
            <div className="flex gap-3 md:hidden">
              <button type="button" onClick={prev} disabled={!hasPrev} className="flex flex-1 items-center justify-center gap-1 rounded-full bg-gray-100 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-40">
                <FiChevronLeft size={16} /> {translate("igPrev")}
              </button>
              <button type="button" onClick={next} disabled={!hasNext} className="flex flex-1 items-center justify-center gap-1 rounded-full bg-gray-100 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-40">
                {translate("igNext")} <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
