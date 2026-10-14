"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Where to go after signing in: the editor the user was bounced from (same-origin only), else home
function returnPath() {
  const callback = new URLSearchParams(window.location.search).get("callbackUrl");
  if (!callback) return "/";
  try {
    const url = new URL(callback, window.location.origin);
    return url.origin === window.location.origin ? url.pathname + url.search : "/";
  } catch {
    return "/";
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setSubmitting(false);
    if (res?.ok) {
      toast.success("Welcome back, Rohit!");
      router.push(returnPath());
      router.refresh();
    } else {
      toast.error("Invalid email or password.");
    }
  }

  const field =
    "w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-star placeholder:text-dim outline-none transition focus:border-mint/60 focus:bg-white/[0.09] focus:ring-2 focus:ring-mint/20";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_50%_30%,rgba(60,70,180,0.25),transparent_60%)] px-4">
      <form onSubmit={handleSubmit} className="glass flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-deep/70 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
        <p className="hud text-center text-mint">Mission control</p>
        <h1 className="mb-2 text-center font-display text-2xl font-semibold text-star">Admin Login</h1>
        <label className="sr-only" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Email"
          autoComplete="username"
          className={field}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="sr-only" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          className={field}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={submitting} className="btn-primary mt-2 justify-center disabled:opacity-60">
          {submitting ? "Signing in…" : "Login"}
        </button>
      </form>
    </div>
  );
}
