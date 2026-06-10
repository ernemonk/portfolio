"use client";
/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState, useCallback } from "react";
import PortalShell from "@/components/portal/PortalShell";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface TaskStats {
  total: number;
  done: number;
  pending: number;
  percent: number;
}

interface ModuleStatus {
  name: string;
  port: string;
  percent: number;
  status: "healthy" | "degraded" | "unhealthy";
}

interface MilestoneStats {
  name: string;
  done: number;
  total: number;
  percent: number;
}

function parseTaskStats(md: string): TaskStats {
  const checked = (md.match(/- \[x\]/gi) || []).length;
  const unchecked = (md.match(/- \[ \]/g) || []).length;
  const total = checked + unchecked;
  return {
    total,
    done: checked,
    pending: unchecked,
    percent: total > 0 ? Math.round((checked / total) * 100) : 0,
  };
}

function parseModuleProgress(md: string): ModuleStatus[] {
  const modules: ModuleStatus[] = [];
  const lines = md.split("\n");
  for (const line of lines) {
    const match = line.match(
      /\|\s*[^\|]*?(Orchestrator|Strategy|Risk|Execution|Portfolio|Analytics|Config|Local AI|Data Ingestion|Frontend|PostgreSQL|Redis)[^\|]*\|\s*(\d{4}|—)\s*\|[^\|]*\|\s*(\d+)%/i
    );
    if (match) {
      const pct = parseInt(match[3]);
      modules.push({
        name: match[1].trim(),
        port: match[2],
        percent: pct,
        status: pct >= 70 ? "healthy" : pct >= 50 ? "degraded" : "unhealthy",
      });
    }
  }
  return modules;
}

function parseMilestones(md: string): MilestoneStats[] {
  const milestones: MilestoneStats[] = [];
  const sections = md.split(/## 🎯 MILESTONE/);
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    const titleMatch = section.match(/^\s*\d+:\s*(.+)/m);
    const checked = (section.match(/- \[x\]/gi) || []).length;
    const unchecked = (section.match(/- \[ \]/g) || []).length;
    const total = checked + unchecked;
    if (titleMatch) {
      milestones.push({
        name: titleMatch[1].trim(),
        done: checked,
        total,
        percent: total > 0 ? Math.round((checked / total) * 100) : 0,
      });
    }
  }
  return milestones;
}

function ProgressBar({
  percent,
  size = "md",
}: {
  percent: number;
  size?: "sm" | "md" | "lg";
}) {
  const heights = { sm: "h-2", md: "h-3", lg: "h-5" };
  const bg =
    percent >= 75
      ? "bg-emerald-500"
      : percent >= 50
      ? "bg-yellow-500"
      : percent >= 25
      ? "bg-orange-500"
      : "bg-red-500";
  return (
    <div
      className={`w-full bg-white/5 rounded-full ${heights[size]} overflow-hidden`}
    >
      <div
        className={`${bg} ${heights[size]} rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    healthy: "bg-emerald-400",
    degraded: "bg-yellow-400",
    unhealthy: "bg-red-400",
  };
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${
        colors[status] || "bg-zinc-500"
      }`}
    />
  );
}

export default function TasksPage() {
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    done: 0,
    pending: 0,
    percent: 0,
  });
  const [modules, setModules] = useState<ModuleStatus[]>([]);
  const [milestones, setMilestones] = useState<MilestoneStats[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "full">("overview");

  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch("/docs/TASKS.md");
      if (!res.ok) throw new Error(`Failed to load TASKS.md: ${res.status}`);
      const text = await res.text();
      setMarkdown(text);
      setStats(parseTaskStats(text));
      setModules(parseModuleProgress(text));
      setMilestones(parseMilestones(text));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  if (loading) {
    return (
      <PortalShell title="Tasks">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell
      title="Tasks"
      action={
        <button
          onClick={loadTasks}
          className="px-3 py-1.5 text-xs font-medium bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
            />
          </svg>
          Refresh
        </button>
      }
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Master Progress */}
        <div className="bg-[#0f1117] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                Trading OS Progress
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                {stats.done} of {stats.total} tasks completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-white">
                {stats.percent}%
              </div>
              <div className="text-xs text-zinc-500 mt-1">overall</div>
            </div>
          </div>
          <ProgressBar percent={stats.percent} size="lg" />
          <div className="flex gap-6 mt-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />{" "}
              {stats.done} Done
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-600" />{" "}
              {stats.pending} Pending
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-[#0f1117] border border-white/10 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === "overview"
                ? "bg-white/10 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("full")}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === "full"
                ? "bg-white/10 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Full Document
          </button>
        </div>

        {activeTab === "overview" ? (
          <>
            {/* Milestone Cards */}
            {milestones.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
                  Milestones
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {milestones.map((m, i) => (
                    <div
                      key={i}
                      className="bg-[#0f1117] border border-white/10 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate">
                            Milestone {i + 1}
                          </h4>
                          <p className="text-xs text-zinc-400 mt-0.5 truncate">
                            {m.name}
                          </p>
                        </div>
                        <span
                          className={`text-lg font-bold ml-3 ${
                            m.percent >= 75
                              ? "text-emerald-400"
                              : m.percent >= 50
                              ? "text-yellow-400"
                              : m.percent > 0
                              ? "text-orange-400"
                              : "text-zinc-500"
                          }`}
                        >
                          {m.percent}%
                        </span>
                      </div>
                      <ProgressBar percent={m.percent} size="sm" />
                      <p className="text-xs text-zinc-500 mt-2">
                        {m.done}/{m.total} tasks
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Module Status Grid */}
            {modules.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
                  Module Health
                </h3>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {modules.map((m, i) => (
                    <div
                      key={i}
                      className="bg-[#0f1117] border border-white/10 rounded-lg p-3 flex items-center gap-3"
                    >
                      <StatusDot status={m.status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white truncate">
                            {m.name}
                          </span>
                          <span className="text-xs text-zinc-400 ml-2">
                            :{m.port}
                          </span>
                        </div>
                        <div className="mt-1.5">
                          <ProgressBar percent={m.percent} size="sm" />
                        </div>
                      </div>
                      <span className="text-xs font-mono text-zinc-400 w-8 text-right">
                        {m.percent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Full Markdown Render */
          <div className="bg-[#0f1117] border border-white/10 rounded-xl p-6 md:p-8">
            <article
              className="prose prose-invert prose-sm max-w-none
              prose-headings:text-white prose-headings:font-semibold
              prose-h1:text-2xl prose-h1:border-b prose-h1:border-white/10 prose-h1:pb-3
              prose-h2:text-xl prose-h2:mt-8
              prose-h3:text-lg prose-h3:text-zinc-200
              prose-p:text-zinc-300 prose-p:leading-relaxed
              prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white
              prose-code:text-emerald-300 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
              prose-pre:bg-[#1a1b26] prose-pre:border prose-pre:border-white/5
              prose-table:text-sm
              prose-th:text-zinc-300 prose-th:font-medium prose-th:border-white/10
              prose-td:border-white/10 prose-td:text-zinc-400
              prose-li:text-zinc-300 prose-li:marker:text-zinc-500
              prose-hr:border-white/10
              prose-blockquote:border-emerald-500/30 prose-blockquote:text-zinc-400"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  input: ({ type, checked, ...props }) => {
                    if (type === "checkbox") {
                      return (
                        <span
                          className={`inline-flex items-center justify-center w-4 h-4 rounded border mr-2 flex-shrink-0 ${
                            checked
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-zinc-600 bg-transparent"
                          }`}
                        >
                          {checked && (
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </span>
                      );
                    }
                    return <input type={type} {...props} />;
                  },
                }}
              >
                {markdown}
              </ReactMarkdown>
            </article>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
