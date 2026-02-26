"use client";
import { useEffect, useState, useCallback } from "react";
import PortalShell from "@/components/portal/PortalShell";
import {
  getVentures,
  addVenture,
  updateVenture,
  deleteVenture,
} from "@/lib/firestore/ventures";
import { useAuth } from "@/context/AuthContext";
import type { Venture } from "@/types";

const EMPTY: Omit<Venture, "id"> = {
  name: "",
  description: "",
  website: "",
  logoURL: "",
  category: "owned",
  role: "",
  status: "active",
  tags: [],
  featured: false,
};

export default function VenturesPage() {
  const { user } = useAuth();
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Venture | null>(null);
  const [form, setForm] = useState<Omit<Venture, "id">>(EMPTY);
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setVentures(await getVentures(user.uid));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setTagsInput("");
    setError("");
    setShowForm(true);
  };

  const openEdit = (v: Venture) => {
    setEditing(v);
    const { id: _id, ...rest } = v;
    setForm(rest);
    setTagsInput(v.tags?.join(", ") ?? "");
    setError("");
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { ...form, tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean) };
      if (editing) {
        await updateVenture(editing.id, payload);
      } else {
        await addVenture(user!.uid, payload);
      }
      setShowForm(false);
      await load();
    } catch {
      setError("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this venture permanently?")) return;
    await deleteVenture(id);
    await load();
  };

  const field = (key: keyof Omit<Venture, "id">) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-emerald-400/50 transition-colors text-sm";

  return (
    <PortalShell
      title="Ventures"
      action={
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-emerald-400 text-black text-sm font-semibold rounded-lg hover:bg-emerald-300 transition-colors"
        >
          + Add Venture
        </button>
      }
    >
      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold">
              {editing ? "Edit Venture" : "New Venture"}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-white/30 hover:text-white transition-colors text-xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/30 mb-1.5">Name *</label>
              <input required placeholder="Venture name" {...field("name")} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-white/30 mb-1.5">Website</label>
              <input type="url" placeholder="https://..." {...field("website")} className={inputCls} />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs text-white/30 mb-1.5">Description</label>
              <textarea
                rows={3}
                placeholder="Brief description…"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className={inputCls + " resize-none"}
              />
            </div>
            <div>
              <label className="block text-xs text-white/30 mb-1.5">Logo URL</label>
              <input placeholder="https://..." {...field("logoURL")} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-white/30 mb-1.5">Role</label>
              <input placeholder="Founder, Advisor, etc." {...field("role")} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-white/30 mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Venture["category"] }))} className={inputCls}>
                <option value="owned">Owned</option>
                <option value="client">Client</option>
                <option value="investment">Investment</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/30 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Venture["status"] }))} className={inputCls}>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="exited">Exited</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/30 mb-1.5">Tags (comma-separated)</label>
              <input
                placeholder="SaaS, B2B, ..."
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="flex items-center gap-3 pt-4">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                className="accent-emerald-400"
              />
              <label htmlFor="featured" className="text-sm text-white/60 cursor-pointer">
                Show on homepage
              </label>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

          <div className="flex gap-3 mt-5">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-emerald-400 text-black text-sm font-semibold rounded-lg hover:bg-emerald-300 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-white/5 text-white/60 text-sm rounded-lg hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin border-2 border-emerald-400 border-t-transparent rounded-full" />
        </div>
      ) : ventures.length === 0 ? (
        <div className="text-center py-16 text-white/20">No ventures yet. Add one above.</div>
      ) : (
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-widest">Name</th>
                <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-widest hidden md:table-cell">Category</th>
                <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-widest hidden lg:table-cell">Status</th>
                <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-widest hidden lg:table-cell">Featured</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ventures.map((v) => (
                <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-white font-medium">{v.name}</p>
                    {v.role && <p className="text-xs text-white/30 mt-0.5">{v.role}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-white/40 hidden md:table-cell capitalize">{v.category}</td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${v.status === "active" ? "bg-emerald-400/10 text-emerald-400" : "bg-white/5 text-white/30"}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-white/40 hidden lg:table-cell">
                    {v.featured ? "✓" : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3 justify-end">
                      <button
                        onClick={() => openEdit(v)}
                        className="text-xs text-white/30 hover:text-white transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="text-xs text-white/30 hover:text-red-400 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PortalShell>
  );
}
