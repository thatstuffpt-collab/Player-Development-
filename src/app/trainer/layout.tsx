import Link from "next/link";
import { ReactNode } from "react";
import { TrainerAuthGate } from "@/components/auth/trainer-auth-gate";
import { MobileTrainerNav } from "@/components/trainer/mobile-trainer-nav";
import "./players.css";

export default function TrainerLayout({ children }: { children: ReactNode }) {
  return (
    <TrainerAuthGate>
      <nav className="trainer-nav" aria-label="Trainer navigation">
        <Link className="trainer-brand" href="/trainer/today">THAT&apos;S TUFF</Link>
        <div className="trainer-nav-links">
          <Link href="/trainer/today">Today</Link>
          <Link href="/trainer/players">Players</Link>
          <Link href="/trainer/evaluate">Evaluate</Link>
          <Link href="/trainer/drills">Drills</Link>
          <Link href="/trainer/practice-plans">Practice Plans</Link>
        </div>
      </nav>
      {children}
      <MobileTrainerNav />
    </TrainerAuthGate>
  );
}
