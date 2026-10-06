import Link from "next/link";
import { ReactNode } from "react";
import { ParentAuthGate } from "@/components/auth/parent-auth-gate";
import "./parent.css";

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <ParentAuthGate>
      <nav className="parent-nav" aria-label="Parent navigation">
        <Link href="/parent" className="parent-brand">PLAYER DEVELOPMENT</Link>
        <Link href="/parent">My Athletes</Link>
      </nav>
      {children}
    </ParentAuthGate>
  );
}
