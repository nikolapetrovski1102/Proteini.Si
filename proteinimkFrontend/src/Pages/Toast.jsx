// src/components/Toast.jsx
import { useEffect } from "react";
import { TfiClose } from "react-icons/tfi";

export default function Toast({
  message,
  type = "success",
  onClose,
  duration = 4000,
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
        ? "bg-red-500"
        : "bg-blue-500";
  const icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";

  return (
    <div
      className={`fixed top-4 left-4 z-100 max-w-md ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center justify-between animate-slide-in`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span className="font-medium">{message}</span>
      </div>
      <button onClick={onClose} className="ml-4 hover:opacity-75">
        <TfiClose size={16} />
      </button>
    </div>
  );
}
