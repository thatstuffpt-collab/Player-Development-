import Link from "next/link";
import { ReactNode } from "react";
import { TrainerAuthGate } from "@/components/auth/trainer-auth-gate";
import "./players.css";

export default function TrainerLayout({ children }: { children: ReactNode }) {
  return (
    <TrainerAuthGate>
      <nav className="trainer-nav" aria-label="Trainer navigation">
        <Link className="trainer-brand" href="/trainer/players">THAT&apos;S TUFF</Link>
        <div className="trainer-nav-links">
          <Link href="/trainer/players">Players</Link>
          <Link href="/trainer/players#start-session">Sessions</Link>
          <Link href="/trainer/players#start-session">Evaluate</Link>
        </div>
      </nav>
      {children}
      <nav className="trainer-mobile-nav" aria-label="Mobile trainer navigation">
        <Link href="/trainer/players"><span aria-hidden="true">◉</span><strong>Players</strong></Link>
        <Link href="/trainer/players#start-session"><span aria-hidden="true">▣</span><strong>Sessions</strong></Link>
        <Link href="/trainer/players#start-session"><span aria-hidden="true">✓</span><strong>Evaluate</strong></Link>
      </nav>
    </TrainerAuthGate>
  );
}
