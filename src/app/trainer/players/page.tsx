"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

type PlayerListItem = {
  id: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  classYear: number | null;
  position: string | null;
  schoolTeam: string | null;
  developmentFocuses: { focus: string }[];
};

export default function PlayersPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<PlayerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPlayers() {
      try {
        const response = await authenticatedFetch("/api/trainer/players");
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Could not load players.");
        if (!cancelled) setPlayers(payload.players);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load players.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPlayers();
    return () => {
      cancelled = true;
    };
  }, []);

  async function createPlayer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError("");

    const data = new FormData(event.currentTarget);
    const body = Object.fromEntries(data.entries());

    try {
      const response = await authenticatedFetch("/api/trainer/players", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not create player.");

      router.push(`/trainer/players/${payload.player.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create player.");
      setCreating(false);
    }
  }

  return (
    <main className="players-shell">
      <header className="players-header">
        <div>
          <p className="eyebrow">TRAINER WORKSPACE</p>
          <h1>Players</h1>
          <p className="support-copy">Your live client list. Open a player to plan, evaluate, and track development.</p>
        </div>
        <button className="primary-button compact-primary" type="button" onClick={() => setShowForm((value) => !value)}>
          {showForm ? "Close" : "+ New Player"}
        </button>
      </header>

      {showForm && (
        <section className="player-create-card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">NEW ATHLETE</span>
              <h2>Create player profile</h2>
            </div>
          </div>
          <form className="player-create-grid" onSubmit={createPlayer}>
            <label>First name<input name="firstName" required /></label>
            <label>Last name<input name="lastName" required /></label>
            <label>Preferred name<input name="preferredName" /></label>
            <label>Class year<input name="classYear" inputMode="numeric" placeholder="2031" /></label>
            <label>Position<input name="position" placeholder="PG / Wing / Post" /></label>
            <label>School / team<input name="schoolTeam" /></label>
            <button className="primary-button" type="submit" disabled={creating}>
              {creating ? "Creating…" : "Create Player"}
            </button>
          </form>
        </section>
      )}

      {error && <p className="auth-error">{error}</p>}

      <section className="player-list-section" id="start-session">
        <div className="section-heading">
          <div>
            <span className="section-kicker">ACTIVE CLIENTS</span>
            <h2>{loading ? "Loading…" : `${players.length} players`}</h2>
          </div>
        </div>

        {!loading && players.length === 0 ? (
          <div className="empty-state">
            <strong>No players yet.</strong>
            <p>Create your first real athlete profile to start the development record.</p>
          </div>
        ) : (
          <div className="player-list-grid">
            {players.map((player) => (
              <article className="player-list-card" key={player.id}>
                <Link className="player-card-profile-link" href={`/trainer/players/${player.id}`}>
                  <strong>{player.preferredName || player.firstName} {player.lastName}</strong>
                  <p>{[player.position, player.schoolTeam, player.classYear ? `Class of ${player.classYear}` : null].filter(Boolean).join(" · ") || "Profile started"}</p>
                </Link>
                <div className="player-focus-line">
                  <span>Current focus</span>
                  <strong>{player.developmentFocuses[0]?.focus ?? "Not set yet"}</strong>
                  <Link className="player-session-link" href={`/trainer/players/${player.id}/session`}>Start Session</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
