"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

type ParentPlayer = {
  id: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  classYear: number | null;
  position: string | null;
  schoolTeam: string | null;
  goals: Array<{ id: string; title: string; status: string }>;
  developmentFocuses: Array<{ id: string; focus: string; completedAt: string | null }>;
  evaluations: Array<{ id: string; evaluatedAt: string }>;
  achievements: Array<{ id: string; title: string; achievedAt: string }>;
  assignedWork: Array<{ id: string; title: string; status: string; dueAt: string | null }>;
};

export default function ParentDashboardPage() {
  const [players, setPlayers] = useState<ParentPlayer[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void authenticatedFetch("/api/parent/players")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Could not load athletes.");
        setPlayers(payload.players ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load athletes."));
  }, []);

  return (
    <main className="parent-shell">
      <header className="parent-header">
        <p className="parent-eyebrow">PARENT / GUARDIAN</p>
        <h1>Your athlete development</h1>
        <p>See the progress your trainer has chosen to share: current focus, goals, evaluations, achievements, assigned work, and approved training results.</p>
      </header>

      {error && <p className="parent-error">{error}</p>}

      <section className="parent-grid">
        {players.map((player) => {
          const currentFocus = player.developmentFocuses.find((focus) => !focus.completedAt);
          const activeGoals = player.goals.filter((goal) => goal.status === "ACTIVE");
          const openWork = player.assignedWork.filter((work) => work.status !== "COMPLETED");
          return (
            <article className="parent-card" key={player.id}>
              <span className="parent-chip">{player.classYear ? `Class of ${player.classYear}` : "Athlete"}</span>
              <h2>{player.preferredName || player.firstName} {player.lastName}</h2>
              <p>{[player.position, player.schoolTeam].filter(Boolean).join(" · ") || "Player development profile"}</p>
              <div className="parent-summary-row"><span>Current focus</span><strong>{currentFocus?.focus || "No current focus posted"}</strong></div>
              <div className="parent-summary-row"><span>Active goals</span><strong>{activeGoals.length}</strong></div>
              <div className="parent-summary-row"><span>Assigned work</span><strong>{openWork.length}</strong></div>
              <Link className="parent-primary parent-link" href={`/parent/players/${player.id}`}>View development</Link>
            </article>
          );
        })}
        {!players.length && !error && (
          <section className="parent-card">
            <h2>No athletes connected yet</h2>
            <p>Your trainer needs to connect your parent/guardian account to an athlete before development information appears here.</p>
          </section>
        )}
      </section>
    </main>
  );
}
