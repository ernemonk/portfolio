"use client";
import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function PortalSignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Already signed in → go straight to dashboard
  useEffect(() => {
    if (!authLoading && user) router.replace("/portal/dashboard");
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Firebase not configured");
      await createUserWithEmailAndPassword(auth, email, password);
      // AuthContext.onAuthStateChanged will call ensureUserDoc automatically
      router.replace("/portal/dashboard");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      if (code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else {
        setError("Sign up failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-sky-400/50 transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <p className="text-3xl font-bold text-white">
            EM<span className="text-sky-400">.</span>
          </p>
          <p className="text-xs text-white/30 mt-2 font-mono uppercase tracking-widest">
            Create Account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/30 mb-2 uppercase tracking-widest font-mono">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs text-white/30 mb-2 uppercase tracking-widest font-mono">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder="Min. 6 characters"
            />
          </div>

          <div>
            <label className="block text-xs text-white/30 mb-2 uppercase tracking-widest font-mono">
              Confirm Password
            </label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputCls}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-400/5 border border-red-400/20 rounded-lg py-2 px-4">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-500 text-white font-semibold rounded-xl hover:bg-sky-400 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-white/30 text-xs mt-6">
          Already have an account?{" "}
          <Link href="/portal/login" className="text-sky-400 hover:text-sky-300 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
