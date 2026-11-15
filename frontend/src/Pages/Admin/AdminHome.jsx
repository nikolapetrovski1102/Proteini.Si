import { createElement, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiPlus, FiShoppingBag } from "react-icons/fi";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { ADMIN_NAV } from "./adminNav";
import {
  AdminPage,
  Card,
  EmptyState,
  OrderStatusBadge,
  cardClass,
} from "./AdminKit";
import { buttonClass, formatDateTime, formatMoney } from "./adminUtils";

const pick = (o, a, b) => o?.[a] ?? o?.[b];

/** Admin landing page: what needs attention now, then a map of every screen. */
export default function AdminHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ newOrders: null, total: null });
  const [recent, setRecent] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      api.getAdminOrders({ page: 1, pageSize: 6, sortBy: "date", sortOrder: "desc" }),
      api.getAdminOrders({ page: 1, pageSize: 1, orderStatus: "pending" }),
    ]).then(([latest, pending]) => {
      if (cancelled) return;
      const latestOk = latest.status === "fulfilled" ? latest.value : null;
      setRecent(latestOk?.orders || []);
      setStats({
        total: latestOk?.totalCount ?? null,
        newOrders: pending.status === "fulfilled" ? pending.value?.totalCount ?? 0 : null,
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const firstName = (user?.user_FullName || user?.User_FullName || "").trim().split(/\s+/)[0];

  return (
    <AdminPage
      eyebrow="Overview"
      title={firstName ? `Hi, ${firstName}` : "Welcome back"}
      description="Start with anything that needs your attention, or jump to a section below. Every change you save goes live on the shop."
      actions={
        <>
          <Link to="/admin-panel" state={{ openNew: true }} className={buttonClass("secondary")}>
            <FiPlus size={16} /> New product
          </Link>
          <Link to="/admin-orders" className={buttonClass("primary")}>
            <FiShoppingBag size={16} /> Open orders
          </Link>
        </>
      }
    >
      {/* attention row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/admin-orders"
          state={{ orderStatus: "pending" }}
          className="admin-ink-panel group relative overflow-hidden rounded-2xl bg-[#141409] p-6 text-white transition hover:shadow-[0_20px_40px_-20px_rgba(20,20,9,0.6)]"
        >
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-[#FDC700]/[0.16] blur-2xl" />
          <p className="relative text-[11px] font-semibold uppercase tracking-[0.08em] text-white/60">New orders waiting</p>
          <p className="relative mt-2 font-display text-6xl font-bold leading-none tabular-nums text-[#FDC700]">
            {stats.newOrders ?? "–"}
          </p>
          <p className="relative mt-3 flex items-center gap-1.5 text-sm font-semibold text-white/80">
            {stats.newOrders ? "Confirm or reject them" : "Nothing waiting right now"}
            <FiArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </p>
        </Link>
        <Link to="/admin-orders" className={`${cardClass} group p-6 transition hover:ring-black/20`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">All orders</p>
          <p className="mt-2 font-display text-6xl font-bold leading-none tabular-nums text-gray-900">{stats.total ?? "–"}</p>
          <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-gray-600">
            Search, filter and export
            <FiArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </p>
        </Link>
      </div>

      {/* latest orders */}
      <Card
        title="Latest orders"
        actions={
          <Link to="/admin-orders" className="text-sm font-semibold text-gray-700 underline decoration-[#FDC700] decoration-2 underline-offset-4 hover:decoration-[#141409]">
            See all
          </Link>
        }
        bodyClassName=""
      >
        {recent === null ? (
          <div className="space-y-2 p-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-black/[0.04]" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState icon={FiShoppingBag} title="No orders yet" text="New orders will appear here as soon as customers check out." />
        ) : (
          <ul className="divide-y divide-black/[0.05]">
            {recent.map((o) => (
              <li key={pick(o, "order_Id", "Order_Id")}>
                <Link
                  to="/admin-orders"
                  state={{ openOrderId: pick(o, "order_Id", "Order_Id") }}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5 transition hover:bg-black/[0.02] sm:px-6"
                >
                  <span className="w-24 font-bold tabular-nums text-gray-900">#{pick(o, "order_Number", "Order_Number")}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-gray-700">{pick(o, "billing_FullName", "Billing_FullName")}</span>
                  <span className="hidden text-xs text-gray-500 md:inline">{formatDateTime(pick(o, "order_Date", "Order_Date"))}</span>
                  <OrderStatusBadge status={pick(o, "order_Status", "Order_Status")} />
                  <span className="w-28 text-right text-sm font-bold tabular-nums text-gray-900">{formatMoney(pick(o, "total_Amount", "Total_Amount"))}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* map of sections */}
      {ADMIN_NAV.map((group) => (
        <section key={group.group}>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">{group.group}</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {group.items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`${cardClass} group flex items-start gap-4 p-4 transition hover:-translate-y-0.5 hover:ring-black/20 hover:shadow-[0_12px_24px_-16px_rgba(20,20,9,0.35)]`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f6f5f1] text-gray-700 transition group-hover:bg-[#FDC700] group-hover:text-[#141409]">
                  {createElement(item.icon, { size: 18, "aria-hidden": true })}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1 text-sm font-bold text-gray-900">
                    {item.label}
                    <FiArrowRight size={13} className="text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-gray-900" />
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-gray-500">{item.description}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </AdminPage>
  );
}
