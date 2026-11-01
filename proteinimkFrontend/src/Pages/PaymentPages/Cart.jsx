import { useNavigate } from "react-router-dom";
import { IoCheckmarkSharp } from "react-icons/io5";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Link } from "react-router-dom";
import { useCart } from "../Hooks/useCart";
import ProductActionModal from "../Components/ProductActionModal";
import { useLanguage } from "../translation/LanguageContext";

export default function Cart() {
  const navigate = useNavigate();
  const [justForMeProducts, setJustForMeProducts] = useState([]);
  const [justForMeLoading, setJustForMeLoading] = useState(true);
  const { cart, loading, updateQuantity, removeFromCart } = useCart();
  const { translate, language } = useLanguage();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleKeepShopping = () => {
    window.scrollTo(0, 0);
    navigate("/all-products");
  };

  const handleShowAllJustForMe = () => {
    navigate("/products", {
      state: {
        preSelectedFilter: "justForMe",
        filterValue: true,
      },
    });
  };

  const handleCheckoutNavigation = () => {
    window.scrollTo(0, 0);
    navigate("/checkout");
  };

  const handleRemoveClick = (item) => {
    setSelectedProduct({
      product_Id: item.product_Id,
      name: item.product_Name,
      price: item.price,
      img: item.product_Img,
      category: item.product_Category,
      quantity: item.quantity,
    });
    setIsModalOpen(true);
  };

  const handleConfirmRemove = () => {
    if (selectedProduct && cart.items) {
      const cartItem = cart.items.find(
        (item) => item.product_Id === selectedProduct.product_Id,
      );
      if (cartItem) {
        removeFromCart(cartItem.cartItem_Id);
      }
    }
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleKeepShoppingFromModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const fetchJustForMeProducts = async () => {
    setJustForMeLoading(true);
    try {
      const data = await api.getProducts();
      const filteredProducts = data.filter(
        (product) =>
          product.justForMe === true && Number(product.quantity || 0) > 0,
      );
      setJustForMeProducts(filteredProducts);
    } catch (error) {
      console.error("Error fetching Just for Me products:", error);
    } finally {
      setJustForMeLoading(false);
    }
  };

  useEffect(() => {
    fetchJustForMeProducts();
  }, []);

  if (loading) {
    return <div className="pt-[70px] text-center">Loading cart...</div>;
  }

  // Check if cart is empty
  const isCartEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <div className="pt-[70px] w-full flex justify-center">
      <div className="w-full flex max-w-[1240px] max-md:flex-col max-md:items-center max-md:gap-12">
        <div className="w-full border-r border-[#E5E5E5] max-md:flex max-md:flex-col max-md:items-center max-md:gap-12 max-sm:px-4">
          <p className="mb-[30px] max-sm:mb-0 text-[24px] font-bold">
            {translate("shoppingCart")} ({cart?.totalItems || 0})
          </p>

          {isCartEmpty ? (
            <>
              <div className="mx-[200px] mt-[77px] mb-[112px] flex flex-col items-center max-w-[344px] max-md:p-0 max-md:m-0">
                <p className="text-[16px] font-extrabold mx-auto mb-[32px]">
                  {translate("emptyCart")}
                </p>
                <p className="text-[14px] leading-[17px] max-w-[290px] mx-auto mb-[43px]">
                  {translate("emptyCartDesc")}
                </p>
                <button
                  className="text-[16px] hover:text-[#4C4C4C] p-[14px] font-bold leading-5 border border-black w-full"
                  onClick={handleKeepShopping}
                >
                  {translate("keepShopping")}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Cart Items List */}
              <div className="px-4 max-md:px-0 space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item.cartItem_Id}
                    className="flex max-sm:flex-col max-sm:items-center gap-4 p-4 max-md:p-0 max-md:border-none max-md:gap-4 border border-gray-200 transition-shadow max-sm:mb-12"
                  >
                    <Link
                      to={`/product/${item.product_Id}`}
                      className="flex-shrink-0"
                    >
                      <img
                        src={`${item.product_Img}`}
                        alt={item.product_Name}
                        className="w-60 h-60 object-contain bg-white rounded-lg"
                      />
                    </Link>
                    <div className="flex-1">
                      <Link
                        to={`/product/${item.product_Id}`}
                        className="font-semibold text-gray-800 hover:text-[#2096D8] transition-colors"
                      >
                        {item.product_Name}
                      </Link>
                      <p className="text-[#2096D8] font-bold mt-1">
                        MKD {item.price?.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(
                                  item.cartItem_Id,
                                  item.quantity - 1,
                                );
                              }
                            }}
                            disabled={item.quantity <= 1}
                            className="w-12 py-2 border border-black hover:border-[#cacaca] hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <span className="w-12 border border-[#cacaca] text-center py-2">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.cartItem_Id,
                                item.quantity + 1,
                              )
                            }
                            className="w-12 py-2 border border-black hover:border-[#cacaca] transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveClick(item)}
                          className="text-red-500 hover:text-red-700 text-sm transition-colors"
                        >
                          {translate("remove")}
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="font-bold text-lg">
                          MKD {item.subtotal?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="mt-6 p-4 max-md:p-0 max-md:border-none w-full border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">
                    {translate("subtotal")}:
                  </span>
                  <span className="text-lg font-bold">
                    MKD {cart.total?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                  <span>{translate("shipping")}:</span>
                  <span>{translate("calculatedAtCheckout")}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-xl font-bold">
                    {translate("total")}:
                  </span>
                  <span className="text-xl font-bold text-[#2096D8]">
                    MKD {cart.total?.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col w-full items-center">
                  <button
                    className="w-full mt-6 max-w-[300px] bg-[#8DC658] text-white py-3 font-semibold hover:bg-[#97d260] transition-colors"
                    onClick={handleCheckoutNavigation}
                  >
                    {translate("proceedTocheckout")}
                  </button>
                  <button
                    onClick={handleKeepShopping}
                    className="w-full mt-3 max-w-[300px] text-gray-500 hover:text-[#8DC658] text-sm transition-colors"
                  >
                    {translate("keepShopping")}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Just for me section */}
          <div className="flex flex-col px-4 max-sm:px-0 mt-8">
            <div className="flex justify-between items-center mb-[12px]">
              <p className="text-[24px] font-bold">{translate("justForMe")}</p>
              {justForMeProducts.length > 0 && (
                <button
                  onClick={handleShowAllJustForMe}
                  className="text-sm text-[#2096D8] hover:text-[#1a7ab3] transition-colors font-semibold"
                >
                  {translate("viewAll")}
                </button>
              )}
            </div>

            {justForMeLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{translate("loading")}</p>
              </div>
            ) : justForMeProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{translate("noProductsJFM")}</p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-6 mt-4">
                  {justForMeProducts.slice(0, 4).map((product) => (
                    <Link
                      key={product.product_Id}
                      to={`/product/${product.product_Id}`}
                      className="group bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col"
                      style={{ width: "290px", minWidth: "290px" }}
                    >
                      <div className="w-full h-[268px] overflow-hidden bg-gray-100">
                        <img
                          src={`${product.img}`}
                          alt={product.name}
                          className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-sm">
                          {product.name}
                        </h3>
                        <p className="text-[#2096D8] font-bold text-lg mt-auto">
                          MKD {product.price?.toFixed(2)}
                        </p>
                        {product.servings > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {product.servings} {translate("servings")}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                {justForMeProducts.length > 4 && (
                  <div className="text-center mt-6 mb-8">
                    <button
                      onClick={handleShowAllJustForMe}
                      className="border border-gray-400 text-gray-500 text-[13px] font-semibold py-[10px] px-[60px] leading-4 hover:border-black hover:text-black transition-all duration-300 ease-in-out"
                    >
                      {translate("showAll")}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="pt-[20px] pb-[30px] pl-[45px] w-full max-w-[438px] max-h-[600px] sticky max-sm:p-8">
          <p className="text-[20px] mb-[30px] font-bold">
            {translate("advOfShoppingOnPS")}
          </p>
          <div className="mb-[33px]">
            <div className="flex gap-2 mb-[5px]">
              <IoCheckmarkSharp size={24} color="##0000008A" />
              <div className="flex flex-col">
                <p className="text-[16px] text-[#0B0B0B] font-bold mb-[5px]">
                  {translate("giftWithEveryPurchase")}
                </p>
                <p className="text-[12px] mb-[15px]">
                  {translate("weAddGiftToEveryPurchase")}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mb-[5px]">
              <IoCheckmarkSharp size={24} color="##0000008A" />
              <div className="flex flex-col">
                <p className="text-[16px] text-[#0B0B0B] font-bold mb-[5px]">
                  {translate("loyaltyPoints")}
                </p>
                <p className="text-[12px] mb-[15px]">
                  {translate("collectLPAndBuyCheaper")}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mb-[5px]">
              <IoCheckmarkSharp size={24} color="##0000008A" />
              <div className="flex flex-col">
                <p className="text-[16px] text-[#0B0B0B] font-bold mb-[5px]">
                  {translate("secureCardPayments")}
                </p>
                <p className="text-[12px] mb-[15px]">
                  {translate("mastercardVisa")}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mb-[5px]">
              <IoCheckmarkSharp size={24} color="##0000008A" />
              <div className="flex flex-col">
                <p className="text-[16px] text-[#0B0B0B] font-bold mb-[5px]">
                  {translate("fastDelivery")}
                </p>
                <p className="text-[12px] mb-[15px]">
                  {translate("ordersPlacedBy2PMWillBeShippedTheSameDay")}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mb-[5px]">
              <IoCheckmarkSharp size={24} color="##0000008A" />
              <div className="flex flex-col">
                <p className="text-[16px] text-[#0B0B0B] font-bold mb-[5px]">
                  {translate("freeShipping2")}
                </p>
                <p className="text-[12px] mb-[15px]">
                  {translate("forPurchasesOver3000MKD")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Action Modal for Remove Confirmation */}
      <ProductActionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onAddToCart={handleKeepShoppingFromModal}
        onRemoveFromCart={handleConfirmRemove}
        title={translate("removeProduct")}
        addButtonText={translate("keepShopping")}
        addButtonColor="bg-[#dadada]"
        addButtonHoverColor="hover:bg-[#c0c0c0]"
        addButtonTextColor="text-black"
        removeButtonText={translate("delete")}
        removeButtonColor="bg-[#b3233b]"
        removeButtonHoverColor="hover:bg-[#8a1a2c]"
        removeButtonTextColor="text-white"
        showAddButton={true}
        showRemoveButton={true}
        buttonOrder="removeThenAdd"
        showQuantitySelector={false}
      />
    </div>
  );
}
