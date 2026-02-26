"use client";
import { useEffect, useState, useCallback } from "react";
import PortalShell from "@/components/portal/PortalShell";
import {
  getExperiments,
  addExperiment,
  updateExperiment,
  deleteExperiment,
} from "@/lib/firestore/experiments";
import { useAuth } from "@/context/AuthContext";
import type { Experiment } from "@/types";

const EMPTY: Omit<Experiment, "id"> = {
  title: "",
  type: "",
  status: "building",
  summary: "",
  link: "",
};

const STATUS_COLORS: Record<Experiment["status"], string> = {
  building: "bg-blue-400/10 text-blue-400",
  scaling: "bg-emerald-400/10 text-emerald-400",
  research: "bg-yellow-400/10 text-yellow-400",
  archived: "bg-white/5 text-white/30",
};

export default function ExperimentsPage() {
  const { user } = useAuth();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Experiment | null>(null);
  const [form, setForm] = useState<Omit<Experiment, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setExperiments(await getExperiments(user.uid));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setError("");
    setShowForm(true);
  };

  const openEdit = (exp: Experiment) => {
    setEditing(exp);
    const { id: _id, ...rest } = exp;
    setForm(rest);
    setError("");
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editing) {
        await updateExperiment(editing.id, form);
      } else {
        await addExperiment(user!.uid, form);
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
    if (!confirm("Delete this experiment permanently?")) return;
    await deleteExperiment(id);
    await load();
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-emerald-400/50 transition-colors text-sm";

  return (
    <PortalShell
      title="Experiments"
      action={
        <button onClick={openAdd} className="px-4 py-2 bg-emerald-400 text-black text-sm font-semibold rounded-lg hover:bg-emerald-300 transition-colors">
          + Add Experiment
        </button>
      }
    >
      {/* Form */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold">{editing ? "Edit Experiment" : "New Experiment"}</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-white/30 hover:text-white transition-colors text-xl leading-none">×</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/30 mb-1.5">Title *</label>
              <input
                required
                placeholder="Experiment title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-white/30 mb-1.5">Type</label>
              <input
                placeholder="e.g. SaaS, Hardware, Content…"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-white/30 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Experiment["status"] }))}
                className={inputCls}
              >
                <option value="building">Building</option>
                <option value="scaling">Scaling</option>
                <option value="research">Research</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/30 mb-1.5">Link</label>
              <input
                type="url"
                placeholder="https://..."
                value={form.link}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs text-white/30 mb-1.5">Summary</label>
              <textarea
                rows={3}
                placeholder="What is this experiment about?"
                value={form.summary}
                onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                className={inputCls + " resize-none"}
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

          <div className="flex gap-3 mt-5">
            <button type="submit" disabled={saving} className="px-5 py-2 bg-emerald-400 text-black text-sm font-semibold rounded-lg hover:bg-emerald-300 disabled:opacity-50 transition-colors">
              {saving ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 bg-white/5 text-white/60 text-sm rounded-lg hover:text-white hover:bg-white/10 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin border-2 border-emerald-400 border-t-transparent rounded-full" />
        </div>
      ) : experiments.length === 0 ? (
        <div className="text-center py-16 text-white/20">No experiments yet. Add one above.</div>
      ) : (
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-widest">Title</th>
                <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-widest hidden md:table-cell">Type</th>
                <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-widest">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {experiments.map((exp) => (
                <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-white font-medium">{exp.title}</p>
                    <p className="text-xs text-white/30 mt-0.5 truncate max-w-xs">{exp.summary}</p>
                  </td>
                  <td className="px-5 py-3.5 text-white/40 hidden md:table-cell capitalize">{exp.type || "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[exp.status]}`}>
                      {exp.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3 justify-end">
                      <button onClick={() => openEdit(exp)} className="text-xs text-white/30 hover:text-white transition-colors">Edit</button>
                      <button onClick={() => handleDelete(exp.id)} className="text-xs text-white/30 hover:text-red-400 transition-colors">Delete</button>
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
