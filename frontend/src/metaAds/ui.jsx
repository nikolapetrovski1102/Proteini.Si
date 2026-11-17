// Small shared UI pieces for the Meta ads dashboard. Details are plain text joined with " · " (no pills/chips).
export const Button = ({ variant = "primary", className = "", ...props }) => {
  const styles = {
    primary: "bg-[#141409] text-white hover:bg-black disabled:bg-[#141409]/40",
    yellow: "bg-[#FDC700] text-[#141409] hover:bg-[#f0bb00] disabled:opacity-50",
    ghost: "bg-white text-[#141409] border border-[#e7e4da] hover:border-[#141409] disabled:opacity-50",
    link: "text-[#141409] underline underline-offset-2 hover:no-underline disabled:opacity-50 px-0 py-0",
  };
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    />
  );
};

export const Field = ({ label, hint, children, className = "" }) => (
  <label className={`block ${className}`}>
    <span className="block text-xs font-semibold uppercase tracking-wide text-[#6b6b63] mb-1.5">{label}</span>
    {children}
    {hint && <span className="block text-xs text-[#6b6b63] mt-1">{hint}</span>}
  </label>
);


export const Section = ({ step, title, aside, children }) => (
  <section className="bg-white border border-[#e7e4da] rounded-2xl p-5 md:p-6">
    <div className="flex items-baseline justify-between gap-4 mb-4">
      <h2 className="font-display text-xl uppercase tracking-wide">
        {step && <span className="text-[#6b6b63] mr-2">{step}</span>}
        {title}
      </h2>
      {aside && <div className="text-sm text-[#6b6b63]">{aside}</div>}
    </div>
    {children}
  </section>
);

export const Notice = ({ tone = "info", children }) => {
  const styles = {
    info: "bg-[#f6f5f1] border-[#e7e4da]",
    error: "bg-red-50 border-red-200 text-red-800",
    success: "bg-green-50 border-green-200 text-green-900",
    warn: "bg-[#FDC700]/15 border-[#FDC700]",
  };
  return <div className={`rounded-xl border px-4 py-3 text-sm ${styles[tone]}`}>{children}</div>;
};
