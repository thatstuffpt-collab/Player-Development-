"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { firebaseAuth } from "@/lib/firebase/client";

type AccountSignOutButtonProps = {
  className?: string;
  label?: string;
};

export function AccountSignOutButton({
  className = "",
  label = "Log out",
}: AccountSignOutButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleSignOut() {
    if (busy) return;
    setBusy(true);

    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("activeOrganizationId");
      }
      await signOut(firebaseAuth);
      router.replace("/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleSignOut}
      disabled={busy}
    >
      {busy ? "Logging out…" : label}
    </button>
  );
}
