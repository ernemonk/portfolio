"use client";
import { useEffect, useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import {
  subscribeToMessages,
  markMessageRead,
  saveReply,
  deleteMessage,
} from "@/lib/firestore/messages";
import type { Message } from "@/types";

function formatDate(msg: Message) {
  if (!msg.createdAt?.seconds) return "—";
  return new Date(msg.createdAt.seconds * 1000).toLocaleString();
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsub = subscribeToMessages((msgs) => {
      setMessages(msgs);
      setUnreadCount(msgs.filter((m) => !m.read).length);
    });
    return unsub;
  }, []);

  const handleSelect = async (msg: Message) => {
    setSelected(msg);
    setReply(msg.reply ?? "");
    setSaved(false);
    if (!msg.read) {
      await markMessageRead(msg.id);
    }
  };

  const handleSaveReply = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await saveReply(selected.id, reply);
      setSaved(true);
      setSelected((prev) => (prev ? { ...prev, reply } : prev));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected || !confirm("Delete this message permanently?")) return;
    setDeleting(true);
    try {
      await deleteMessage(selected.id);
      setSelected(null);
      setReply("");
    } finally {
      setDeleting(false);
    }
  };

  const mailtoHref = selected
    ? `mailto:${selected.email}?subject=Re: Your message&body=${encodeURIComponent(reply)}`
    : "#";

  return (
    <PortalShell title="Messages" unreadCount={unreadCount}>
      <div className="flex gap-6 h-[calc(100vh-8rem)]">
        {/* Message list */}
        <div className="w-72 flex-shrink-0 bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between flex-shrink-0">
            <p className="text-sm font-medium text-white/60">Inbox</p>
            {unreadCount > 0 && (
              <span className="bg-emerald-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-white/20 text-sm">
                No messages
              </div>
            ) : (
              messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => handleSelect(msg)}
                  className={`w-full text-left px-4 py-3.5 transition-colors ${
                    selected?.id === msg.id
                      ? "bg-emerald-400/10"
                      : "hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                        !msg.read ? "bg-emerald-400" : "bg-transparent"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm truncate ${
                          !msg.read ? "text-white font-medium" : "text-white/50"
                        }`}
                      >
                        {msg.name}
                      </p>
                      <p className="text-xs text-white/30 truncate mt-0.5">
                        {msg.message}
                      </p>
                      <p className="text-[10px] text-white/20 mt-1">
                        {msg.createdAt?.seconds
                          ? new Date(msg.createdAt.seconds * 1000).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message detail */}
        <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden flex flex-col min-w-0">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-white/20">
              <div className="text-center">
                <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <p className="text-sm">Select a message to read</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/5 flex items-start justify-between flex-shrink-0">
                <div>
                  <p className="text-white font-semibold">{selected.name}</p>
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    {selected.email}
                  </a>
                  <p className="text-xs text-white/20 mt-1">{formatDate(selected)}</p>
                </div>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-white/20 hover:text-red-400 transition-colors p-1"
                  title="Delete message"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {/* Message */}
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-widest font-mono mb-3">Message</p>
                  <div className="bg-white/[0.03] rounded-xl p-4">
                    <p className="text-white/70 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                  </div>
                </div>

                {/* Reply section */}
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-widest font-mono mb-3">Your Reply</p>
                  <textarea
                    rows={5}
                    value={reply}
                    onChange={(e) => { setReply(e.target.value); setSaved(false); }}
                    placeholder="Write your reply here…"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-emerald-400/50 transition-colors resize-none text-sm"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 border-t border-white/5 flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={handleSaveReply}
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-400 text-black text-sm font-semibold rounded-lg hover:bg-emerald-300 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Saving…" : saved ? "Saved ✓" : "Save Reply"}
                </button>
                <a
                  href={mailtoHref}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 text-sm rounded-lg hover:text-white hover:bg-white/10 transition-colors"
                >
                  Open in Mail
                </a>
                {selected.repliedAt && (
                  <p className="ml-auto text-xs text-white/20">
                    Replied {new Date(selected.repliedAt.seconds * 1000).toLocaleDateString()}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </PortalShell>
  );
}
