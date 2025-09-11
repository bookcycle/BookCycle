import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function PendingBooks() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    try {
      setLoading(true);
      const data = await api.get("/books/admin/pending");
      setRows(data.docs || []);
      setErr("");
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(id, status) {
    try {
      await api.patch(`/books/admin/${id}/status`, { status });
      await load();
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div>Loading…</div>;
  if (err) return <div className="text-red-600">{err}</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Pending Books</h1>
      <div className="space-y-3">
        {rows.map(b => (
          <div key={b._id} className="border p-4 rounded-lg flex items-center justify-between">
            <div>
              <div className="font-medium">{b.title}</div>
              <div className="text-sm text-gray-600">{b.author} • {b.type}</div>
              <div className="text-xs text-gray-500">Owner: {b?.owner?.firstName} {b?.owner?.lastName} ({b?.owner?.email})</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => changeStatus(b._id, "accepted")} className="px-3 py-2 rounded bg-green-600 text-white">Approve</button>
              <button onClick={() => changeStatus(b._id, "rejected")} className="px-3 py-2 rounded bg-red-600 text-white">Reject</button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="text-gray-600">No pending books 🎉</div>}
      </div>
    </div>
  );
}
