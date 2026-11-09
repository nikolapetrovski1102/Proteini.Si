import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiClock,
  FiShoppingBag,
  FiShoppingCart,
  FiStar,
  FiTrendingUp,
} from "react-icons/fi";
import { api } from "../../services/api";
import { useCart } from "../Hooks/useCart";
import { useLanguage } from "../translation/LanguageContext";
import { Sparkle } from "../HomePages/sections/Decor";
import {
  ProfileHeader,
  ProfileLoading,
  cardClass,
  eyebrowClass,
  ghostButtonClass,
  headingClass,
  pillButtonClass,
} from "./ProfileKit";
import { formatDate } from "./profileFormat";

const PAGE_SIZE = 20;

const TYPE_STYLES = {
  earned: { icon: FiTrendingUp, chip: "bg-[#8DC658]/15 text-[#2f5e14]", sign: "+", amount: "text-[#2f5e14]" },
  redeemed: { icon: FiShoppingBag, chip: "bg-[#E3262F]/10 text-[#a3161d]", sign: "−", amount: "text-[#a3161d]" },
  expired: { icon: FiClock, chip: "bg-black/[0.06] text-gray-500", sign: "−", amount: "text-gray-500" },
};
const DEFAULT_STYLE = { icon: FiStar, chip: "bg-black/[0.06] text-gray-600", sign: "", amount: "text-gray-700" };

export default function LoyaltyPoints() {
  const [summary, setSummary] = useState({ availablePoints: 0, totalEarned: 0, totalRedeemed: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const navigate = useNavigate();
  const { cart } = useCart();
  const { translate, language } = useLanguage();

  const fetchSummary = async () => {
    try {
      const response = await api.getLoyaltySummary();
      if (response.status && response.data) setSummary(response.data);
    } catch (error) {
      console.error("Error fetching loyalty summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (pageNum = 1) => {
    setLoadingHistory(true);
    try {
      const response = await api.getLoyaltyHistory(pageNum, PAGE_SIZE);
      if (response.status && response.data) {
        setHistory((prev) => (pageNum === 1 ? response.data : [...prev, ...response.data]));
        setHasMore(response.data.length === PAGE_SIZE);
      }
    } catch (error) {
      console.error("Error fetching loyalty history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchHistory();
  }, []);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchHistory(next);
  };

  const describe = (item) => {
    if (item.description) return item.description;
    const key =
      item.pointsType === "earned"
        ? "loyaltyEarnedPoints"
        : item.pointsType === "redeemed"
          ? "loyaltyRedeemedPoints"
          : item.pointsType === "expired"
            ? "loyaltyExpiredPoints"
            : "loyaltyTransaction";
    return translate(key).replace("{n}", Math.floor(item.points));
  };

  const cartPoints = cart?.total ? Math.floor(cart.total * 0.02) : 0;
  const header = <ProfileHeader eyebrow={translate("profileMemberArea")} title={translate("loyaltyPoints")} />;

  if (loading) {
    return (
      <div>
        {header}
        <ProfileLoading label={translate("loyaltyLoading")} />
      </div>
    );
  }

  return (
    <div>
      {header}

      <div className="space-y-5">
        {/* balance */}
        <section className="relative overflow-hidden rounded-3xl bg-[#FDC700] p-6 sm:p-8">
          <Sparkle color="#141409" className="absolute right-[8%] top-[14%] h-7 w-7 rotate-12" />
          <Sparkle color="#ffffff" className="absolute right-[20%] top-[38%] h-4 w-4" />
          <Sparkle color="#E3262F" className="absolute bottom-[14%] right-[12%] h-5 w-5" />
          <p className="relative text-[11px] font-semibold uppercase tracking-[0.08em] text-[#141409]/70">
            {translate("availableLoyaltyPoints")}
          </p>
          <p className="relative mt-2 font-display text-7xl font-bold leading-none tabular-nums text-[#141409] sm:text-8xl">
            {Math.floor(summary.availablePoints || 0)}
          </p>
          <div className="relative mt-6 grid max-w-[420px] grid-cols-2 gap-2">
            {[
              ["totalEarned", summary.totalEarned],
              ["redeemed", summary.totalRedeemed],
            ].map(([key, value]) => (
              <div key={key} className="rounded-xl bg-[#141409]/[0.08] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#141409]/65">{translate(key)}</p>
                <p className="mt-1 font-display text-2xl font-bold tabular-nums text-[#141409]">{Math.floor(value || 0)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* points from current cart */}
        {cartPoints > 0 && (
          <section className={`${cardClass} flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6`}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#141409] text-[#FDC700]">
              <FiShoppingCart size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-600">{translate("youWillEarnFromCurrentCart")}</p>
              <p className="mt-0.5 text-lg font-bold text-gray-900">
                <span className="tabular-nums">+{cartPoints}</span> {translate("points")}{" "}
                <span className="text-sm font-medium text-gray-500">(2% {translate("ofOrderTotal")})</span>
              </p>
            </div>
            <button type="button" onClick={() => navigate("/checkout")} className={pillButtonClass}>
              {translate("completeThePurchase")}
              <FiArrowRight className="text-[#FDC700] transition-transform group-hover:translate-x-0.5" />
            </button>
          </section>
        )}

        {/* history */}
        <section className={`${cardClass} p-5 sm:p-7`}>
          <h2 className={`${headingClass} text-2xl`}>{translate("historyOfLoyaltyPoints")}</h2>

          {history.length === 0 ? (
            <p className="mt-4 rounded-xl bg-[#f6f5f1] px-4 py-6 text-center text-sm text-gray-500">
              {translate("youHaveNoLoyaltyPointTransactionsYet")}
            </p>
          ) : (
            <>
              <ul className="mt-4 divide-y divide-black/[0.06]">
                {history.map((item) => {
                  const style = TYPE_STYLES[item.pointsType] || DEFAULT_STYLE;
                  const Icon = style.icon;
                  return (
                    <li key={item.loyaltyPointId} className="flex items-center gap-4 py-3.5">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.chip}`}>
                        <Icon size={17} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">{describe(item)}</p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {formatDate(item.transactionDate, language, true)}
                          {item.expiryDate && item.pointsType === "earned" && (
                            <span className="ml-2 text-[#9a5b00]">
                              · {translate("loyaltyExpires")} {formatDate(item.expiryDate, language)}
                            </span>
                          )}
                        </p>
                      </div>
                      <span className={`shrink-0 font-display text-xl font-bold tabular-nums ${style.amount}`}>
                        {style.sign}
                        {Math.floor(item.points)}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {hasMore && (
                <div className="mt-4 text-center">
                  <button type="button" onClick={loadMore} disabled={loadingHistory} className={ghostButtonClass}>
                    {loadingHistory ? translate("loyaltyLoadingMore") : translate("loyaltyLoadMore")}
                  </button>
                </div>
              )}
            </>
          )}
          <p className={`${eyebrowClass} mt-5 normal-case tracking-normal`}>{translate("loyaltyHowItWorks")}</p>
        </section>
      </div>
    </div>
  );
}
