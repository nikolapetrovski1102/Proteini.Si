// src/Pages/PaymentPages/PaymentFailure.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentFailure() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const errorMessage = searchParams.get("error") || "Payment processing failed";

  useEffect(() => {
    // Log the failure
    console.error("Payment failed:", errorMessage);
  }, [errorMessage]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-red-500 mb-4">
          <svg
            className="h-16 w-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Failed
        </h2>
        <p className="text-gray-600 mb-2">
          There was an issue processing your payment.
        </p>
        <p className="text-sm text-gray-500 mb-6">{errorMessage}</p>
        <div className="space-y-3">
          <button
            onClick={() => navigate("/checkout")}
            className="w-full px-6 py-2 bg-[#2096D8] text-white rounded-lg hover:bg-[#1a7ab3] transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate("/cart")}
            className="w-full px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Return to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
