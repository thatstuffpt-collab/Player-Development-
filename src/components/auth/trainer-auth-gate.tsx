"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { firebaseAuth } from "@/lib/firebase/client";

type AuthState = "checking" | "authorized" | "denied";

export function TrainerAuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>("checking");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.replace("/login?next=/trainer/session");
        return;
      }

      try {
        const token = await firebaseUser.getIdToken();
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          setMessage(payload.error ?? "This account is not authorized.");
          setState("denied");
          return;
        }

        if (!(["TRAINER", "ADMIN"] as string[]).includes(payload.user.role)) {
          setMessage("This account does not have trainer access.");
          setState("denied");
          return;
        }

        setState("authorized");
      } catch {
        setMessage("We could not verify this account. Please sign in again.");
        setState("denied");
      }
    });

    return unsubscribe;
  }, [router]);

  if (state === "checking") {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <p className="eyebrow">THAT&apos;S TUFF PLAYER DEVELOPMENT</p>
          <h1>Checking access…</h1>
        </section>
      </main>
    );
  }

  if (state === "denied") {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <p className="eyebrow">ACCESS REQUIRED</p>
          <h1>Trainer access unavailable</h1>
          <p>{message}</p>
          <button className="primary-button" type="button" onClick={() => router.push("/login")}>Sign in with another account</button>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
