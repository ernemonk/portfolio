"use client";
import { useEffect, useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { getBio, updateBio } from "@/lib/firestore/bio";
import { useAuth } from "@/context/AuthContext";
import type { Bio } from "@/types";

const EMPTY: Omit<Bio, "id"> = {
  name: "",
  headline: "",
  shortIntro: "",
  longBio: "",
  photos: [],
};

export default function BioPage() {
  const { user } = useAuth();
  const [form, setForm] = useState<Omit<Bio, "id">>(EMPTY);
  const [photosInput, setPhotosInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    getBio(user.uid).then((bio) => {
      if (bio) {
        const { id: _id, ...rest } = bio;
        setForm(rest);
        setPhotosInput(bio.photos?.join("\n") ?? "");
      }
      setLoading(false);
    });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    setSaved(false);
    try {
      const payload = {
        ...form,
        photos: photosInput.split("\n").map((p) => p.trim()).filter(Boolean),
      };
      await updateBio(user!.uid, payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-emerald-400/50 transition-colors text-sm";

  return (
    <PortalShell title="Bio">
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin border-2 border-emerald-400 border-t-transparent rounded-full" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="max-w-2xl space-y-6">
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-xs text-white/30 mb-1.5 uppercase tracking-widest font-mono">
                Full Name
              </label>
              <input
                required
                placeholder="Ernesto Monge"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs text-white/30 mb-1.5 uppercase tracking-widest font-mono">
                Headline
              </label>
              <input
                placeholder="Builder, founder, and creative technologist"
                value={form.headline}
                onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs text-white/30 mb-1.5 uppercase tracking-widest font-mono">
                Short Intro
              </label>
              <textarea
                rows={3}
                placeholder="A brief 1-2 sentence intro shown on the homepage…"
                value={form.shortIntro}
                onChange={(e) => setForm((f) => ({ ...f, shortIntro: e.target.value }))}
                className={inputCls + " resize-none"}
              />
              <p className="text-xs text-white/20 mt-1.5">Shown on the homepage hero section.</p>
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-xs text-white/30 mb-1.5 uppercase tracking-widest font-mono">
                Long Bio
              </label>
              <textarea
                rows={10}
                placeholder="Your full story — background, experience, values, what drives you…"
                value={form.longBio}
                onChange={(e) => setForm((f) => ({ ...f, longBio: e.target.value }))}
                className={inputCls + " resize-none"}
              />
              <p className="text-xs text-white/20 mt-1.5">Shown on the About page.</p>
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-xs text-white/30 mb-1.5 uppercase tracking-widest font-mono">
                Photo URLs
              </label>
              <textarea
                rows={4}
                placeholder={"https://storage.googleapis.com/...\nhttps://..."}
                value={photosInput}
                onChange={(e) => setPhotosInput(e.target.value)}
                className={inputCls + " resize-none font-mono text-xs"}
              />
              <p className="text-xs text-white/20 mt-1.5">One URL per line. Upload to Firebase Storage and paste the public URL here.</p>
            </div>

            {/* Photo previews */}
            {photosInput.trim() && (
              <div className="flex flex-wrap gap-3">
                {photosInput
                  .split("\n")
                  .map((u) => u.trim())
                  .filter(Boolean)
                  .map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={url}
                      alt={`Photo ${i + 1}`}
                      className="h-20 w-20 rounded-xl object-cover bg-white/5"
                      onError={(e) => (e.currentTarget.style.opacity = "0.2")}
                    />
                  ))}
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/5 border border-red-400/20 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-400 text-black font-semibold rounded-lg hover:bg-emerald-300 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Save Bio"}
            </button>
            {saved && (
              <p className="text-emerald-400 text-sm">Saved successfully ✓</p>
            )}
          </div>
        </form>
      )}
    </PortalShell>
  );
}
