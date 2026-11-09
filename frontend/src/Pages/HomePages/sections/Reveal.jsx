import { useInView } from "./useInView";

// Slides/fades its children in when they enter the viewport.
// once={false} also fades them back out when they leave it.
export default function Reveal({ variant = "up", delay = 0, once = true, className = "", children, ...rest }) {
  const [ref, inView] = useInView(once ? undefined : { threshold: 0, rootMargin: "-12% 0px -12% 0px", once: false });
  const variantClass = variant === "left" ? "reveal-left" : variant === "scale" ? "reveal-scale" : "";
  return (
    <div
      ref={ref}
      className={`reveal ${variantClass} ${inView ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </div>
  );
}
