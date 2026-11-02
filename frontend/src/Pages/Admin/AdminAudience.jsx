import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

export default function AdminAudience() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("subscribers");
  const [subscribers, setSubscribers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = tab === "subscribers"
          ? await api.getNewsletterSubscribers({ search, page })
          : await api.getRegisteredUsers({ search, page });
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
    setError("");
    try {
      const isActive = !subscriber.isActive;
      await api.updateNewsletterSubscriberStatus(subscriber.id, isActive);
      setSubscribers((current) =>
        current.map((item) =>
          item.id === subscriber.id ? { ...item, isActive } : item,
        ),
      );
    } catch (updateError) {
      setError(updateError.message);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Customers and newsletter</h1>
            <p className="mt-1 text-sm text-gray-600">View and export newsletter subscriptions and registered shop accounts.</p>
          </div>
          <button onClick={() => navigate("/admin-panel")} className="border bg-white px-4 py-2 font-semibold">Back to products</button>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          <button onClick={() => { setTab("subscribers"); setPage(1); }} className={`px-4 py-2 font-semibold ${tab === "subscribers" ? "bg-[#FDC700]" : "bg-white"}`}>
            Newsletter{tab === "subscribers" ? ` (${totalCount})` : ""}
          </button>
          <button onClick={() => { setTab("users"); setPage(1); }} className={`px-4 py-2 font-semibold ${tab === "users" ? "bg-[#FDC700]" : "bg-white"}`}>
            Registered users{tab === "users" ? ` (${totalCount})` : ""}
          </button>
          <button onClick={() => api.downloadAdminAudience(tab)} className="ml-auto bg-[#2096D8] px-4 py-2 font-semibold text-white">Export CSV</button>
        </div>

        <input
          type="search"
          value={search}
          onChange={(event) => { setSearch(event.target.value); setPage(1); }}
          placeholder={tab === "subscribers" ? "Search subscribers" : "Search customers"}
          className="mb-5 w-full border border-gray-300 bg-white px-4 py-2 md:max-w-md"
        />

        {error && <p className="mb-4 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {loading ? <p>Loading...</p> : (
          <div className="overflow-x-auto bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100">
                {tab === "subscribers" ? (
                  <tr><th className="p-3">Email</th><th className="p-3">Source / consent</th><th className="p-3">Subscribed</th><th className="p-3">Status</th></tr>
                ) : (
                  <tr><th className="p-3">ID</th><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Phone</th><th className="p-3">Type</th><th className="p-3">Orders</th><th className="p-3">Order value</th><th className="p-3">Company</th></tr>
                )}
              </thead>
              <tbody className="divide-y">
                {tab === "subscribers" ? rows.map((item) => (
                  <tr key={item.id}><td className="p-3 font-medium">{item.email}</td><td className="p-3">{item.consentSource || item.source || "website"}<span className="block text-xs text-gray-500">{item.consentCapturedAt ? new Date(item.consentCapturedAt).toLocaleString() : "Legacy consent date unavailable"}</span></td><td className="p-3">{new Date(item.subscribedAt).toLocaleString()}</td><td className="p-3"><button type="button" onClick={() => toggleSubscriber(item)} className={`px-3 py-1 text-xs font-semibold ${item.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>{item.isActive ? "Active" : "Inactive"}</button></td></tr>
                )) : rows.map((item) => (
                  <tr key={item.user_Id}><td className="p-3">{item.user_Id}</td><td className="p-3 font-medium">{item.user_FullName}</td><td className="p-3">{item.user_Email}</td><td className="p-3">{item.user_Phone || "—"}</td><td className="p-3">{item.user_IsCompany ? "Company" : "Individual"}{item.superAdmin ? " · Admin" : ""}</td><td className="p-3">{item.orderCount || 0}<span className="block text-xs text-gray-500">{item.lastOrderAt ? new Date(item.lastOrderAt).toLocaleDateString() : "No orders"}</span></td><td className="p-3">MKD {Number(item.lifetimeOrderValue || 0).toFixed(2)}</td><td className="p-3">{item.company_Name || "—"}</td></tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && <p className="p-8 text-center text-gray-500">No matching records.</p>}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between">
          <button disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)} className="border bg-white px-4 py-2 disabled:opacity-50">Previous</button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages || loading} onClick={() => setPage((current) => current + 1)} className="border bg-white px-4 py-2 disabled:opacity-50">Next</button>
        </div>
      </div>
    </main>
  );
}
