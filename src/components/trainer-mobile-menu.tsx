"use client";

import Link from "next/link";
import { useState } from "react";

export function TrainerMobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="trainer-mobile-menu">
      {open && (
        <nav className="trainer-mobile-menu-panel" aria-label="Mobile trainer navigation">
          <Link onClick={() => setOpen(false)} href="/trainer/today">Today</Link>
          <Link onClick={() => setOpen(false)} href="/trainer/players">Players</Link>
          <Link onClick={() => setOpen(false)} href="/trainer/evaluate">Evaluate</Link>
          <Link onClick={() => setOpen(false)} href="/trainer/drills">Drills</Link>
          <Link onClick={() => setOpen(false)} href="/trainer/practice-plans">Practice Plans</Link>
        </nav>
      )}
      <button type="button" className="trainer-mobile-menu-button" aria-expanded={open} aria-label="Open trainer menu" onClick={() => setOpen(v => !v)}>
        {open ? "×" : "☰"}
      </button>
    </div>
  );
}
