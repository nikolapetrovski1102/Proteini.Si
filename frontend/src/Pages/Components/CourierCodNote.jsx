import { FiInfo } from "react-icons/fi";
import { getCourierCodCommission } from "../../utils/deliveryPricing";
import { formatMkd as money } from "../../utils/formatPrice";

const percentText = (value) => String(Number(value.toFixed(2))).replace(".", ",");

// Cash on delivery: the courier charges the buyer its own commission for collecting the payment.
// Shown at checkout and on the order page; the amount is not part of our order total.
export function CourierCodNote({ amount, settings, translate, className = "" }) {
  const { threshold, fixedFee, percent, commission } = getCourierCodCommission(amount, settings || {});
  const text = translate("courierCodNoteText")
    .replaceAll("{threshold}", money(threshold))
    .replaceAll("{fixed}", money(fixedFee))
    .replaceAll("{percent}", percentText(percent));

  return (
    <div
      role="note"
      className={`flex gap-3 rounded-xl bg-[#FDC700]/15 px-4 py-3 text-xs leading-relaxed text-gray-800 ring-1 ring-[#FDC700]/50 ${className}`}
    >
      <FiInfo className="mt-0.5 flex-shrink-0 text-[#5c4800]" size={16} aria-hidden="true" />
      <div>
        <p className="font-bold text-gray-900">{translate("courierCodNoteTitle")}</p>
        <p className="mt-1">{text}</p>
        <p className="mt-1.5 font-semibold tabular-nums text-gray-900">
          {translate("courierCodNoteThisOrder").replace("{amount}", money(commission))}
        </p>
      </div>
    </div>
  );
}
