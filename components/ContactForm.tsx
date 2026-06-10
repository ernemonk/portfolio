"use client";
import { useState } from "react";
import { addMessage } from "@/lib/firestore/messages";
import { OWNER_UID } from "@/lib/owner";
import { Input, Textarea } from "@/components/Input";
import { Button } from "@/components/Button";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await addMessage(OWNER_UID, form);
      setForm({ name: "", email: "", message: "" });
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (sent) {
    return (
      <div className="p-10 border border-primary-500/30 bg-primary-500/5 rounded-lg text-center">
        <p className="text-primary-400 text-lg font-semibold">Message sent!</p>
        <p className="text-neutral-400 text-sm mt-2">I'll be in touch shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Input
        label="Name"
        type="text"
        required
        placeholder="Your name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        disabled={saving}
      />

      <Input
        label="Email"
        type="email"
        required
        placeholder="your@email.com"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        disabled={saving}
      />

      <Textarea
        label="Message"
        required
        rows={6}
        placeholder="Tell me about your project or idea…"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        disabled={saving}
      />

      {error && (
        <div className="p-4 bg-error-500/10 border border-error-500/30 rounded-lg">
          <p className="text-error-400 text-sm">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={saving}
      >
        {saving ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
