import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";
import { sanitizeDescriptionHtml } from "./Products/productDescription";
import { useLanguage } from "./translation/LanguageContext";

export default function TipArticle() {
  const { slug } = useParams();
  const { language } = useLanguage();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.getTipArticleBySlug(slug)
      .then((response) => active && setArticle(response.data))
      .catch((requestError) => active && setError(requestError.message));
    return () => { active = false; };
  }, [slug]);

  const isAlbanian = language === "al" || language === "sq";
  const title = isAlbanian && article?.titleAl ? article.titleAl : article?.title;
  const subtitle = isAlbanian && article?.subtitleAl ? article.subtitleAl : article?.subtitle;
  const safeContent = useMemo(
    () => sanitizeDescriptionHtml(
      isAlbanian && article?.contentAl ? article.contentAl : article?.content,
    ),
    [article, isAlbanian],
  );

  useEffect(() => {
    if (!article) return;
    document.title = article.seoTitle || `${title} | Proteini.mk`;
    let description = document.querySelector('meta[name="description"]');
    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.appendChild(description);
    }
    description.content = article.seoDescription || subtitle || "Proteini.mk";
  }, [article, subtitle, title]);

  if (error) return <div className="mx-auto max-w-4xl px-5 py-28">{error}</div>;
  if (!article) return <div className="mx-auto max-w-4xl px-5 py-28">Loading...</div>;

  const imageUrl = article.imagePath?.startsWith("/")
    ? `https://proteini.mk${article.imagePath}`
    : article.imagePath;

  return (
    <article className="mx-auto max-w-4xl px-5 py-24">
      <Link to="/tips" className="text-sm font-semibold text-[#2096D8]">← Tips</Link>
      <p className="mt-8 text-xs uppercase text-gray-500">{article.category}</p>
      <h1 className="mt-2 text-4xl font-bold text-gray-950">{title}</h1>
      {subtitle && <p className="mt-4 text-lg text-gray-600">{subtitle}</p>}
      {imageUrl && <img src={imageUrl} alt={title} className="mt-8 max-h-[520px] w-full object-cover" />}
      <div
        className="product-description mt-10 text-base leading-7 text-gray-800"
        dangerouslySetInnerHTML={{ __html: safeContent }}
      />
    </article>
  );
}
