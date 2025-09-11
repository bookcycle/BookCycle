import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function RejectedBooks() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    try {
      setLoading(true);
      const data = await api.get("/books/admin/rejected");
      setRows(data.docs || []);
      setErr("");
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function approve(id) {
    try {
      await api.patch(`/books/admin/${id}/status`, { status: "accepted" });
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
      <h1 className="text-2xl font-semibold mb-4">Rejected Books</h1>
      <div className="space-y-3">
        {rows.map(b => (
          <div key={b._id} className="border p-4 rounded-lg flex items-center justify-between">
            <div>
              <div className="font-medium">{b.title}</div>
              <div className="text-sm text-gray-600">{b.author} • {b.type}</div>
              <div className="text-xs text-gray-500">Owner: {b?.owner?.firstName} {b?.owner?.lastName} ({b?.owner?.email})</div>
            </div>
            <div>
              <button onClick={() => approve(b._id)} className="px-3 py-2 rounded bg-teal-600 text-white">Approve</button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="text-gray-600">No rejected books.</div>}
      </div>
    </div>
  );
}
