import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { GoDotFill } from "react-icons/go";
import ProfileNav from "../ProfilePages/ProfileNav";

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
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const guestToken = searchParams.get("token");
  // Guests can only see the one order their token unlocks; account actions are hidden.
  const isGuest = !api.isAuthenticated();

  // Check if we're on order-confirmation route
  const isOrderConfirmation = window.location.pathname.includes(
    "/order-confirmation/",
  );

  useEffect(() => {
    if (isOrderConfirmation && id) {
      fetchSingleOrder(id);
    } else {
      fetchOrderHistory();
    }
  }, [id, isOrderConfirmation]);

  const fetchSingleOrder = async (orderId) => {
    setLoading(true);
    try {
      const response = await api.getOrderConfirmation(
        orderId,
        isGuest ? guestToken : null,
      );
      if (response.status) {
        const singleOrder = [
          {
            Order_Id: response.order.Order_Id,
            Order_Number: response.order.Order_Number,
            Order_Date: response.order.Order_Date,
            Total_Amount: response.order.Total_Amount,
            Order_Status: response.order.Order_Status,
            Payment_Status: response.order.Payment_Status,
            Payment_Method: response.order.Payment_Method,
          },
        ];
        setOrders(singleOrder);
        setOrderDetails({
          order: response.order,
          items: response.items,
        });
      } else {
        setOrders([]);
      }
      setError(null);
    } catch (error) {
      console.error("Error fetching order:", error);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

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
        if (isOrderConfirmation && id) {
          await fetchSingleOrder(orderId);
        } else {
          await fetchOrderHistory();
        }
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

  const handleConfirmOrder = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to confirm this order? This will mark it as paid.",
      )
    ) {
      return;
    }

    try {
      const response = await api.updatePaymentStatus(
        orderId,
        "completed",
        `MANUAL_${Date.now()}`,
      );
      if (response.status) {
        alert("Order confirmed successfully!");
        if (isOrderConfirmation && id) {
          await fetchSingleOrder(orderId);
        } else {
          await fetchOrderHistory();
        }
        if (showOrderModal) {
          await fetchOrderDetails(orderId);
        }
      } else {
        alert(response.message || "Failed to confirm order");
      }
    } catch (error) {
      console.error("Error confirming order:", error);
      alert("Failed to confirm order. Please try again.");
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

  const canConfirmOrder = (order) => {
    return (
      order.Order_Status?.toLowerCase() === "pending" &&
      order.Payment_Status?.toLowerCase() === "pending"
    );
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center px-4 md:px-0">
        <div className="w-full flex flex-col md:flex-row gap-6 md:gap-24 md:pl-24 md:pr-48">
          {!isGuest && <ProfileNav />}
          <div className="w-full md:max-w-[740px] md:pr-[50px] pb-[70px]">
            <p className="text-[24px] font-bold mb-[20px] pt-[70px] md:pr-[50px]">
              {isOrderConfirmation ? "ORDER DETAILS" : "ORDER HISTORY"}
            </p>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2096D8] mx-auto"></div>
                <p className="text-gray-500 mt-4">
                  {isOrderConfirmation
                    ? "Loading order details..."
                    : "Loading orders..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center px-4 md:px-0">
        <div className="w-full flex flex-col md:flex-row gap-6 md:gap-24 md:pl-24 md:pr-48">
          {!isGuest && <ProfileNav />}
          <div className="w-full md:max-w-[740px] md:pr-[50px] pb-[70px]">
            <p className="text-[24px] font-bold mb-[20px] pt-[70px] md:pr-[50px]">
              {isOrderConfirmation ? "ORDER DETAILS" : "ORDER HISTORY"}
            </p>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={() =>
                    isOrderConfirmation && id
                      ? fetchSingleOrder(id)
                      : fetchOrderHistory()
                  }
                  className="mt-4 px-4 py-2 bg-[#2096D8] text-white rounded hover:bg-[#1a7ab3] transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center px-4 md:px-0">
      <div className="w-full flex flex-col md:flex-row gap-6 md:gap-24 md:pl-24 md:pr-48">
        {!isGuest && <ProfileNav />}

        <div className="w-full md:max-w-[740px] md:pr-[50px] pb-[70px]">
          <p className="text-[24px] font-bold mb-[20px] pt-[70px] md:pr-[50px]">
            {isOrderConfirmation
              ? "ORDER DETAILS"
              : `ORDER HISTORY (${orders.length})`}
          </p>

          {orders.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  {isOrderConfirmation ? "Order not found" : "No orders found"}
                </p>
                <button
                  onClick={() => navigate("/all-products")}
                  className="bg-[#2096D8] text-white px-6 py-2 rounded hover:bg-[#1a7ab3] transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.Order_Id}
                  className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Order #{order.Order_Number}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(order.Order_Date).toLocaleDateString(
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
                    <div className="text-left sm:text-right w-full sm:w-auto">
                      <p className="text-xl font-bold text-[#2096D8]">
                        MKD {order.Total_Amount?.toFixed(2) || 0}
                      </p>
                      <div className="flex gap-2 mt-1 sm:justify-end">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.Order_Status)}`}
                        >
                          {order.Order_Status?.toUpperCase() || "PENDING"}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getPaymentStatusColor(order.Payment_Status)}`}
                        >
                          {order.Payment_Status?.toUpperCase() || "PENDING"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <p className="text-sm text-gray-600">
                          Payment Method:{" "}
                          {order.Payment_Method?.toUpperCase() || "Credit Card"}
                        </p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                        {!isOrderConfirmation && (
                          <button
                            onClick={() => handleViewDetails(order)}
                            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-[#2096D8] border border-[#2096D8] hover:bg-[#2096D8] hover:text-white transition-colors rounded"
                          >
                            View Details
                          </button>
                        )}
                        {!isGuest && canConfirmOrder(order) && (
                          <button
                            onClick={() => handleConfirmOrder(order.Order_Id)}
                            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-green-600 border border-green-600 hover:bg-green-600 hover:text-white transition-colors rounded"
                          >
                            Confirm Order
                          </button>
                        )}
                        {!isGuest && canCancelOrder(order) && (
                          <button
                            onClick={() => handleCancelOrder(order.Order_Id)}
                            disabled={cancellingOrder === order.Order_Id}
                            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-red-600 border border-red-600 hover:bg-red-600 hover:text-white transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Order Details Modal - Only show on order history page */}
        {!isOrderConfirmation && showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">Order Details</h2>
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    setSelectedOrder(null);
                    setOrderDetails(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-4 sm:p-6">
                {loadingDetails ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2096D8] mx-auto"></div>
                    <p className="text-gray-500 mt-4">
                      Loading order details...
                    </p>
                  </div>
                ) : orderDetails ? (
                  <>
                    <div className="mb-6">
                      <p className="text-sm text-gray-500">
                        Order #{selectedOrder.Order_Number}
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
                      <h3 className="font-semibold mb-3">Order Items</h3>
                      <div className="space-y-3">
                        {orderDetails.items?.map((item, index) => (
                          <div key={index} className="border-b pb-3">
                            <div className="flex flex-col sm:flex-row justify-between gap-2">
                              <div>
                                <p className="font-medium">
                                  {item.Product_Name}
                                </p>
                                {item.Variant_Name && (
                                  <p className="text-sm text-gray-500">
                                    Flavor: {item.Variant_Name}
                                  </p>
                                )}
                                {item.Variant_Packaging && (
                                  <p className="text-sm text-gray-500">
                                    Size: {item.Variant_Packaging}
                                  </p>
                                )}
                                <p className="text-sm text-gray-500">
                                  Quantity: {item.Quantity}
                                </p>
                              </div>
                              <p className="font-semibold">
                                MKD{" "}
                                {(item.Product_Price * item.Quantity).toFixed(
                                  2,
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between mb-2">
                        <span>Subtotal:</span>
                        <span>
                          MKD {orderDetails.order?.Subtotal?.toFixed(2) || 0}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Delivery Fee:</span>
                        <span>
                          MKD{" "}
                          {orderDetails.order?.Delivery_Fee?.toFixed(2) || 0}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>VAT (9.5%):</span>
                        <span>
                          MKD {orderDetails.order?.VAT_9_5?.toFixed(2) || 0}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>VAT (22%):</span>
                        <span>
                          MKD {orderDetails.order?.VAT_22?.toFixed(2) || 0}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                        <span>Total:</span>
                        <span>
                          MKD {selectedOrder.Total_Amount?.toFixed(2) || 0}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                      {canConfirmOrder(selectedOrder) && (
                        <button
                          onClick={() =>
                            handleConfirmOrder(selectedOrder.Order_Id)
                          }
                          className="px-4 py-2 text-sm font-medium text-green-600 border border-green-600 rounded hover:bg-green-600 hover:text-white transition-colors"
                        >
                          Confirm Order
                        </button>
                      )}
                      {canCancelOrder(selectedOrder) && (
                        <button
                          onClick={() =>
                            handleCancelOrder(selectedOrder.Order_Id)
                          }
                          disabled={cancellingOrder === selectedOrder.Order_Id}
                          className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingOrder === selectedOrder.Order_Id
                            ? "Cancelling..."
                            : "Cancel Order"}
                        </button>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
