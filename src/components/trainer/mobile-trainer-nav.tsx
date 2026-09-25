"use client";

import Link from "next/link";
import { useState } from "react";

export function MobileTrainerNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="trainer-mobile-menu">
      {open && (
        <nav className="trainer-mobile-menu-panel" aria-label="Mobile trainer navigation">
          <Link href="/trainer/today" onClick={() => setOpen(false)}>Today</Link>
          <Link href="/trainer/players" onClick={() => setOpen(false)}>Players</Link>
          <Link href="/trainer/evaluate" onClick={() => setOpen(false)}>Evaluate</Link>
          <Link href="/trainer/drills" onClick={() => setOpen(false)}>Drills</Link>
          <Link href="/trainer/practice-plans" onClick={() => setOpen(false)}>Practice Plans</Link>
        </nav>
      )}
      <button className="trainer-mobile-menu-button" type="button" aria-expanded={open} aria-label="Open trainer menu" onClick={() => setOpen(v => !v)}>
        <span aria-hidden="true">☰</span><strong>Menu</strong>
      </button>
    </div>
  );
}
