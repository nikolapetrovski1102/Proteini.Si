import { useState } from "react";
import { FiCheck, FiSearch } from "react-icons/fi";
import { api } from "../../services/api";
import { Badge, Button, Card, Field, Notice, inputClass } from "./AdminKit";
import { useConfirm, useToast } from "./adminFeedback";
import { formatDate, formatDateTime, formatMoney } from "./adminUtils";

const STATUS_TONE = { active: "green", disabled: "neutral", depleted: "ink", redeemed: "ink", expired: "orange" };

const STATUS_HELP = {
  active: "Valid. It can be used.",
  disabled: "Disabled. It can't be used until it is enabled again.",
  depleted: "Fully used. No balance left.",
  redeemed: "Fully used. No balance left.",
  expired: "Expired. It can't be used.",
};

const join = (...parts) => parts.filter(Boolean).join(" · ");

const redemptionLine = (row) =>
  join(
    row.channel === "store" ? "Redeemed in admin" : `Online order #${row.orderNumber || row.orderId}`,
    row.status === "reserved" ? "reserved, waiting for payment" : row.status === "released" ? "released (order not paid)" : null,
    row.redeemedBy,
    row.note,
  );

/** Staff check a gift voucher code (balance, buyer, recipient, history) and can deduct an amount by hand. */
export default function VoucherRedeemCard({ onRedeemed }) {
  const confirm = useConfirm();
  const toast = useToast();
  const [code, setCode] = useState("");
  const [voucher, setVoucher] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [checking, setChecking] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState("");

  const show = (details) => {
    setVoucher(details);
    setAmount(details?.remainingValue > 0 ? String(details.remainingValue) : "");
    setNote("");
  };

  const lookup = async (event) => {
    event.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setChecking(true);
    setError("");
    setVoucher(null);
    try {
      show(await api.lookupGiftVoucher(trimmed));
    } catch (lookupError) {
      setError(lookupError.message);
    } finally {
      setChecking(false);
    }
  };

  const redeem = async (event) => {
    event.preventDefault();
    const value = Number(amount);
    if (!voucher || !(value > 0)) {
      setError("Enter the amount to deduct.");
      return;
    }
    if (value > Number(voucher.remainingValue)) {
      setError(`The amount is more than the remaining balance (${formatMoney(voucher.remainingValue)}).`);
      return;
    }
    const ok = await confirm({
      title: `Deduct ${formatMoney(value)} from ${voucher.code}?`,
      message: `Balance after: ${formatMoney(Number(voucher.remainingValue) - value)}. This can't be undone.`,
      confirmLabel: "Redeem",
    });
    if (!ok) return;

    setRedeeming(true);
    setError("");
    try {
      const updated = await api.redeemGiftVoucher({ code: voucher.code, amount: value, note: note.trim() || null });
      show(updated);
      toast.success(`${formatMoney(value)} redeemed. Remaining ${formatMoney(updated.remainingValue)}.`);
      onRedeemed?.();
    } catch (redeemError) {
      setError(redeemError.message);
    } finally {
      setRedeeming(false);
    }
  };

  const usable = voucher?.status === "active" && Number(voucher.remainingValue) > 0;

  return (
    <Card title="Check & redeem a code" description="Check a code’s balance and history. Redeem deducts an amount by hand, e.g. for a correction. Customers use their codes online at checkout.">
      <form onSubmit={lookup} className="flex flex-wrap gap-2">
        <input
          className={`${inputClass} max-w-xs font-mono uppercase`}
          placeholder="PTV-…"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          aria-label="Gift voucher code"
        />
        <Button type="submit" variant="secondary" icon={FiSearch} disabled={checking || !code.trim()}>
          {checking ? "Checking…" : "Check"}
        </Button>
      </form>

      {error && (
        <Notice tone="error" className="mt-4" onDismiss={() => setError("")}>
          {error}
        </Notice>
      )}

      {voucher && (
        <div className="mt-5 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-lg font-bold">{voucher.code}</p>
              <p className="mt-1 text-sm text-gray-600">{STATUS_HELP[voucher.status] || voucher.status}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold tabular-nums">{formatMoney(voucher.remainingValue || 0)}</p>
              <p className="text-xs text-gray-500">left of {formatMoney(voucher.initialValue || 0)}</p>
              <Badge tone={STATUS_TONE[voucher.status] || "neutral"} className="mt-1 capitalize">
                {voucher.status}
              </Badge>
            </div>
          </div>

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-gray-500">Bought by</dt>
              <dd>
                {join(voucher.purchaserName, voucher.purchaserEmail) || "—"}
                {voucher.purchasedOrderNumber && <span className="block text-xs text-gray-500">Order #{voucher.purchasedOrderNumber}</span>}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-gray-500">For</dt>
              <dd>{join(voucher.recipientName, voucher.recipientEmail) || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-gray-500">Valid</dt>
              <dd>{join(`from ${formatDate(voucher.validFrom)}`, voucher.expiresAt ? `until ${formatDate(voucher.expiresAt)}` : "no expiry")}</dd>
            </div>
            {voucher.giftMessage && (
              <div>
                <dt className="text-xs font-semibold text-gray-500">Message</dt>
                <dd className="whitespace-pre-line italic text-gray-700">“{voucher.giftMessage}”</dd>
              </div>
            )}
          </dl>

          {usable && (
            <form onSubmit={redeem} className="grid gap-3 rounded-xl bg-black/[0.03] p-4 sm:grid-cols-[160px_minmax(0,1fr)_auto] sm:items-end">
              <Field label="Amount to deduct" htmlFor="voucher-redeem-amount">
                <input
                  id="voucher-redeem-amount"
                  type="number"
                  min="1"
                  step="1"
                  max={voucher.remainingValue}
                  className={inputClass}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </Field>
              <Field label="Note (optional)" htmlFor="voucher-redeem-note">
                <input
                  id="voucher-redeem-note"
                  className={inputClass}
                  maxLength={500}
                  placeholder="e.g. reason"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Field>
              <Button type="submit" icon={FiCheck} disabled={redeeming}>
                {redeeming ? "Redeeming…" : "Redeem"}
              </Button>
            </form>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-500">History</p>
            {voucher.redemptions?.length ? (
              <ul className="mt-1 divide-y divide-black/[0.06] text-sm">
                {voucher.redemptions.map((row) => (
                  <li key={row.giftVoucherRedemptionId} className="flex flex-wrap justify-between gap-2 py-2">
                    <span className="min-w-0">
                      <span className="block">{redemptionLine(row)}</span>
                      <span className="block text-xs text-gray-500">{formatDateTime(row.completedAt || row.createdAt)}</span>
                    </span>
                    <span className={`tabular-nums font-semibold ${row.status === "released" ? "text-gray-400 line-through" : ""}`}>
                      − {formatMoney(row.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-gray-500">Not used yet.</p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
