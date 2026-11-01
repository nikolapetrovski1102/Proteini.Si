import { useNavigate } from "react-router-dom";
import { useLanguage } from "../translation/LanguageContext";

export default function OutletBranches() {
  const { translate } = useLanguage();
  const navigate = useNavigate();

  const handleShowAllInOutlet = () => {
    window.scrollTo(0, 0);
    navigate("/products", {
      state: {
        preSelectedFilter: "outlet",
        filterValue: true,
      },
    });
  };

  const handleShowAllNewProducts = () => {
    window.scrollTo(0, 0);
    navigate("/products", {
      state: {
        preSelectedFilter: "newProducts",
        filterValue: true,
      },
    });
  };

  const handleBranchesNavigation = () => {
    window.scrollTo(0, 0);
    navigate("/sales-points");
  };

  const handlePurchaseProcessNavigation = () => {
    window.scrollTo(0, 0);
    navigate("/help/purchase-process");
  };

  return (
    <div className="w-full pt-[60px] sm:pt-[124px] pb-[20px]">
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[1240px] flex flex-col justify-center items-center px-[15px]">
          {/* Mobile: 2x2 grid, Desktop: 1x4 flex */}
          <div className="w-full grid grid-cols-2 gap-4 sm:flex sm:gap-0">
            <div className="relative group cursor-pointer mx-0 sm:mx-[7px] mb-[14px]">
              <img
                src="/img/outlet.jpg"
                className="w-full object-cover aspect-square sm:aspect-auto"
                alt="Outlet"
              />
              <div
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300"
                onClick={handleShowAllInOutlet}
              ></div>
              <span className="absolute bottom-0 left-0 w-full py-3 sm:py-[10px] px-[5px] text-center font-semibold text-white bg-black/70 text-[12px] sm:text-base min-h-[80px] sm:min-h-[105px] flex items-center justify-center">
                {translate("outlet")}
              </span>
            </div>

            <div className="relative group cursor-pointer mx-0 sm:mx-[7px] mb-[14px]">
              <img
                src="/img/branches.jpg"
                alt="Branches"
                className="w-full object-cover aspect-square sm:aspect-auto"
              />
              <div
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300"
                onClick={handleBranchesNavigation}
              ></div>
              <span className="absolute bottom-0 left-0 w-full py-3 sm:py-[10px] px-[5px] text-center font-semibold text-white bg-black/70 text-[12px] sm:text-base min-h-[80px] sm:min-h-[105px] flex items-center justify-center">
                {translate("branches")}
              </span>
            </div>

            <div className="relative group cursor-pointer mx-0 sm:mx-[7px] mb-[14px]">
              <img
                src="/img/purchase-process.jpg"
                alt="Purchase process"
                className="w-full object-cover aspect-square sm:aspect-auto"
              />
              <div
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300"
                onClick={handlePurchaseProcessNavigation}
              ></div>
              <span className="absolute bottom-0 left-0 w-full py-3 sm:py-[10px] px-[5px] text-center font-semibold text-white bg-black/70 text-[12px] sm:text-base min-h-[80px] sm:min-h-[105px] flex items-center justify-center">
                {translate("purchaseProcess")}
              </span>
            </div>

            <div className="relative group cursor-pointer mx-0 sm:mx-[7px] mb-[14px]">
              <img
                src="/img/new.jpg"
                alt="New"
                className="w-full object-cover aspect-square sm:aspect-auto"
              />
              <div
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300"
                onClick={handleShowAllNewProducts}
              ></div>
              <span className="absolute bottom-0 left-0 w-full py-3 sm:py-[10px] px-[5px] text-center font-semibold text-white bg-black/70 text-[12px] sm:text-base min-h-[80px] sm:min-h-[105px] flex items-center justify-center">
                {translate("new")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
