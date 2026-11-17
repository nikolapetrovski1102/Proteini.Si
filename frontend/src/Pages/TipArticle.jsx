import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiCheck, FiShare2 } from "react-icons/fi";
import { api } from "../services/api";
import { sanitizeDescriptionHtml } from "./Products/productDescription";
import { useLanguage } from "./translation/LanguageContext";
import TipCard, { TipMeta } from "./tips/TipCard";
import { useTips } from "./tips/useTips";
import { findBuiltInTip, getTipImageUrl, localizeTip } from "./tips/tipsData";
import Scribble from "./Components/Scribble";

const dateLocale = (language) => (language === "al" ? "sq-AL" : language === "en" ? "en-GB" : "mk-MK");

function ArticleSkeleton() {
  return (
    <div className="mx-auto max-w-[860px] px-4 py-16 sm:px-[25px]" aria-busy="true">
      <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
      <div className="mt-8 h-10 w-4/5 animate-pulse rounded bg-gray-100" />
      <div className="mt-4 h-5 w-3/5 animate-pulse rounded bg-gray-100" />
      <div className="mt-10 aspect-[16/9] w-full animate-pulse rounded-3xl bg-gray-100" />
    </div>
  );
}

function ShareButton({ title }) {
  const { translate } = useLanguage();
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // user dismissed the share sheet or clipboard is blocked
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12px] font-bold uppercase tracking-wider text-gray-800 ring-1 ring-black/10 transition hover:ring-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FDC700]"
    >
      {copied ? <FiCheck className="h-4 w-4" /> : <FiShare2 className="h-4 w-4" />}
      <span aria-live="polite">{copied ? translate("linkCopied") : translate("shareArticle")}</span>
    </button>
  );
}

export default function TipArticle() {
  const { slug } = useParams();
  const { translate, language } = useLanguage();
  const { tips } = useTips();
  // Result is keyed by slug so navigating between tips shows the skeleton again.
  const [loaded, setLoaded] = useState({ slug: null, data: null });
  // undefined = loading, null = not found
  const raw = loaded.slug === slug ? loaded.data : undefined;

  useEffect(() => {
    let active = true;
    api
      .getTipArticleBySlug(slug)
      .then((response) => active && setLoaded({ slug, data: response?.data || findBuiltInTip(slug) }))
      .catch(() => active && setLoaded({ slug, data: findBuiltInTip(slug) }));
    return () => {
      active = false;
    };
  }, [slug]);

  const article = useMemo(() => (raw ? localizeTip(raw, language) : raw), [raw, language]);
  const safeContent = useMemo(() => sanitizeDescriptionHtml(article?.content), [article]);
  const related = useMemo(() => tips.filter((tip) => tip.slug !== slug).slice(0, 3), [tips, slug]);

  useEffect(() => {
    if (!article) return;
    document.title = article.seoTitle || `${article.title} | Proteini.mk`;
    let description = document.querySelector('meta[name="description"]');
    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.appendChild(description);
    }
    description.content = article.seoDescription || article.subtitle || "Proteini.mk";
  }, [article]);

  if (article === undefined) return <ArticleSkeleton />;

  if (article === null) {
    return (
      <main className="mx-auto flex max-w-[640px] flex-col items-center px-4 py-24 text-center">
        <span className="h-1 w-12 bg-[#FDC700]" aria-hidden="true" />
        <h1 className="mt-6 font-display text-4xl font-bold uppercase text-gray-900">{translate("tipNotFound")}</h1>
        <p className="mt-3 text-gray-500">{translate("tipNotFoundText")}</p>
        <Link
          to="/tips"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#141409] px-6 py-3 text-[13px] font-bold text-white transition hover:bg-black"
        >
          <FiArrowLeft className="h-4 w-4" /> {translate("backToTips")}
        </Link>
      </main>
    );
  }

  const imageUrl = getTipImageUrl(article.imagePath);
  const date = article.updatedAt || article.createdAt;

  return (
    <main className="w-full font-montserrat text-gray-800">
      <article>
        {/* Header */}
        <header className="mx-auto max-w-[860px] px-4 pt-8 sm:px-[25px] sm:pt-12">
          <Link
            to="/tips"
            className="group inline-flex items-center gap-2 text-[13px] font-bold text-gray-600 transition hover:text-gray-900"
          >
            <FiArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            {translate("backToTips")}
          </Link>

          <TipMeta tip={article} className="mt-8" />
          <h1 className="mt-4 font-display text-[34px] font-bold leading-[1.02] text-gray-900 [text-wrap:balance] sm:text-[54px]">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="mt-5 max-w-[62ch] text-[17px] leading-7 text-gray-600 sm:text-[19px] sm:leading-8">{article.subtitle}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-5">
            <span className="text-[13px] font-semibold text-gray-500">
              Proteini.si
              {date && (
                <>
                  {" · "}
                  <time dateTime={date}>
                    {new Date(date).toLocaleDateString(dateLocale(language), { day: "numeric", month: "long", year: "numeric" })}
                  </time>
                </>
              )}
            </span>
            <ShareButton title={article.title} />
          </div>
        </header>

        {imageUrl && (
          <div className="mx-auto mt-8 max-w-[1100px] px-4 sm:mt-10 sm:px-[25px]">
            <img
              src={imageUrl}
              alt={article.title}
              className="aspect-[16/10] w-full rounded-3xl object-cover shadow-sm sm:aspect-[16/8]"
            />
          </div>
        )}

        {/* Body */}
        <div
          className="tip-article mx-auto max-w-[720px] px-4 pb-6 pt-10 sm:px-[25px] sm:pt-14"
          dangerouslySetInnerHTML={{ __html: safeContent }}
        />
      </article>

      {/* Call to action */}
      <section className="mx-auto max-w-[1100px] px-4 py-10 sm:px-[25px]">
        <div className="relative overflow-hidden rounded-3xl bg-[#FDC700] px-6 py-10 sm:px-12 sm:py-12">
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-white/25 blur-2xl" />
          <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-[28px] font-bold uppercase leading-none text-[#141409] sm:text-4xl">
                {translate("tipCtaTitle")}
              </h2>
              <p className="mt-2 max-w-[48ch] text-[15px] font-medium text-[#141409]/80">{translate("tipCtaText")}</p>
            </div>
            <Link
              to="/products"
              className="group inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-[#141409] px-6 py-3.5 text-[13px] font-bold text-white transition hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {translate("tipCtaButton")}
              <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* More tips */}
      {related.length > 0 && (
        <section className="home-tint bg-[#f3f6f8] py-14 sm:py-20">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-[25px]">
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 className="font-display text-[30px] font-bold uppercase leading-[0.95] tracking-tight text-gray-900 sm:text-5xl">
                {translate("moreTips")}
              </h2>
              <Link
                to="/tips"
                className="group flex flex-shrink-0 items-center gap-1.5 pb-2 text-[12px] font-bold text-gray-800 transition hover:text-black sm:text-[13px]"
              >
                <Scribble>{translate("showAll")}</Scribble>
                <FiArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${related.length >= 3 ? "lg:grid-cols-3" : ""}`}>
              {related.map((tip) => (
                <TipCard key={tip.id} tip={tip} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
