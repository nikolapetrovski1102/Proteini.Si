import { useState, useEffect } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Hooks/useCart";
import { useLanguage } from "../translation/LanguageContext";

export default function LoyaltyPoints() {
  const [loyaltySummary, setLoyaltySummary] = useState({
    totalPoints: 0,
    availablePoints: 0,
    totalEarned: 0,
    totalRedeemed: 0,
    totalExpired: 0,
    transactionCount: 0,
  });
  const [pointsHistory, setPointsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const { cart, loading: cartLoading } = useCart();
  const { translate } = useLanguage();

  useEffect(() => {
    fetchLoyaltySummary();
    fetchLoyaltyHistory();
  }, []);

  const fetchLoyaltySummary = async () => {
    try {
      const response = await api.getLoyaltySummary();
      if (response.status && response.data) {
        setLoyaltySummary(response.data);
      }
    } catch (error) {
      console.error("Error fetching loyalty summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoyaltyHistory = async (pageNum = 1) => {
    setLoadingHistory(true);
    try {
      const response = await api.getLoyaltyHistory(pageNum, 20);
      if (response.status && response.data) {
        if (pageNum === 1) {
          setPointsHistory(response.data);
        } else {
          setPointsHistory((prev) => [...prev, ...response.data]);
        }
        setHasMore(response.data.length === 20);
      }
    } catch (error) {
      console.error("Error fetching loyalty history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLoyaltyHistory(nextPage);
  };

  const getPointsIcon = (pointsType, sourceType) => {
    if (pointsType === "earned") {
      return "📈";
    } else if (pointsType === "redeemed") {
      return "🛍️";
    } else if (pointsType === "expired") {
      return "⏰";
    }
    return "📝";
  };

  const getPointsDescription = (item) => {
    if (item.pointsType === "earned") {
      return item.description || `Earned ${item.points} points`;
    } else if (item.pointsType === "redeemed") {
      return item.description || `Redeemed ${item.points} points`;
    } else if (item.pointsType === "expired") {
      return item.description || `${item.points} points expired`;
    }
    return item.description || "Transaction";
  };

  const getPointsClass = (pointsType) => {
    if (pointsType === "earned") {
      return "text-green-600";
    } else if (pointsType === "redeemed") {
      return "text-red-600";
    } else if (pointsType === "expired") {
      return "text-orange-600";
    }
    return "text-gray-600";
  };

  const getPointsPrefix = (pointsType) => {
    if (pointsType === "earned") {
      return "+";
    } else if (pointsType === "redeemed" || pointsType === "expired") {
      return "-";
    }
    return "";
  };

  // Calculate points earned from current cart (2% of subtotal)
  const cartPoints = cart?.total ? Math.floor(cart.total * 0.02) : 0;

  if (loading) {
    return (
      <div className="w-full max-w-[740px] pr-[50px] max-lg:pr-0 pb-[70px]">
        <p className="text-[24px] font-bold mb-[20px] pt-[70px] pr-[50px]">
          {translate("loyaltyPoints")}
        </p>
        <div className="bg-white rounded-lg p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2096D8] mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading loyalty points...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[740px] pr-[50px] max-lg:pr-0 pb-[70px]">
      <p className="text-[24px] font-bold mb-[20px] pt-[70px] pr-[50px] max-sm:pt-0">
        {translate("loyaltyPoints")}
      </p>

      <div className="bg-white">
        {/* Current Points Summary */}
        <div className="text-center py-8 border-b border-[#E5E5E5] mb-[34px]">
          <p className="text-[17px] font-extrabold mb-[16px] mx-auto bg-[#FDC700] w-[82px] h-[82px] rounded-full flex justify-center items-center text-2xl">
            {Math.floor(loyaltySummary.availablePoints || 0)}
          </p>
          <p className="text-gray-600">{translate("availableLoyaltyPoints")}</p>
          <p className="text-xs text-gray-400 mt-2">
            {translate("totalEarned")}:{" "}
            {Math.floor(loyaltySummary.totalEarned || 0)} |{" "}
            {translate("redeemed")}:{" "}
            {Math.floor(loyaltySummary.totalRedeemed || 0)}
          </p>
        </div>

        {/* Cart Points Section */}
        {cartPoints > 0 && (
          <div className="bg-white border-b border-[#E5E5E5] pb-8 mb-[16px] flex flex-col gap-4">
            <div className="flex gap-4 items-center">
              <FiShoppingCart size={22} color="#828282" />
              <p className="text-[16px] text-[#828282]">
                {translate("youWillEarnFromCurrentCart")}
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <p className="text-[12px] bg-[#FDC700] w-[44px] h-[44px] rounded-full flex justify-center items-center font-bold">
                {cartPoints}
              </p>
              <p className="text-[12px]">
                {translate("points")} (2% {translate("ofOrderTotal")})
              </p>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              className="bg-[#FDC700] text-[16px] font-bold py-3 px-6 hover:bg-[#e0b800] transition-colors w-full"
            >
              {translate("completeThePurchase")}
            </button>
          </div>
        )}

        {/* Points History */}
        <div className="mb-[30px] pt-[10px]">
          <p className="text-[16px] text-[#828282] mb-[15px] font-semibold">
            {translate("historyOfLoyaltyPoints")}
          </p>

          {pointsHistory.length === 0 ? (
            <p className="text-gray-500 text-sm">
              {translate("youHaveNoLoyaltyPointTransactionsYet")}
            </p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {pointsHistory.map((item) => (
                <div
                  key={item.loyaltyPointId}
                  className="flex justify-between items-start py-3 border-b border-gray-100"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getPointsIcon(item.pointsType, item.sourceType)}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {getPointsDescription(item)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(item.transactionDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                        {item.expiryDate && item.pointsType === "earned" && (
                          <p className="text-xs text-orange-500 mt-1">
                            Expires:{" "}
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`text-right font-semibold ${getPointsClass(item.pointsType)}`}
                  >
                    {getPointsPrefix(item.pointsType)}
                    {Math.floor(item.points)} pts
                  </div>
                </div>
              ))}

              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={loadingHistory}
                  className="w-full text-center text-[#2096D8] text-sm py-2 hover:underline disabled:opacity-50"
                >
                  {loadingHistory ? "Loading..." : "Load more"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
