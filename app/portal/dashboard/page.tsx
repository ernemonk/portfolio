"use client";
import { useEffect, useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { getMessages } from "@/lib/firestore/messages";
import { getVentures } from "@/lib/firestore/ventures";
import { getProjects } from "@/lib/firestore/projects";
import { getExperiments } from "@/lib/firestore/experiments";
import { useAuth } from "@/context/AuthContext";
import type { Message, Venture, Project, Experiment } from "@/types";
import Link from "next/link";

interface Stats {
  totalMessages: number;
  unreadMessages: number;
  totalVentures: number;
  totalProjects: number;
  totalExperiments: number;
}

function StatCard({ label, value, sub, href, color = "emerald" }: {
  label: string;
  value: number;
  sub?: string;
  href: string;
  color?: string;
}) {
  return (
    <Link href={href} className="block group">
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/10 transition-all">
        <p className="text-xs text-white/30 font-mono uppercase tracking-widest">{label}</p>
        <p className="text-4xl font-bold text-white mt-2">{value}</p>
        {sub && (
          <p className={`text-sm mt-1 ${color === "emerald" ? "text-emerald-400" : "text-red-400"}`}>
            {sub}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const uid = user!.uid;
        const [messages, ventures, projects, experiments] = await Promise.all([
          getMessages(uid),
          getVentures(uid),
          getProjects(uid),
          getExperiments(uid),
        ]);
        const unread = messages.filter((m) => !m.read).length;
        setStats({
          totalMessages: messages.length,
          unreadMessages: unread,
          totalVentures: (ventures as Venture[]).length,
          totalProjects: (projects as Project[]).length,
          totalExperiments: (experiments as Experiment[]).length,
        });
        setRecent(messages.slice(0, 5));
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError(true);
        setErrorMessage(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const unread = stats?.unreadMessages ?? 0;

  return (
    <PortalShell title="Dashboard" unreadCount={unread}>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin border-2 border-sky-400 border-t-transparent rounded-full" />
        </div>
      ) : error || !stats ? (
        <div className="flex flex-col items-center justify-center h-64 text-white/30 text-sm gap-2">
          <div>Failed to load dashboard data. Check your Firebase connection.</div>
          {errorMessage && (
            <div className="text-xs text-white/20">{errorMessage}</div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Messages"
              value={stats.totalMessages}
              sub={unread > 0 ? `${unread} unread` : "All read"}
              href="/portal/messages"
              color={unread > 0 ? "red" : "sky"}
            />
            <StatCard
              label="Ventures"
              value={stats.totalVentures}
              href="/portal/ventures"
            />
            <StatCard
              label="Projects"
              value={stats.totalProjects}
              href="/portal/projects"
            />
            <StatCard
              label="Experiments"
              value={stats.totalExperiments}
              href="/portal/experiments"
            />
          </div>

          {/* Recent messages */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Recent Messages</h2>
              <Link href="/portal/messages" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                View all →
              </Link>
            </div>
            {recent.length === 0 ? (
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 text-center text-white/20">
                No messages yet
              </div>
            ) : (
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                {recent.map((msg) => (
                  <Link
                    key={msg.id}
                    href="/portal/messages"
                    className="flex items-start gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors"
                  >
                    <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!msg.read ? "bg-emerald-400" : "bg-white/10"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${!msg.read ? "text-white" : "text-white/50"}`}>
                          {msg.name}
                        </p>
                        <p className="text-xs text-white/20">
                          {msg.createdAt?.seconds
                            ? new Date(msg.createdAt.seconds * 1000).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>
                      <p className="text-xs text-white/30 truncate mt-0.5">{msg.message}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { href: "/portal/ventures", label: "+ Add Venture" },
                { href: "/portal/projects", label: "+ Add Project" },
                { href: "/portal/experiments", label: "+ Add Experiment" },
                { href: "/portal/bio", label: "Edit Bio" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm text-white/50 hover:text-emerald-400 hover:border-emerald-400/20 hover:bg-emerald-400/5 transition-all text-center"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
