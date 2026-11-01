import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { GoDotFill } from "react-icons/go";
import { useLanguage } from "../translation/LanguageContext";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const navigate = useNavigate();
  const { translate } = useLanguage();

  // Add these helper functions
  const translateOrderStatus = (status) => {
    if (!status) return translate("pending");

    const statusMap = {
      pending: translate("pending"),
      paid: translate("paid"),
      cancelled: translate("cancelled"),
      shipped: translate("shipped"),
      delivered: translate("delivered"),
      completed: translate("completed"),
    };

    return statusMap[status.toLowerCase()] || status.toUpperCase();
  };

  const translatePaymentStatus = (status) => {
    if (!status) return translate("pending");

    const statusMap = {
      pending: translate("pending"),
      completed: translate("completed"),
      refunded: translate("refunded"),
    };

    return statusMap[status.toLowerCase()] || status.toUpperCase();
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    setLoading(true);
    try {
      const response = await api.getOrderHistory();
      if (response.status && response.orders) {
        setOrders(response.orders);
      } else if (response.orders) {
        setOrders(response.orders);
      } else {
        setOrders([]);
      }
      setError(null);
    } catch (error) {
      console.error("Error fetching order history:", error);
      setError("Failed to load order history");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    setLoadingDetails(true);
    try {
      const response = await api.getOrderConfirmation(orderId);
      if (response.status) {
        setOrderDetails({
          order: response.order,
          items: response.items,
        });
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      alert("Failed to load order details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewDetails = async (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
    await fetchOrderDetails(order.Order_Id);
  };

  const handleCancelOrder = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this order? This action cannot be undone.",
      )
    ) {
      return;
    }

    setCancellingOrder(orderId);
    try {
      const response = await api.cancelOrder(orderId);
      if (response.status) {
        alert(response.message || "Order cancelled successfully");
        await fetchOrderHistory();
        if (showOrderModal) {
          setShowOrderModal(false);
          setSelectedOrder(null);
          setOrderDetails(null);
        }
      } else {
        alert(response.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert(error.message || "Failed to cancel order. Please try again.");
    } finally {
      setCancellingOrder(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "paid":
        return "text-green-600 bg-green-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      case "shipped":
        return "text-blue-600 bg-blue-50";
      case "delivered":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "text-yellow-600";
      case "completed":
        return "text-green-600";
      case "refunded":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const canCancelOrder = (order) => {
    const orderDate = new Date(order.Order_Date);
    const now = new Date();
    const hoursPassed = (now - orderDate) / (1000 * 60 * 60);

    return (
      order.Order_Status?.toLowerCase() !== "cancelled" &&
      order.Order_Status?.toLowerCase() !== "shipped" &&
      order.Order_Status?.toLowerCase() !== "delivered" &&
      order.Order_Status?.toLowerCase() !== "paid" &&
      hoursPassed <= 24
    );
  };

  if (loading) {
    return (
      <div className="w-full max-w-[740px] pr-[50px] max-lg:pr-0 pb-[70px]">
        <p className="text-[24px] font-bold mb-[20px] pt-[70px] pr-[50px]">
          ORDER HISTORY
        </p>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2096D8] mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-[740px] pr-[50px] max-lg:pr-0 pb-[70px]">
        <p className="text-[24px] font-bold mb-[20px] pt-[70px] pr-[50px]">
          ORDER HISTORY
        </p>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button
              onClick={fetchOrderHistory}
              className="mt-4 px-4 py-2 bg-[#2096D8] text-white rounded hover:bg-[#1a7ab3] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-[740px] pr-[50px] max-lg:pr-0 pb-[70px]">
        <p className="text-[24px] font-bold mb-[20px] pt-[70px] max-sm:pt-0 md:pr-[50px]">
          {translate("orderHistory")} ({orders.length})
        </p>

        {orders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">{translate("noOrdersFound")}</p>
              <button
                onClick={() => navigate("/all-products")}
                className="w-full bg-[#E5E5E5] font-bold p-[14px] hover:bg-[#D8D8D8] transition-all duration-300 ease-in-out"
              >
                {translate("startShopping")}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.Order_Id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      {translate("order")} #{order.Order_Number}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.Order_Date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-[#2096D8]">
                      MKD {order.Total_Amount?.toFixed(2) || 0}
                    </p>
                    <div className="flex gap-2 mt-1 justify-end">
                      <span
                        className={`text-xs px-2 py-1 rounded-full uppercase ${getStatusColor(order.Order_Status)}`}
                      >
                        {translateOrderStatus(order.Order_Status)}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full uppercase ${getPaymentStatusColor(order.Payment_Status)}`}
                      >
                        {translatePaymentStatus(order.Payment_Status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mt-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">
                        {translate("paymentMethod")}:{" "}
                        {order.Payment_Method?.toUpperCase() || "Credit Card"}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="px-4 py-2 text-sm font-medium text-[#2096D8] border border-[#2096D8] rounded hover:bg-[#2096D8] hover:text-white transition-colors min-w-[122px]"
                      >
                        {translate("viewDetails")}
                      </button>
                      {canCancelOrder(order) && (
                        <button
                          onClick={() => handleCancelOrder(order.Order_Id)}
                          disabled={cancellingOrder === order.Order_Id}
                          className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingOrder === order.Order_Id
                            ? "Cancelling..."
                            : "Cancel Order"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 max-sm:p-0">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] max-sm:max-h-[100vh] h-full overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{translate("orderDetails")}</h2>
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setSelectedOrder(null);
                  setOrderDetails(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-5xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {loadingDetails ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2096D8] mx-auto"></div>
                  <p className="text-gray-500 mt-4">
                    {translate("loadingOrderDetails")}
                  </p>
                </div>
              ) : orderDetails ? (
                <>
                  <div className="mb-6">
                    <p className="text-sm text-gray-500">
                      {translate("order")} #{selectedOrder.Order_Number}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(selectedOrder.Order_Date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">
                      {translate("orderItems")}
                    </h3>
                    <div className="space-y-3">
                      {orderDetails.items?.map((item, index) => (
                        <div key={index} className="border-b pb-3">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">{item.Product_Name}</p>
                              {item.Variant_Name && (
                                <p className="text-sm text-gray-500">
                                  {translate("flavor")}: {item.Variant_Name}
                                </p>
                              )}
                              {item.Variant_Packaging && (
                                <p className="text-sm text-gray-500">
                                  {translate("size")}: {item.Variant_Packaging}
                                </p>
                              )}
                              <p className="text-sm text-gray-500">
                                {translate("quantity")}: {item.Quantity}
                              </p>
                            </div>
                            <p className="font-semibold">
                              MKD{" "}
                              {(item.Product_Price * item.Quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between mb-2">
                      <span>{translate("subtotal")}:</span>
                      <span>
                        MKD {orderDetails.order?.Subtotal?.toFixed(2) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>{translate("deliveryFee")}:</span>
                      <span>
                        MKD {orderDetails.order?.Delivery_Fee?.toFixed(2) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>DDV (9.5%):</span>
                      <span>
                        MKD {orderDetails.order?.VAT_9_5?.toFixed(2) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>DDV (22%):</span>
                      <span>
                        MKD {orderDetails.order?.VAT_22?.toFixed(2) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                      <span>{translate("total")}:</span>
                      <span>
                        MKD {selectedOrder.Total_Amount?.toFixed(2) || 0}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3 justify-end">
                    {canCancelOrder(selectedOrder) && (
                      <button
                        onClick={() =>
                          handleCancelOrder(selectedOrder.Order_Id)
                        }
                        disabled={cancellingOrder === selectedOrder.Order_Id}
                        className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancellingOrder === selectedOrder.Order_Id
                          ? `${translate("cancellingOrder")}`
                          : `${translate("cancelOrder")}`}
                      </button>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
