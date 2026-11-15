// Custom shop icons: chunky 24px line drawings with one brand-yellow fill, so each
// reads at a glance (a tub for protein, a scale for weight loss, a shaker for
// accessories...). The outline follows `currentColor`, so icons pick up the
// surrounding text colour.
//
// Dark theme (see index.css): outlines turn light, yellow shapes are outlined in
// yellow so they read as solid glyphs, and detail lines drawn on top of the yellow
// (marked with INK) switch to a dark ink so they stay legible.

const ACCENT = "var(--icon-accent, #FDC700)";
const INK = "shop-icon-ink";

function Svg({ className = "h-6 w-6", strokeWidth = 1.9, children, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`shop-icon ${className}`}
      {...rest}
    >
      {children}
    </svg>
  );
}

const icon = (paths) => {
  const Icon = (props) => <Svg {...props}>{paths}</Svg>;
  return Icon;
};

/* ------------------------------------------------------------- categories */

export const DumbbellIcon = icon(
  <>
    <path d="M7 12h10" />
    <rect x="3.5" y="6.5" width="3.5" height="11" rx="1.2" fill={ACCENT} />
    <rect x="17" y="6.5" width="3.5" height="11" rx="1.2" fill={ACCENT} />
    <path d="M1.8 10v4M22.2 10v4" />
  </>,
);

export const ProteinTubIcon = icon(
  <>
    <path d="M6 7.5h12l-.8 11.7A2 2 0 0 1 15.2 21H8.8a2 2 0 0 1-2-1.8L6 7.5z" />
    <rect x="4.8" y="3" width="14.4" height="4.5" rx="1.3" fill={ACCENT} />
    <path d="M8.6 12.2h6.8M8.6 15.8h4.4" />
  </>,
);

export const ScaleIcon = icon(
  <>
    <rect x="3" y="3.5" width="18" height="17.5" rx="4" />
    <path d="M7.5 11a4.5 4.5 0 0 1 9 0z" fill={ACCENT} />
    <path className={INK} d="M12 11l2-2.6" />
    <path d="M8 16.5h2.5M13.5 16.5H16" />
  </>,
);

export const CapsuleIcon = icon(
  <g transform="rotate(-45 12 12)">
    <path d="M7 12v4.5a5 5 0 0 0 10 0V12z" fill={ACCENT} />
    <rect x="7" y="2.5" width="10" height="19" rx="5" />
    <path d="M7 12h10" />
  </g>,
);

export const BarIcon = icon(
  <>
    <rect x="5" y="7.5" width="14" height="9" rx="1.5" fill={ACCENT} />
    <path d="M5 9L2.5 8v8L5 15M19 9l2.5-1v8L19 15" />
    <path className={INK} d="M9.7 7.5v9M14.3 7.5v9" />
  </>,
);

export const ShakerIcon = icon(
  <>
    <path d="M9.5 2.5h5V5h-5z" />
    <path d="M7 8.5h10l-1 11.6a1.5 1.5 0 0 1-1.5 1.4h-5A1.5 1.5 0 0 1 8 20.1z" />
    <rect x="6" y="5" width="12" height="3.5" rx="1" fill={ACCENT} />
    <path d="M10 12.5h2.5M10 15.5h2.5" />
  </>,
);

export const TShirtIcon = icon(
  <path d="M9 3L4 5 2 10l4 1.5V21h12v-9.5l4-1.5-2-5-5-2a3 3 0 0 1-6 0z" fill={ACCENT} />,
);

export const FlameIcon = icon(
  <>
    <path
      d="M12 22c4 0 7-2.7 7-7 0-3.5-2.2-6-4-8-.3 2-1.3 3.2-2.5 3.6C13 7.5 11.5 4.5 9 2.5 9 6.5 5 9 5 15c0 4.3 3 7 7 7z"
      fill={ACCENT}
    />
    <path className={INK} d="M12 22c-1.7 0-3-1.2-3-3 0-2 1.5-3 3-5 1.5 2 3 3 3 5 0 1.8-1.3 3-3 3z" />
  </>,
);

export const BoltIcon = icon(<path d="M13.5 2L4.5 13.5H11L10 22l9-11.5h-6.5z" fill={ACCENT} />);

export const BicepIcon = icon(
  <>
    <path
      d="M2.5 21v-6.5c1.2-5 7.5-6.2 9.8-1.8l1.8-4.3-1-3c-.4-1.3.5-2.4 1.8-2.4h3.3c1.3 0 2 1.4 1.4 2.5l-1 1.7L20.5 17c.4 2.2-1.2 4-3.4 4z"
      fill={ACCENT}
    />
    <path className={INK} d="M6.5 16.5c1.4-.7 3-.6 4.3.3" />
  </>,
);

export const CanIcon = icon(
  <>
    <path d="M8 5.5L9 3h6l1 2.5" />
    <rect x="7" y="5.5" width="10" height="15.5" rx="2" fill={ACCENT} />
    <path className={INK} d="M7 10h10M7 16.5h10" />
  </>,
);

export const BoxingGloveIcon = icon(
  <>
    <path
      d="M6 13V8.5A5.5 5.5 0 0 1 11.5 3h2A5.5 5.5 0 0 1 19 8.5V13a4.5 4.5 0 0 1-2.5 4V18h-9v-1.2A4.2 4.2 0 0 1 6 13z"
      fill={ACCENT}
    />
    <path className={INK} d="M11 13H8.8A2.8 2.8 0 0 1 6 10.2" />
    <rect x="7" y="18" width="10" height="3.5" rx="1" />
  </>,
);

export const MoleculeIcon = icon(
  <>
    <path d="M10.4 9.2l-3 5.3M13.6 9.2l3 5.3M8.6 17.5h6.8" />
    <circle cx="12" cy="6.5" r="3" fill={ACCENT} />
    <circle cx="6" cy="17.5" r="2.6" />
    <circle cx="18" cy="17.5" r="2.6" />
  </>,
);

export const LeafIcon = icon(
  <>
    <path d="M5 19C5 10 10.5 4.5 20 4c0 9.5-5.5 15-15 15z" fill={ACCENT} />
    <path className={INK} d="M4 20c3.5-5 7-8.5 11-11" />
  </>,
);

export const ShieldHeartIcon = icon(
  <>
    <path d="M12 21.5c-5-2-8-5.5-8-10.5V5.5l8-3 8 3V11c0 5-3 8.5-8 10.5z" />
    <path d="M12 16s-4-2.4-4-5.2a2.1 2.1 0 0 1 4-1.2 2.1 2.1 0 0 1 4 1.2C16 13.6 12 16 12 16z" fill={ACCENT} />
  </>,
);

export const MoonIcon = icon(
  <>
    <path d="M19.5 14.5A8.5 8.5 0 1 1 9.5 4.5a6.8 6.8 0 0 0 10 10z" fill={ACCENT} />
    <path d="M17.5 3v3.5M15.75 4.75h3.5" />
  </>,
);

export const GiftIcon = icon(
  <>
    <path d="M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8" fill={ACCENT} />
    <rect x="3.5" y="8" width="17" height="4" rx="1" />
    <path d="M12 8v4" />
    <path className={INK} d="M12 12v9" />
    <path d="M12 8C10.5 5 7 4 7 6.2 7 7.5 9 8 12 8zM12 8c1.5-3 5-4 5-1.8C17 7.5 15 8 12 8z" />
  </>,
);

/* ----------------------------------------------------------------- offers */

const STARBURST =
  "M12 2l2.4 1.8 3-.2.9 2.9 2.5 1.7-1 2.8 1 2.8-2.5 1.7-.9 2.9-3-.2L12 22l-2.4-1.8-3 .2-.9-2.9-2.5-1.7 1-2.8-1-2.8 2.5-1.7.9-2.9 3 .2z";

export const SaleIcon = icon(
  <>
    <path d={STARBURST} fill={ACCENT} />
    <g className={INK}>
      <path d="M9 15l6-6" />
      <circle cx="9.4" cy="9.4" r="1.2" />
      <circle cx="14.6" cy="14.6" r="1.2" />
    </g>
  </>,
);

export const CalendarIcon = icon(
  <>
    <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
    <path d="M3 9.5V7a2.5 2.5 0 0 1 2.5-2.5h13A2.5 2.5 0 0 1 21 7v2.5z" fill={ACCENT} />
    <path d="M8 2.5v4M16 2.5v4" />
    <path d="M8 13.5h.01M12 13.5h.01M16 13.5h.01M8 17.2h.01M12 17.2h.01" strokeWidth={2.8} />
  </>,
);

export const PriceTagIcon = icon(
  <>
    <path
      d="M3 12.2V4.5A1.5 1.5 0 0 1 4.5 3h7.7c.4 0 .8.16 1.06.44l7.3 7.3a1.5 1.5 0 0 1 0 2.12l-7.7 7.7a1.5 1.5 0 0 1-2.12 0l-7.3-7.3A1.5 1.5 0 0 1 3 12.2z"
      fill={ACCENT}
    />
    <circle className={INK} cx="8" cy="8" r="1.6" />
  </>,
);

export const MedalIcon = icon(
  <>
    <path d="M7.5 2.5L10 9.3M16.5 2.5L14 9.3M6 2.5h3M15 2.5h3" />
    <circle cx="12" cy="15" r="6.2" fill={ACCENT} />
    <path className={INK} d="M11 13.4l1.5-1v5.6" />
  </>,
);

export const SparkleIcon = icon(
  <>
    <path d="M10 2.5l1.9 5.6 5.6 1.9-5.6 1.9L10 17.5l-1.9-5.6L2.5 10l5.6-1.9z" fill={ACCENT} />
    <path d="M18.5 14v7M15 17.5h7" />
  </>,
);

export const GridIcon = icon(
  <>
    <rect x="3" y="3" width="7.5" height="7.5" rx="2" fill={ACCENT} />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
  </>,
);

/* --------------------------------------------------------- filter groups */

export const BanknoteIcon = icon(
  <>
    <rect x="2.5" y="6" width="19" height="12" rx="2" fill={ACCENT} />
    <g className={INK}>
      <circle cx="12" cy="12" r="2.8" />
      <path d="M6 9.5v5M18 9.5v5" />
    </g>
  </>,
);

export const ChecklistIcon = icon(
  <>
    <rect x="4" y="3.5" width="16" height="17.5" rx="2.5" />
    <rect x="8.5" y="2" width="7" height="3.4" rx="1" fill={ACCENT} />
    <path d="M7.8 10.2l1.5 1.5 2.5-2.5M7.8 16l1.5 1.5 2.5-2.5M14.2 10.5h2.3M14.2 16.3h2.3" />
  </>,
);

export const SealCheckIcon = icon(
  <>
    <path d={STARBURST} fill={ACCENT} />
    <path className={INK} d="M8.5 12.2l2.4 2.3 4.6-4.8" />
  </>,
);

export const TargetIcon = icon(
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5.5" fill={ACCENT} />
    <circle className={INK} cx="12" cy="12" r="1.8" />
  </>,
);

export const SneakerIcon = icon(
  <>
    <path
      d="M2.5 17V8.6c0-.6.6-1 1.2-.8 1.6.6 3.4.5 4.8-.6l1-.8 2.5 3.4c1.5 2 3.6 3.2 6 3.6l1.5.3c1.6.3 2.5 1.6 2.5 3V17z"
      fill={ACCENT}
    />
    <path d="M2.5 17h19v1.5a1.5 1.5 0 0 1-1.5 1.5H4a1.5 1.5 0 0 1-1.5-1.5z" />
    <path className={INK} d="M10.8 10.6l1.6-1.2M12.8 12.8l1.6-1.2" />
  </>,
);

export const StopwatchIcon = icon(
  <>
    <circle cx="12" cy="13.5" r="7.5" fill={ACCENT} />
    <path className={INK} d="M12 13.5V9.8" />
    <path d="M9.5 2.5h5M12 2.5V6M18.4 6.6l1.6-1.6" />
  </>,
);

export const IceCreamIcon = icon(
  <>
    <path d="M6.5 10.5L12 22l5.5-11.5" />
    <path d="M6.5 10.5a5.5 5.5 0 1 1 11 0z" fill={ACCENT} />
    <path d="M9.2 14.5l4.4 3M14.8 14.5l-4.4 3" />
  </>,
);

export const HashIcon = icon(
  <>
    <rect x="8.2" y="9" width="7.6" height="6" fill={ACCENT} stroke="none" />
    <path d="M9.5 3.5L7.5 20.5M16.5 3.5l-2 17M4 9h16.5M3.5 15H20" />
  </>,
);

export const BoxIcon = icon(
  <>
    <path d="M3.5 7.5L12 3l8.5 4.5L12 12z" fill={ACCENT} />
    <path d="M3.5 7.5v9L12 21l8.5-4.5v-9M12 12v9" />
  </>,
);
