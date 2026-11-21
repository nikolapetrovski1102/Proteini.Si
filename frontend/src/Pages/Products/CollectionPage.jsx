import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useLanguage } from "../translation/LanguageContext";
import Price from "../Components/Price";
import { Starburst } from "../HomePages/sections/Decor";
import { discountPercent } from "../../utils/salePricing";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Landing page of a Meta "collection" ad: /collection?p=v12,p5,…&t=title&s=subtitle.
 * The products come from the shop feed (same names, photos and prices as the Meta catalog), in the order of the ad.
 */
export default function CollectionPage() {
  const [params] = useSearchParams();
  const { translate } = useLanguage();
  const items = params.get("p") || "";
  const title = params.get("t") || translate("collectionDefaultTitle");
  const subtitle = params.get("s") || "";
  // The list belongs to the items it was loaded for, so a new link shows the loader until its own answer arrives.
  const [loaded, setLoaded] = useState({ items: null, products: [] });
  const state = { loading: loaded.items !== items, products: loaded.products };

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/feed/collection?items=${encodeURIComponent(items)}`)
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => [])
      .then(
        (products) =>
          !cancelled &&
          setLoaded({
            items,
            products: Array.isArray(products) ? products : [],
          }),
      );
    return () => {
      cancelled = true;
    };
  }, [items]);

  useEffect(() => {
    document.title = `${title} | Proteini.mk`;
  }, [title]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8 sm:pt-12">
      <header className="mb-6 text-center sm:mb-10">
        <h1 className="font-display text-3xl uppercase leading-tight tracking-wide text-[#141409] sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-base text-gray-600 sm:text-lg">{subtitle}</p>
        )}
      </header>

      {state.loading ? (
        <ul
          className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
          aria-busy="true"
        >
          {Array.from({ length: 8 }, (_, i) => (
            <li
              key={i}
              className="aspect-[3/4] animate-pulse rounded-2xl bg-[#f6f5f1]"
            />
          ))}
        </ul>
      ) : state.products.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-gray-600">{translate("collectionEmpty")}</p>
          <Link
            to="/all-products"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#141409] px-5 py-2.5 font-semibold text-white"
          >
            {translate("allProducts")}
            <FiArrowRight />
          </Link>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {state.products.map((p) => {
              const onSale = p.salePrice != null && p.salePrice < p.price;
              return (
                <li
                  key={p.id}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.06] transition hover:ring-black/[0.14]"
                >
                  <Link to={p.link} className="flex flex-1 flex-col">
                    <div className="photo-tile relative flex aspect-square items-center justify-center bg-[#f6f5f1] p-4">
                      {p.image && (
                        <img
                          src={p.image}
                          alt={p.title}
                          loading="lazy"
                          className={`h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.04] ${p.inStock ? "" : "opacity-50"}`}
                        />
                      )}
                      {onSale && (
                        <span className="absolute left-1.5 top-1.5">
                          <Starburst
                            color="#E3262F"
                            textColor="#ffffff"
                            rotate={-12}
                            className="h-12 w-12 text-[15px] sm:h-14 sm:w-14 sm:text-lg"
                          >
                            −{discountPercent(p.price, p.salePrice)}%
                          </Starburst>
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                      <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
                        {p.title}
                      </p>
                      <div className="mt-auto pt-2">
                        {p.inStock ? (
                          <p className="flex flex-wrap items-baseline gap-x-2">
                            <Price
                              value={onSale ? p.salePrice : p.price}
                              className={`text-[17px] font-bold sm:text-lg ${onSale ? "text-[#E3262F]" : "text-gray-900"}`}
                            />
                            {onSale && (
                              <Price
                                value={p.price}
                                className="text-sm text-gray-500 line-through"
                              />
                            )}
                          </p>
                        ) : (
                          <p className="text-sm font-semibold text-gray-500">
                            {translate("outOfStock")}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-10 text-center">
            <Link
              to="/all-products"
              className="inline-flex items-center gap-2 rounded-full bg-[#FDC700] px-6 py-3 font-semibold text-[#141409] transition hover:bg-[#141409] hover:text-white"
            >
              {translate("allProducts")}
              <FiArrowRight />
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
