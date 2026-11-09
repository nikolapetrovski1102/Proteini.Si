import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { clearGuestCart } from "../Hooks/useCart";
import { BrandLoader } from "../Components/Loaders/BrandLoader";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const navigate = useNavigate();

  // cPay sends different parameter names - check both possibilities
  const orderId =
    searchParams.get("order_id") ||
    searchParams.get("orderId") ||
    searchParams.get("Details2");
  const guestToken = searchParams.get("token");
  const transactionId =
    searchParams.get("transaction_id") || searchParams.get("cPayPaymentRef");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!orderId) {
          console.error("No order ID found in URL");
          setStatus("failed");
          return;
        }

        // Use your existing order confirmation endpoint
        const response = await api.getOrderConfirmation(
          orderId,
          api.isAuthenticated() ? null : guestToken,
        );

        if (response.status && response.order) {
          setStatus("success");
          // The cart is only cleared once the payment has succeeded.
          if (api.isAuthenticated()) {
            await api.clearCart().catch((e) => console.error("Failed to clear cart:", e));
          } else {
            clearGuestCart();
          }
          setTimeout(() => {
            navigate(
              `/order-confirmation/${orderId}${guestToken ? `?token=${encodeURIComponent(guestToken)}` : ""}`,
            );
          }, 3000);
        } else {
          setStatus("failed");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("failed");
      }
    };

    if (orderId) {
      verifyPayment();
    } else {
      setStatus("failed");
    }
  }, [orderId, guestToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        {status === "verifying" && (
          <>
            <BrandLoader variant="scoop" size={120} />
            <h2 className="mt-4 text-2xl font-bold">Verifying Payment...</h2>
            <p className="mt-2 text-gray-600">
              Please wait while we confirm your payment
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-green-500 mb-4">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Payment Successful!
            </h2>
            <p className="mt-2 text-gray-600">Thank you for your purchase.</p>
            <p className="mt-1 text-sm text-gray-500">
              Redirecting to order confirmation...
            </p>
          </>
        )}

        {status === "failed" && (
          <>
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
            <h2 className="text-2xl font-bold text-gray-900">Payment Failed</h2>
            <p className="mt-2 text-gray-600">
              There was an issue processing your payment.
            </p>
            <button
              onClick={() => navigate("/checkout")}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
