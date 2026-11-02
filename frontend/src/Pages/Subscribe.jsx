import { useState } from "react";
import { useLanguage } from "./translation/LanguageContext";
import { api } from "../services/api";

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
    <div className="w-full flex justify-center bg-black max-md:bg-[#E5E5E5]">
      <div className="w-full max-w-[1240px] flex max-md:flex-col pt-[42px] pb-[47px]">
        <div className="flex-1 flex flex-col px-[15px] max-md:mb-[30px] max-md:items-center">
          <span className="md:text-white text-2xl font-bold pb-[7px] leading-none">
            {translate("subscribeToENews")}
          </span>
          <p className="md:text-white text-sm mt-[4px] mb-[21px]">
            {translate("stayInformedAboutCurrent")}
          </p>
          <form onSubmit={submit} className="flex flex-1 md:pr-[120px] max-md:w-full">
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={translate("enterYourEmailAddress")}
              className="outline-none p-[14px] w-full leading-4"
            />
            <button disabled={submitting} className="bg-[#f7c201] text-black py-[14px] px-12 text-[14px] font-bold disabled:opacity-60">
              {translate("subscribe")}
            </button>
          </form>
          {status === "success" && <p className="mt-2 text-sm text-green-500">Subscription saved.</p>}
          {status && status !== "success" && <p className="mt-2 text-sm text-red-500">{status}</p>}
        </div>
        <div className="flex-1 flex items-center flex-col md:ml-[103px] md:pt-[7px]">
          <p className="md:text-white text-2xl font-bold pb-[35px]">
            {translate("followUs")}
          </p>
          <div className="flex gap-5 items-center">
            <a
              href="https://www.youtube.com/c/proteinisi"
              className="p-5 rounded-full bg-white max-md:bg-[#333] relative"
            >
              <img
                src="/logos/youtube.svg"
                alt="youtube"
                width="25"
                height="25"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-md:hidden"
              />
              <img
                src="/logos/youtubewhite.svg"
                alt="youtube"
                width="25"
                height="25"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:hidden"
              />
            </a>
            <a
              href="https://www.facebook.com/people/Proteinisi-Makedonija/100088090903597/?share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1Zchqryyhy%2F"
              className="p-5 rounded-full bg-white max-md:bg-[#333] relative"
            >
              <img
                src="/logos/_facebook.svg"
                alt="facebook"
                width="25"
                height="25"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-md:hidden"
              />
              <img
                src="/logos/_facebookwhite.svg"
                alt="facebook"
                width="25"
                height="25"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:hidden"
              />
            </a>
            <a
              href="https://www.instagram.com/invites/contact/?igsh=m929e152dac0&utm_content=q2lg4bz"
              className="p-5 rounded-full bg-white max-md:bg-[#333] relative"
            >
              <img
                src="/logos/_instagram.svg"
                alt="instragram"
                width="25"
                height="25"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-md:hidden"
              />
              <img
                src="/logos/_instagramwhite.svg"
                alt="instagram"
                width="25"
                height="25"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:hidden"
              />
            </a>
            <a
              href="https://www.tiktok.com/@proteini.si_slovenija"
              className="p-5 rounded-full bg-white max-md:bg-[#333] relative"
            >
              <img
                src="/logos/tiktok.svg"
                alt="tiktok"
                width="25"
                height="25"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-md:hidden"
              />
              <img
                src="/logos/tiktokwhite.svg"
                alt="tiktok"
                width="25"
                height="25"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:hidden"
              />
            </a>
            <a
              href="https://www.strava.com/clubs/proteinisiteam"
              className="p-5 rounded-full bg-white max-md:bg-[#333] relative"
            >
              <img
                src="/logos/stravaa.svg"
                alt="youtube"
                width="25"
                height="25"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-md:hidden"
              />
              <img
                src="/logos/stravaawhite.svg"
                alt="youtube"
                width="25"
                height="25"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:hidden"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
