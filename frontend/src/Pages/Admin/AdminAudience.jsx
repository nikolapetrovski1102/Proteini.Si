import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiDownload, FiUsers } from "react-icons/fi";
import { api } from "../../services/api";
import {
  AdminPage,
  Badge,
  Button,
  Card,
  EmptyState,
  Notice,
  SearchInput,
  Segmented,
  tableClass,
  tdClass,
  thClass,
  trClass,
} from "./AdminKit";
import { useToast } from "./adminFeedback";
import { formatDate, formatDateTime, formatMoney } from "./adminUtils";

export default function AdminAudience() {
  const toast = useToast();
  const [tab, setTab] = useState("subscribers");
  const [subscribers, setSubscribers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response =
          tab === "subscribers" ? await api.getNewsletterSubscribers({ search, page }) : await api.getRegisteredUsers({ search, page });
        if (tab === "subscribers") setSubscribers(response.data || []);
        else setUsers(response.data || []);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.totalCount || 0);
        setError("");
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [page, search, tab]);

  const rows = tab === "subscribers" ? subscribers : users;

  const toggleSubscriber = async (subscriber) => {
    try {
      const isActive = !subscriber.isActive;
      await api.updateNewsletterSubscriberStatus(subscriber.id, isActive);
      setSubscribers((current) => current.map((item) => (item.id === subscriber.id ? { ...item, isActive } : item)));
      toast.success(isActive ? `${subscriber.email} will receive the newsletter again.` : `${subscriber.email} unsubscribed.`);
    } catch (updateError) {
      toast.error(updateError.message);
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      await api.downloadAdminAudience(tab);
    } catch (e) {
      toast.error(e.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminPage
      eyebrow="Shop"
      title="Customers"
      description="Everyone who signed up for the newsletter or created a shop account. Export a list to use in your email tool."
      actions={
        <Button icon={FiDownload} onClick={exportCsv} loading={exporting}>
          Export {tab === "subscribers" ? "subscribers" : "accounts"}
        </Button>
      }
    >
      <Card bodyClassName="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Segmented
            value={tab}
            onChange={(v) => {
              setTab(v);
              setPage(1);
            }}
            options={[
              { value: "subscribers", label: "Newsletter", count: tab === "subscribers" && !loading ? totalCount : undefined },
              { value: "users", label: "Accounts", count: tab === "users" && !loading ? totalCount : undefined },
            ]}
          />
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder={tab === "subscribers" ? "Search by email" : "Search by name, email or phone"}
            className="sm:ml-auto sm:w-80"
          />
        </div>
      </Card>

      {error && <Notice tone="error">{error}</Notice>}

      <Card bodyClassName="">
        {loading ? (
          <div className="space-y-2 p-5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-black/[0.04]" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={FiUsers} title="Nobody found" text={search ? "Try a different search." : "No records yet."} />
        ) : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                {tab === "subscribers" ? (
                  <tr>
                    <th className={thClass}>Email</th>
                    <th className={thClass}>Signed up from</th>
                    <th className={thClass}>Subscribed</th>
                    <th className={`${thClass} text-right`}>Receives newsletter</th>
                  </tr>
                ) : (
                  <tr>
                    <th className={thClass}>Customer</th>
                    <th className={thClass}>Phone</th>
                    <th className={thClass}>Type</th>
                    <th className={`${thClass} text-right`}>Orders</th>
                    <th className={`${thClass} text-right`}>Total spent</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {tab === "subscribers"
                  ? rows.map((item) => (
                      <tr key={item.id} className={trClass}>
                        <td className={`${tdClass} font-semibold text-gray-900`}>{item.email}</td>
                        <td className={tdClass}>
                          <span className="capitalize">{item.consentSource || item.source || "website"}</span>
                          <span className="block text-xs text-gray-500">
                            {item.consentCapturedAt ? `Consent ${formatDateTime(item.consentCapturedAt)}` : "Consent date not recorded"}
                          </span>
                        </td>
                        <td className={`${tdClass} whitespace-nowrap text-gray-600`}>{formatDate(item.subscribedAt)}</td>
                        <td className={`${tdClass} text-right`}>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={item.isActive}
                            onClick={() => toggleSubscriber(item)}
                            aria-label={`Newsletter for ${item.email}`}
                            className={`relative inline-flex h-6 w-10 items-center rounded-full transition ${item.isActive ? "bg-[#141409]" : "bg-black/[0.15]"}`}
                          >
                            <span className={`absolute h-5 w-5 rounded-full shadow transition ${item.isActive ? "left-[18px] bg-[#FDC700]" : "left-0.5 bg-white"}`} />
                          </button>
                        </td>
                      </tr>
                    ))
                  : rows.map((item) => (
                      <tr key={item.user_Id} className={trClass}>
                        <td className={tdClass}>
                          <span className="block font-semibold text-gray-900">{item.user_FullName}</span>
                          <span className="block text-xs text-gray-500">{item.user_Email}</span>
                        </td>
                        <td className={`${tdClass} whitespace-nowrap text-gray-600`}>{item.user_Phone || "—"}</td>
                        <td className={tdClass}>
                          <div className="flex flex-wrap gap-1">
                            <Badge tone={item.user_IsCompany ? "blue" : "neutral"}>{item.user_IsCompany ? item.company_Name || "Company" : "Individual"}</Badge>
                            {item.superAdmin && <Badge tone="ink">Admin</Badge>}
                          </div>
                        </td>
                        <td className={`${tdClass} text-right`}>
                          <span className="font-semibold tabular-nums">{item.orderCount || 0}</span>
                          <span className="block text-xs text-gray-500">{item.lastOrderAt ? `Last ${formatDate(item.lastOrderAt)}` : "No orders"}</span>
                        </td>
                        <td className={`${tdClass} whitespace-nowrap text-right font-semibold tabular-nums`}>{formatMoney(item.lifetimeOrderValue)}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={FiChevronLeft} disabled={page <= 1 || loading} onClick={() => setPage((c) => c - 1)}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage((c) => c + 1)}>
              Next <FiChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </AdminPage>
  );
}
