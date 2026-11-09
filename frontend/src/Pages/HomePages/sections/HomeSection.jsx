import Reveal from "./Reveal";
import { WaveEdge } from "./Decor";

/*
 * Full-width home page band with its own background (tint, gradient, image),
 * snap alignment and a reveal-on-scroll for its content.
 *
 *  tint     – tailwind/background classes for the base layer
 *  image    – optional background image (rendered blurred/faded)
 *  imageOpacity / blur – how strongly the image shows through
 *  overlay  – extra classes for a gradient layer over the image
 *  waveTop / waveBottom – colour of the neighbouring section, drawn as a wavy edge
 *  decor    – absolutely positioned decorative elements (sparkles, stickers)
 */
export default function HomeSection({
  id,
  tint = "bg-white",
  image,
  imageOpacity = 0.18,
  blur = 0,
  overlay,
  className = "",
  minScreen = false,
  reveal = true,
  waveTop,
  waveBottom,
  decor,
  children,
}) {
  return (
    <section
      id={id}
      className={`home-section home-tint relative w-full overflow-hidden ${tint} ${
        minScreen ? "min-h-[calc(100svh-var(--header-h))] flex flex-col justify-center" : ""
      } ${className}`}
    >
      {image && (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="home-tint-overlay pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ opacity: imageOpacity, filter: blur ? `blur(${blur}px)` : undefined, transform: blur ? "scale(1.1)" : undefined }}
        />
      )}
      {overlay && <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${overlay}`} />}
      {waveTop && <WaveEdge position="top" fill={waveTop} />}
      {waveBottom && <WaveEdge position="bottom" fill={waveBottom} />}
      {decor && <div aria-hidden="true" className="pointer-events-none absolute inset-0">{decor}</div>}
      <div className="relative w-full">{reveal ? <Reveal>{children}</Reveal> : children}</div>
    </section>
  );
}
