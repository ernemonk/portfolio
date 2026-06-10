"use client";
import { useState, useMemo } from "react";
import WorkCard from "@/components/WorkCard";
import type { WorkItem, WorkItemType } from "@/types";

const TYPE_FILTERS: { value: WorkItemType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "venture", label: "Ventures" },
  { value: "project", label: "Projects" },
  { value: "client", label: "Consulting" },
  { value: "experiment", label: "Lab" },
];

export function WorkGrid({ items }: { items: WorkItem[] }) {
  const [typeFilter, setTypeFilter] = useState<WorkItemType | "all">("all");

  const filtered = useMemo(() => {
    let result = items;
    if (typeFilter !== "all") {
      result = result.filter((i) => i.type === typeFilter);
    }
    return result;
  }, [items, typeFilter]);

  /* Derive which tabs have data */
  const typesWithData = useMemo(() => {
    const set = new Set(items.map((i) => i.type));
    return TYPE_FILTERS.filter(
      (f) => f.value === "all" || set.has(f.value as WorkItemType)
    );
  }, [items]);

  return (
    <>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-14 flex-wrap">
        {typesWithData.map((f) => (
          <button
            key={f.value}
            onClick={() => setTypeFilter(f.value)}
            className={`px-5 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 ${
              typeFilter === f.value
                ? "bg-primary-500/10 text-primary-400 border border-primary-500/20 tab-active"
                : "text-neutral-100 border border-neutral-800 hover:border-neutral-600 hover:text-neutral-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-neutral-600 text-center py-24 font-mono text-sm">
          No items found.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
          {filtered.map((item) => (
            <WorkCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  );
}
