"use client";

import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { ensureBrowserAuthPersistence, firebaseAuth } from "@/lib/firebase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    try {
      await ensureBrowserAuthPersistence();
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const token = await credential.user.getIdToken();
      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok) {
        await signOut(firebaseAuth);
        setError(payload.error ?? "This account is not authorized for the app.");
        return;
      }

      const requested = searchParams.get("next");
      const fallback = payload.user.role === "GUARDIAN" ? "/parent" : "/trainer/session";
      router.replace(requested?.startsWith("/") ? requested : fallback);
    } catch {
      setError("Email or password was not accepted. Check your account and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">THAT&apos;S TUFF PLAYER DEVELOPMENT</p>
        <h1>Sign in</h1>
        <p className="support-copy">Trainer and parent accounts use the secure That&apos;s Tuff login.</p>

        <form className="auth-form" onSubmit={submit}>
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="auth-preview-link">
          <span>Just reviewing the build?</span>
          <a href="/preview">Open sample screens</a>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
