import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { clearGuestCart } from "../Hooks/useCart";

export default function MockPayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const guestToken = searchParams.get("token");

  const handlePayment = async (status) => {
    setProcessing(true);
    setError("");
    try {
      const authToken = api.getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/Order/MockPayment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({
            order_Id: parseInt(orderId),
            payment_Status: status,
            token: guestToken,
          }),
        },
      );

      const data = await response.json();

      if (data.status) {
        if (status === "completed") {
          // Logged-in carts are cleared server-side when the payment completes.
          clearGuestCart();
          navigate(
            `/order-confirmation/${orderId}${guestToken ? `?token=${encodeURIComponent(guestToken)}` : ""}`,
          );
        } else {
          setError("Payment failed. Please try again.");
          setProcessing(false);
        }
      } else {
        setError(data.message || "Payment processing failed");
        setProcessing(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setError("Payment processing failed. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <div className="w-full flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-xl max-sm:shadow-none p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Test Payment</h1>

        <div className="mb-6 p-4 bg-gray-50 rounded">
          <p className="text-gray-600 mb-2">
            Order ID: <strong>{orderId}</strong>
          </p>
          <p className="text-gray-600 mb-2">
            Amount:{" "}
            <strong className="text-green-600">
              MKD {parseFloat(amount).toFixed(2)}
            </strong>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handlePayment("completed")}
            disabled={processing}
            className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50"
          >
            {processing ? "Processing..." : "✅ Pay with Test Card (Success)"}
          </button>

          <button
            onClick={() => handlePayment("failed")}
            disabled={processing}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50"
          >
            {processing ? "Processing..." : "❌ Test Payment Failure"}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          This is a mock payment page for testing. Replace with actual bank
          integration.
        </p>
      </div>
    </div>
  );
}
