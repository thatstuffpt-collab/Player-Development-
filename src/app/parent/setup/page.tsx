"use client";

import { createUserWithEmailAndPassword, deleteUser, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ensureBrowserAuthPersistence, firebaseAuth } from "@/lib/firebase/client";

export default function ParentSetupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");

    try {
      await ensureBrowserAuthPersistence();
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const token = await credential.user.getIdToken();
      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok) {
        await deleteUser(credential.user);
        setError("This email has not been connected to an athlete yet. Ask your trainer to add your parent/guardian email first.");
        return;
      }

      if (payload.user?.role !== "GUARDIAN") {
        await signOut(firebaseAuth);
        setError("This account is not a parent/guardian account.");
        return;
      }

      router.replace("/parent");
    } catch (err) {
      const code = typeof err === "object" && err && "code" in err ? String((err as { code?: unknown }).code ?? "") : "";
      if (code.includes("email-already-in-use")) {
        setError("An account already exists for this email. Use the normal Sign in page instead.");
      } else if (code.includes("weak-password")) {
        setError("Use a stronger password with at least 6 characters.");
      } else {
        setError("We could not create the account. Check the email and password and try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">PARENT / GUARDIAN SETUP</p>
        <h1>Create your account</h1>
        <p className="support-copy">Use the same email your trainer connected to your athlete.</p>
        <form className="auth-form" onSubmit={submit}>
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" autoComplete="new-password" minLength={6} required /></label>
          {error && <p className="auth-error">{error}</p>}
          <button className="primary-button" disabled={busy}>{busy ? "Creating account…" : "Create parent account"}</button>
        </form>
        <div className="auth-preview-link"><span>Already created your account?</span><a href="/login">Sign in</a></div>
      </section>
    </main>
  );
}
