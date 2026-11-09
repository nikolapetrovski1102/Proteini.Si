import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiHeart, FiX } from "react-icons/fi";
import { api } from "../../services/api";
import { useLanguage } from "../translation/LanguageContext";
import {
  Notice,
  ProfileEmpty,
  ProfileHeader,
  ProfileLoading,
  ghostButtonClass,
} from "./ProfileKit";
import { formatPrice } from "./profileFormat";

export default function FavoriteProducts() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { translate } = useLanguage();

  useEffect(() => {
    (async () => {
      try {
        const response = await api.getFavorites();
        if (response.success) setFavorites(response.data || []);
      } catch (err) {
        console.error("Error fetching favorites:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRemove = async (productId) => {
    setRemoving(productId);
    setError("");
    try {
      const response = await api.removeFromFavorites(productId);
      if (response.success) {
        setFavorites((list) => list.filter((fav) => fav.productId !== productId));
      } else {
        setError(translate("favRemoveError"));
      }
    } catch (err) {
      console.error("Error removing favorite:", err);
      setError(translate("favRemoveError"));
    } finally {
      setRemoving(null);
    }
  };

  const goShopping = () => navigate("/all-products");

  if (loading) {
    return (
      <div>
        <ProfileHeader eyebrow={translate("profileMemberArea")} title={translate("favouriteProducts")} />
        <ProfileLoading />
      </div>
    );
  }

  return (
    <div>
      <ProfileHeader
        eyebrow={translate("profileMemberArea")}
        title={translate("favouriteProducts")}
        count={favorites.length}
        action={
          favorites.length > 0 && (
            <button type="button" onClick={goShopping} className={ghostButtonClass}>
              {translate("keepShopping")}
              <FiArrowRight />
            </button>
          )
        }
      />

      {error && (
        <div className="mb-4">
          <Notice tone="error">{error}</Notice>
        </div>
      )}

      {favorites.length === 0 ? (
        <ProfileEmpty
          icon={FiHeart}
          title={translate("noFavoriteProductsYet")}
          text={translate("favEmptyText")}
          actionLabel={translate("keepShopping")}
          onAction={goShopping}
        />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          {favorites.map((fav) => (
            <li
              key={fav.favoriteId}
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.06] transition hover:ring-black/[0.14]"
            >
              <Link to={`/product/${fav.productId}`} className="flex flex-1 flex-col">
                <div className="flex aspect-square items-center justify-center bg-[#f6f5f1] p-4">
                  <img
                    src={fav.productImage || "/img/placeholder.jpg"}
                    alt={fav.productName}
                    loading="lazy"
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">{fav.productName}</p>
                  <p className="mt-auto pt-2 text-[15px] font-bold tabular-nums text-gray-900">
                    {formatPrice(fav.productPrice)}
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => handleRemove(fav.productId)}
                disabled={removing === fav.productId}
                aria-label={`${translate("favRemove")}: ${fav.productName}`}
                className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm ring-1 ring-black/[0.08] transition hover:bg-[#141409] hover:text-white disabled:opacity-50"
              >
                <FiX size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
