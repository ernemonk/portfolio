"use client";
import { useEffect, useState, useCallback } from "react";
import PortalShell from "@/components/portal/PortalShell";
import {
  getWorkItems,
  addWorkItem,
  updateWorkItem,
  deleteWorkItem,
} from "@/lib/firestore/workItems";
import { useAuth } from "@/context/AuthContext";
import type { WorkItem, WorkItemType, WorkItemStatus } from "@/types";

const WORK_TYPES: { value: WorkItemType; label: string }[] = [
  { value: "venture", label: "Venture" },
  { value: "project", label: "Project" },
  { value: "experiment", label: "Experiment" },
  { value: "client", label: "Client Work" },
];

const WORK_STATUSES: { value: WorkItemStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "in-development", label: "In Development" },
  { value: "building", label: "Building" },
  { value: "scaling", label: "Scaling" },
  { value: "research", label: "Research" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
  { value: "exited", label: "Exited" },
];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-400/10 text-emerald-400",
  "in-development": "bg-blue-400/10 text-blue-400",
  building: "bg-blue-400/10 text-blue-400",
  scaling: "bg-sky-400/10 text-sky-400",
  research: "bg-yellow-400/10 text-yellow-400",
  completed: "bg-white/5 text-white/40",
  archived: "bg-white/5 text-white/30",
  exited: "bg-white/5 text-white/30",
};

const TYPE_COLORS: Record<string, string> = {
  venture: "bg-purple-400/10 text-purple-400",
  project: "bg-sky-400/10 text-sky-400",
  experiment: "bg-amber-400/10 text-amber-400",
  client: "bg-emerald-400/10 text-emerald-400",
};

type FormData = Omit<WorkItem, "id" | "userId" | "createdAt">;

const EMPTY: FormData = {
  name: "",
  description: "",
  type: "project",
  category: "",
  tags: [],
  status: "active",
  owned: true,
  role: "",
  website: "",
  logoURL: "",
  techStack: [],
  metrics: "",
  images: [],
  featured: false,
  order: 99,
};

export default function PortalWorkPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WorkItem | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [tagsInput, setTagsInput] = useState("");
  const [techInput, setTechInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<WorkItemType | "all">("all");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setItems(await getWorkItems(user.uid));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = (type?: WorkItemType) => {
    setEditing(null);
    setForm({ ...EMPTY, type: type ?? (activeFilter !== "all" ? activeFilter : "project") });
    setTagsInput("");
    setTechInput("");
    setError("");
    setShowForm(true);
  };

  const openEdit = (item: WorkItem) => {
    setEditing(item);
    const { id: _id, userId: _uid, createdAt: _ca, ...rest } = item;
    setForm(rest);
    setTagsInput(item.tags?.join(", ") ?? "");
    setTechInput(item.techStack?.join(", ") ?? "");
    setError("");
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload: FormData = {
        ...form,
        tags: tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        techStack: techInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      if (editing) {
        await updateWorkItem(editing.id, payload);
      } else {
        await addWorkItem(user!.uid, payload);
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
    if (!confirm("Delete this item permanently?")) return;
    await deleteWorkItem(id);
    await load();
  };

  const filtered =
    activeFilter === "all"
      ? items
      : items.filter((i) => i.type === activeFilter);

  const counts = items.reduce(
    (acc, i) => {
      acc[i.type] = (acc[i.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const inputCls =
    "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-emerald-400/50 transition-colors text-sm";

  return (
    <PortalShell
      title="Work"
      action={
        <button
          onClick={() => openAdd()}
          className="px-4 py-2 bg-emerald-400 text-black text-sm font-semibold rounded-lg hover:bg-emerald-300 transition-colors"
        >
          + Add Item
        </button>
      }
    >
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-3 py-1.5 text-xs font-mono rounded-full transition-colors ${
            activeFilter === "all"
              ? "bg-white/10 text-white"
              : "text-white/30 hover:text-white/60"
          }`}
        >
          All ({items.length})
        </button>
        {WORK_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveFilter(t.value)}
            className={`px-3 py-1.5 text-xs font-mono rounded-full transition-colors ${
              activeFilter === t.value
                ? "bg-white/10 text-white"
                : "text-white/30 hover:text-white/60"
            }`}
          >
            {t.label} ({counts[t.value] || 0})
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold">
              {editing ? "Edit Work Item" : "New Work Item"}
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
            {/* Name */}
            <div>
              <label className="block text-xs text-white/30 mb-1.5">
                Name *
              </label>
              <input
                required
                placeholder="Item name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className={inputCls}
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs text-white/30 mb-1.5">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    type: e.target.value as WorkItemType,
                  }))
                }
                className={inputCls}
              >
                {WORK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="lg:col-span-2">
              <label className="block text-xs text-white/30 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Brief description…"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className={inputCls + " resize-none"}
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-xs text-white/30 mb-1.5">
                Website
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={form.website}
                onChange={(e) =>
                  setForm((f) => ({ ...f, website: e.target.value }))
                }
                className={inputCls}
              />
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-xs text-white/30 mb-1.5">
                Logo URL
              </label>
              <input
                placeholder="https://..."
                value={form.logoURL}
                onChange={(e) =>
                  setForm((f) => ({ ...f, logoURL: e.target.value }))
                }
                className={inputCls}
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs text-white/30 mb-1.5">
                Role
              </label>
              <input
                placeholder="Founder, Lead Engineer, etc."
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value }))
                }
                className={inputCls}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs text-white/30 mb-1.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as WorkItemStatus,
                  }))
                }
                className={inputCls}
              >
                {WORK_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs text-white/30 mb-1.5">
                Category
              </label>
              <input
                placeholder="SaaS, Fintech, Infrastructure…"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                className={inputCls}
              />
            </div>

            {/* Metrics */}
            <div>
              <label className="block text-xs text-white/30 mb-1.5">
                Metrics
              </label>
              <input
                placeholder="e.g. 10k users, $50k ARR"
                value={form.metrics}
                onChange={(e) =>
                  setForm((f) => ({ ...f, metrics: e.target.value }))
                }
                className={inputCls}
              />
            </div>

            {/* Tech Stack */}
            <div>
              <label className="block text-xs text-white/30 mb-1.5">
                Tech Stack (comma-separated)
              </label>
              <input
                placeholder="React, Node.js, Firebase…"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                className={inputCls}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs text-white/30 mb-1.5">
                Tags (comma-separated)
              </label>
              <input
                placeholder="SaaS, B2B, ..."
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className={inputCls}
              />
            </div>

            {/* Order */}
            <div>
              <label className="block text-xs text-white/30 mb-1.5">
                Order
              </label>
              <input
                type="number"
                min={0}
                value={form.order}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    order: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className={inputCls}
              />
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="work-featured"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, featured: e.target.checked }))
                  }
                  className="accent-emerald-400"
                />
                <label
                  htmlFor="work-featured"
                  className="text-sm text-white/60 cursor-pointer"
                >
                  Featured
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="work-owned"
                  checked={form.owned}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, owned: e.target.checked }))
                  }
                  className="accent-emerald-400"
                />
                <label
                  htmlFor="work-owned"
                  className="text-sm text-white/60 cursor-pointer"
                >
                  Owned
                </label>
              </div>
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
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/20">
          {activeFilter === "all"
            ? "No work items yet. Add one above."
            : `No ${activeFilter} items yet.`}
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-widest">
                  Name
                </th>
                <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-widest hidden md:table-cell">
                  Type
                </th>
                <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-widest hidden lg:table-cell">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-widest hidden lg:table-cell">
                  Tech
                </th>
                <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-widest hidden xl:table-cell">
                  Featured
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <p className="text-white font-medium">{item.name}</p>
                    {item.role && (
                      <p className="text-xs text-white/30 mt-0.5">
                        {item.role}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        TYPE_COLORS[item.type] || "bg-white/5 text-white/30"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        STATUS_COLORS[item.status] || "bg-white/5 text-white/30"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {item.techStack?.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded"
                        >
                          {t}
                        </span>
                      ))}
                      {(item.techStack?.length ?? 0) > 3 && (
                        <span className="text-[10px] text-white/20">
                          +{item.techStack!.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-white/40 hidden xl:table-cell">
                    {item.featured ? "✓" : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3 justify-end">
                      <button
                        onClick={() => openEdit(item)}
                        className="text-xs text-white/30 hover:text-white transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
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
