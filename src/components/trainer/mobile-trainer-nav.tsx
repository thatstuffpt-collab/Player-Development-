"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const items = [
  { href: "/trainer/today", label: "Today" },
  { href: "/trainer/players", label: "Players" },
  { href: "/trainer/evaluate", label: "Evaluate" },
  { href: "/trainer/drills", label: "Drills" },
  { href: "/trainer/practice-plans", label: "Practice Plans" },
];

export function MobileTrainerNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="mobile-trainer-menu">
      {open ? (
        <nav className="mobile-trainer-menu-panel" aria-label="Mobile trainer navigation">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname.startsWith(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
      <button
        type="button"
        className="mobile-trainer-menu-toggle"
        aria-label={open ? "Close trainer menu" : "Open trainer menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">{open ? "×" : "☰"}</span>
      </button>
    </div>
  );
}
