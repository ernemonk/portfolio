"use client";
import { useEffect, useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import {
  getProjects,
  addProject,
  updateProject,
  deleteProject,
} from "@/lib/firestore/projects";
import type { Project } from "@/types";

const EMPTY: Omit<Project, "id"> = {
  title: "",
  summary: "",
  problem: "",
  solution: "",
  techStack: [],
  metrics: "",
  images: [],
  link: "",
  featured: false,
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<Omit<Project, "id">>(EMPTY);
  const [techInput, setTechInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setProjects(await getProjects());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setTechInput("");
    setError("");
    setShowForm(true);
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    const { id: _id, ...rest } = p;
    setForm(rest);
    setTechInput(p.techStack?.join(", ") ?? "");
    setError("");
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { ...form, techStack: techInput.split(",").map((t) => t.trim()).filter(Boolean) };
      if (editing) {
        await updateProject(editing.id, payload);
      } else {
        await addProject(payload);
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
    if (!confirm("Delete this project permanently?")) return;
    await deleteProject(id);
    await load();
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-emerald-400/50 transition-colors text-sm";

  return (
    <PortalShell
      title="Projects"
      action={
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-emerald-400 text-black text-sm font-semibold rounded-lg hover:bg-emerald-300 transition-colors"
        >
          + Add Project
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
              {editing ? "Edit Project" : "New Project"}
            </h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-white/30 hover:text-white transition-colors text-xl leading-none">×</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/30 mb-1.5">Title *</label>
              <input
                required
                placeholder="Project title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={inputCls}
              />
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
                rows={2}
                placeholder="Short summary…"
                value={form.summary}
                onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                className={inputCls + " resize-none"}
              />
            </div>
            <div>
              <label className="block text-xs text-white/30 mb-1.5">Problem</label>
              <textarea
                rows={3}
                placeholder="What problem does it solve?"
                value={form.problem}
                onChange={(e) => setForm((f) => ({ ...f, problem: e.target.value }))}
                className={inputCls + " resize-none"}
              />
            </div>
            <div>
              <label className="block text-xs text-white/30 mb-1.5">Solution</label>
              <textarea
                rows={3}
                placeholder="How does it solve it?"
                value={form.solution}
                onChange={(e) => setForm((f) => ({ ...f, solution: e.target.value }))}
                className={inputCls + " resize-none"}
              />
            </div>
            <div>
              <label className="block text-xs text-white/30 mb-1.5">Tech Stack (comma-separated)</label>
              <input
                placeholder="React, Node.js, Firebase…"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-white/30 mb-1.5">Metrics</label>
              <input
                placeholder="e.g. 10k users, $50k ARR"
                value={form.metrics}
                onChange={(e) => setForm((f) => ({ ...f, metrics: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="proj-featured"
                checked={form.featured}
                onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                className="accent-emerald-400"
              />
              <label htmlFor="proj-featured" className="text-sm text-white/60 cursor-pointer">
                Show on homepage
              </label>
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

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin border-2 border-emerald-400 border-t-transparent rounded-full" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 text-white/20">No projects yet. Add one above.</div>
      ) : (
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-widest">Title</th>
                <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-widest hidden md:table-cell">Tech</th>
                <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-widest hidden lg:table-cell">Metrics</th>
                <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-widest hidden lg:table-cell">Featured</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-white font-medium">{p.title}</p>
                    <p className="text-xs text-white/30 mt-0.5 truncate max-w-xs">{p.summary}</p>
                  </td>
                  <td className="px-5 py-3.5 text-white/40 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {p.techStack?.slice(0, 3).map((t) => (
                        <span key={t} className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-white/40 hidden lg:table-cell text-xs">{p.metrics || "—"}</td>
                  <td className="px-5 py-3.5 text-white/40 hidden lg:table-cell">{p.featured ? "✓" : "—"}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3 justify-end">
                      <button onClick={() => openEdit(p)} className="text-xs text-white/30 hover:text-white transition-colors">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="text-xs text-white/30 hover:text-red-400 transition-colors">Delete</button>
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
