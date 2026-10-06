"use client";

import { onAuthStateChanged } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { firebaseAuth } from "@/lib/firebase/client";

type AuthState = "checking" | "authorized" | "denied";

export function ParentAuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<AuthState>("checking");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.replace(`/login?next=${encodeURIComponent(pathname || "/parent")}`);
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

        if (payload.user?.role !== "GUARDIAN") {
          setMessage("This account does not have parent/guardian access.");
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
  }, [pathname, router]);

  if (state === "checking") {
    return <main className="parent-shell"><section className="parent-card"><p className="parent-eyebrow">PLAYER DEVELOPMENT</p><h1>Checking access…</h1></section></main>;
  }

  if (state === "denied") {
    return <main className="parent-shell"><section className="parent-card"><p className="parent-eyebrow">ACCESS REQUIRED</p><h1>Parent access unavailable</h1><p>{message}</p><button className="parent-primary" type="button" onClick={() => router.push("/login")}>Sign in with another account</button></section></main>;
  }

  return <>{children}</>;
}
