import { useState } from "react";
import { useLanguage } from "./translation/LanguageContext";
import { api } from "../services/api";

const SOCIALS = [
  { name: "YouTube", href: "https://www.youtube.com/c/proteinisi", icon: "/logos/youtubewhite.svg" },
  { name: "Facebook", href: "https://www.facebook.com/people/Proteinisi-Makedonija/100088090903597/?share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1Zchqryyhy%2F", icon: "/logos/_facebookwhite.svg" },
  { name: "Instagram", href: "https://www.instagram.com/invites/contact/?igsh=m929e152dac0&utm_content=q2lg4bz", icon: "/logos/_instagramwhite.svg" },
  { name: "TikTok", href: "https://www.tiktok.com/@proteini.si_slovenija", icon: "/logos/tiktokwhite.svg" },
  { name: "Strava", href: "https://www.strava.com/clubs/proteinisiteam", icon: "/logos/stravaawhite.svg" },
];

export default function Subscribe() {
  const { translate } = useLanguage();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setStatus("");
    try {
      await api.subscribeNewsletter(email.trim(), "footer");
      setEmail("");
      setStatus("success");
    } catch (error) {
      setStatus(error.message || "error");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="flex w-full flex-col gap-10 py-10 md:flex-row md:items-end md:justify-between sm:py-14">
      <div className="w-full md:max-w-[560px]">
        <span className="block font-display text-3xl font-bold uppercase leading-none tracking-tight text-white">
          {translate("subscribeToENews")}
        </span>
        <p className="mt-2 mb-5 text-sm text-white/70">
          {translate("stayInformedAboutCurrent")}
        </p>
        <form onSubmit={submit} className="flex w-full overflow-hidden rounded-full bg-white p-1">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={translate("enterYourEmailAddress")}
            aria-label={translate("enterYourEmailAddress")}
            className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-[#141409] outline-none"
          />
          <button disabled={submitting} className="shrink-0 rounded-lg bg-[#FDC700] px-6 py-2.5 text-sm font-bold text-[#141409] disabled:opacity-60">
            {translate("subscribe")}
          </button>
        </form>
        {status === "success" && <p className="mt-2 text-sm text-green-400">Subscription saved.</p>}
        {status && status !== "success" && <p className="mt-2 text-sm text-red-400">{status}</p>}
      </div>
      <div className="flex flex-col md:items-end">
        <p className="mb-4 font-display text-xl font-bold uppercase tracking-wide text-white">
          {translate("followUs")}
        </p>
        <div className="flex items-center gap-3">
          {SOCIALS.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-[#FDC700]/90"
            >
              <img src={social.icon} alt="" width="22" height="22" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
