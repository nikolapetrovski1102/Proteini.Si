// src/Pages/PaymentPages/CPayPayment.jsx
import { useState } from "react";
import { api } from "../../services/api";

export default function CPayPayment({
  orderId,
  amount,
  onSuccess,
  onError,
  disabled = false,
}) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setProcessing(true);
    setError(null);

    try {
      // Call your backend to initiate cPay payment
      const response = await api.post("/payment/initiate", {
        orderId: orderId,
        amount: amount,
        description: `Payment for order ${orderId}`,
        customerName: localStorage.getItem("userName"),
        customerEmail: localStorage.getItem("userEmail"),
      });

      if (response.redirect_url) {
        // Redirect to cPay payment page
        window.location.href = response.redirect_url;
      } else {
        throw new Error("No redirect URL received");
      }
    } catch (err) {
      console.error("Payment initiation error:", err);
      const errorMsg =
        err.response?.data?.message ||
        "Failed to initiate payment. Please try again.";
      setError(errorMsg);
      if (onError) onError(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={processing || disabled}
        className={`w-full py-3 px-6 font-semibold rounded-lg transition-all duration-200 ${
          processing || disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#2096D8] hover:bg-[#1a7ab3] text-white"
        }`}
      >
        {processing ? (
          <div className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </div>
        ) : (
          `Pay with Credit Card - MKD ${amount.toFixed(2)}`
        )}
      </button>
    </div>
  );
}
