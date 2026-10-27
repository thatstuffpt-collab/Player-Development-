"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const links = [
  { href: "/trainer/today", label: "Today" },
  { href: "/trainer/players", label: "Athletes" },
  { href: "/trainer/groups-camps", label: "Group/Camps" },
  { href: "/trainer/drills", label: "Library" },
  { href: "/trainer/organization", label: "Organization" },
];

export function TrainerMobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="trainer-mobile-menu" ref={menuRef}>
      {open && (
        <nav className="trainer-mobile-menu-panel" aria-label="Mobile trainer navigation">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== "/trainer/today" && pathname.startsWith(link.href + "/"));
            return (
              <Link key={link.href} href={link.href} className={active ? "active" : ""}>
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}

      <button
        type="button"
        className="trainer-mobile-menu-button"
        aria-label={open ? "Close trainer menu" : "Open trainer menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">☰</span>
        <strong>Menu</strong>
      </button>
    </div>
  );
}
