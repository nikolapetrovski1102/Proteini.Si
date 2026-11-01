// src/components/ProductActionModal.jsx
import { useEffect, useRef, useState } from "react";
import { TfiClose } from "react-icons/tfi";
import { useLanguage } from "../translation/LanguageContext";

export default function ProductActionModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
  onRemoveFromCart,
  title = "Product Options", // This is the modal title
  // Dynamic button props
  addButtonText = "Add to Cart",
  addButtonColor = "bg-[#2096D8]",
  addButtonHoverColor = "hover:bg-[#1a7ab3]",
  addButtonTextColor = "text-white",
  addButtonStyle = {},
  removeButtonText = "Remove",
  removeButtonColor = "bg-red-500",
  removeButtonHoverColor = "hover:bg-red-600",
  removeButtonTextColor = "text-white",
  removeButtonStyle = {},
  showRemoveButton = true,
  showAddButton = true,
  buttonOrder = "addThenRemove",
  showQuantitySelector = true,
}) {
  const modalRef = useRef(null);
  const [quantity, setQuantity] = useState(1);
  const { translate } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen, product]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen || !product) return null;

  const renderButtons = () => {
    if (buttonOrder === "removeThenAdd") {
      return (
        <>
          {showRemoveButton && (
            <button
              onClick={() => {
                onRemoveFromCart(product);
              }}
              className={`flex-1 py-3 font-bold transition-all duration-200 transform ${removeButtonColor} ${removeButtonHoverColor} ${removeButtonTextColor}`}
              style={removeButtonStyle}
            >
              {removeButtonText}
            </button>
          )}
          {showAddButton && (
            <button
              onClick={() => {
                onAddToCart(product, quantity);
              }}
              className={`flex-1 py-3 font-bold transition-all duration-200 transform ${addButtonColor} ${addButtonHoverColor} ${addButtonTextColor}`}
              style={addButtonStyle}
            >
              {addButtonText}
            </button>
          )}
        </>
      );
    } else {
      return (
        <>
          {showAddButton && (
            <button
              onClick={() => {
                onAddToCart(product, quantity);
              }}
              className={`flex-1 py-3 font-bold transition-all duration-200 transform ${addButtonColor} ${addButtonHoverColor} ${addButtonTextColor}`}
              style={addButtonStyle}
            >
              {addButtonText}
            </button>
          )}
          {showRemoveButton && (
            <button
              onClick={() => {
                onRemoveFromCart(product);
              }}
              className={`flex-1 py-3 font-bold transition-all duration-200 transform ${removeButtonColor} ${removeButtonHoverColor} ${removeButtonTextColor}`}
              style={removeButtonStyle}
            >
              {removeButtonText}
            </button>
          )}
        </>
      );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50"
      onClick={handleOutsideClick}
    >
      <div
        ref={modalRef}
        className="absolute top-0 right-0 w-full max-w-[505px] h-full bg-white shadow-2xl animate-slide-in pt-[75px] px-[79px] pb-[40px]"
      >
        {/* Header */}
        <div className="border-b border-gray-200">
          {/* Modal Title - NEW */}
          {title && (
            <h2 className="text-[21px] font-bold mb-[30px]">{title}</h2>
          )}
          <div className="flex justify-between items-center">
            <div className="flex flex-col mb-[30px]">
              <p className="text-sm text-gray-500 mb-1">
                {product.category || `${translate("product")}`}
              </p>
              <h3 className="font-bold text-xl mb-3">{product.name}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors absolute top-12 right-12"
            >
              <TfiClose size={20} color="black" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div>
          {/* Product Image */}
          <div className="flex items-center justify-center mb-6">
            <span className="text-[20px] font-bold ">
              MKD{" "}
              {(product.price * (showQuantitySelector ? quantity : 1)).toFixed(
                2,
              )}
            </span>
            <img
              src={`${product.img}`}
              alt={product.name}
              className="w-32 h-32 object-cover rounded"
            />
          </div>

          {/* Product Info - Quantity Selector */}
          {showQuantitySelector && (
            <div className="mb-6">
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="flex flex-col">
                  <span className="text-[12px] mb-[12px] font-bold">
                    {translate("quantity")}:
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 py-2 hover:bg-gray-100 transition-colors border border-gray-400"
                    >
                      -
                    </button>
                    <span className="w-12 text-center py-2 border border-gray-300">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(
                          Math.min(product.quantity || 99, quantity + 1),
                        )
                      }
                      className="w-12 py-2 hover:bg-gray-100 transition-colors border border-gray-400"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">{renderButtons()}</div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
