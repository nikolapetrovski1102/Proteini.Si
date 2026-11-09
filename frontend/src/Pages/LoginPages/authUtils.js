import { useEffect, useState } from "react";

export function checkPasswordStrength(pwd = "") {
  const requirements = {
    minLength: pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    digit: /[0-9]/.test(pwd),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  };
  const metCount = Object.values(requirements).filter(Boolean).length;
  return {
    requirements,
    metCount,
    isValid: metCount === 5,
    strengthPercent: metCount * 20,
  };
}

/** Seconds left until `until` (epoch ms), ticking once a second. */
export function useCountdown(until) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!until) return undefined;
    let id;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (t >= until) clearInterval(id);
    };
    const first = setTimeout(tick, 0);
    id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [until]);
  return until ? Math.max(0, Math.ceil((until - now) / 1000)) : 0;
}
