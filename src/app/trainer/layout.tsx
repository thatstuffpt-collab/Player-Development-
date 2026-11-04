import Link from "next/link";
import { ReactNode } from "react";
import { AccountSignOutButton } from "@/components/auth/account-sign-out-button";
import { TrainerAuthGate } from "@/components/auth/trainer-auth-gate";
import { TrainerMobileMenu } from "@/components/trainer/trainer-mobile-menu";
import "./players.css";

export default function TrainerLayout({ children }: { children: ReactNode }) {
  return (
    <TrainerAuthGate>
      <nav className="trainer-nav" aria-label="Trainer navigation">
        <Link className="trainer-brand" href="/trainer/today">PLAYER DEVELOPMENT</Link>
        <div className="trainer-nav-links">
          <Link href="/trainer/today">Today</Link>
          <Link href="/trainer/players">Athletes</Link>
          <Link href="/trainer/groups-camps">Group/Camps</Link>
          <Link href="/trainer/drills">Library</Link>
          <Link href="/trainer/organization">Organization</Link>
          <AccountSignOutButton className="trainer-signout-button" />
        </div>
      </nav>
      {children}
      <TrainerMobileMenu />
    </TrainerAuthGate>
  );
}
