"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

type PlayerDetail = {
  id: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  birthDate: string | null;
  classYear: number | null;
  height: string | null;
  position: string | null;
  schoolTeam: string | null;
  yearsPlaying: number | null;
  playingExperience: string | null;
  selfReportedNeeds: string | null;
  trainingLimitations: string | null;
  goals: Array<{ id: string; title: string; type: string; status: string }>;
  developmentFocuses: Array<{ id: string; focus: string; completedAt: string | null }>;
  evaluations: Array<{ id: string; evaluatedAt: string; priorityAreas: string[]; shortTermGoal: string | null }>;
  achievements: Array<{ id: string; title: string; achievedAt: string }>;
  assignedWork: Array<{ id: string; title: string; status: string }>;
  trainerNotes: Array<{ id: string; body: string; createdAt: string }>;
  coachTags: Array<{ id: string; label: string }>;
};

export default function PlayerProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [player, setPlayer] = useState<PlayerDetail | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function fetchPlayer(): Promise<PlayerDetail> {
    const response = await authenticatedFetch(`/api/trainer/players/${params.id}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Could not load player.");
    return payload.player;
  }

  useEffect(() => {
    let cancelled = false;

    async function loadPlayer() {
      try {
        const nextPlayer = await fetchPlayer();
        if (!cancelled) setPlayer(nextPlayer);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load player.");
      }
    }

    void loadPlayer();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      const response = await authenticatedFetch(`/api/trainer/players/${params.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not save player.");
      const refreshedPlayer = await fetchPlayer();
      setPlayer(refreshedPlayer);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save player.");
    } finally {
      setSaving(false);
    }
  }

  async function archivePlayer() {
    if (!window.confirm("Archive this player? Their history will stay in the database.")) return;
    const response = await authenticatedFetch(`/api/trainer/players/${params.id}`, { method: "DELETE" });
    if (response.ok) router.replace("/trainer/players");
  }

  if (!player) {
    return (
      <main className="players-shell">
        <p className="eyebrow">PLAYER PROFILE</p>
        <h1>{error ? "Could not load player" : "Loading player…"}</h1>
        {error && <p className="auth-error">{error}</p>}
      </main>
    );
  }

  const currentFocus = player.developmentFocuses.find((item) => !item.completedAt)?.focus;
  const latestEvaluation = player.evaluations[0];

  return (
    <main className="players-shell">
      <header className="players-header">
        <div>
          <Link className="back-link" href="/trainer/players">← All players</Link>
          <p className="eyebrow">PLAYER PROFILE</p>
          <h1>{player.preferredName || player.firstName} {player.lastName}</h1>
          <p className="support-copy">
            {[player.position, player.schoolTeam, player.classYear ? `Class of ${player.classYear}` : null].filter(Boolean).join(" · ") || "Development profile"}
          </p>
        </div>
        <div className="profile-actions">
          <button className="ghost-button" type="button" onClick={() => setEditing((value) => !value)}>{editing ? "Close edit" : "Edit profile"}</button>
          <Link className="primary-link-button" href={`/trainer/evaluation/new?playerId=${player.id}`}>Baseline evaluation</Link>
        </div>
      </header>

      {editing && (
        <section className="player-create-card">
          <div className="section-heading">
            <div><span className="section-kicker">PROFILE DETAILS</span><h2>Edit athlete</h2></div>
          </div>
          <form className="player-create-grid" onSubmit={saveProfile}>
            <label>First name<input name="firstName" defaultValue={player.firstName} required /></label>
            <label>Last name<input name="lastName" defaultValue={player.lastName} required /></label>
            <label>Preferred name<input name="preferredName" defaultValue={player.preferredName ?? ""} /></label>
            <label>Date of birth<input name="birthDate" type="date" defaultValue={player.birthDate?.slice(0,10) ?? ""} /></label>
            <label>Class year<input name="classYear" inputMode="numeric" defaultValue={player.classYear ?? ""} /></label>
            <label>Height<input name="height" defaultValue={player.height ?? ""} /></label>
            <label>Position<input name="position" defaultValue={player.position ?? ""} /></label>
            <label>School / team<input name="schoolTeam" defaultValue={player.schoolTeam ?? ""} /></label>
            <label>Years playing<input name="yearsPlaying" inputMode="numeric" defaultValue={player.yearsPlaying ?? ""} /></label>
            <label className="full-field">Basketball experience<textarea name="playingExperience" rows={2} defaultValue={player.playingExperience ?? ""} /></label>
            <label className="full-field">Player / parent development needs<textarea name="selfReportedNeeds" rows={2} defaultValue={player.selfReportedNeeds ?? ""} /></label>
            <label className="full-field">Training limitations<textarea name="trainingLimitations" rows={2} defaultValue={player.trainingLimitations ?? ""} /></label>
            <button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving…" : "Save profile"}</button>
          </form>
          <button className="danger-text-button" type="button" onClick={archivePlayer}>Archive player</button>
        </section>
      )}

      {error && <p className="auth-error">{error}</p>}

      <section className="profile-summary-grid">
        <article className="profile-summary-card highlight-card">
          <span>Current development focus</span>
          <strong>{currentFocus ?? "Not set yet"}</strong>
        </article>
        <article className="profile-summary-card">
          <span>Active goals</span>
          <strong>{player.goals.filter((goal) => goal.status === "ACTIVE").length}</strong>
        </article>
        <article className="profile-summary-card">
          <span>Evaluations</span>
          <strong>{player.evaluations.length}</strong>
        </article>
        <article className="profile-summary-card">
          <span>Latest baseline / reevaluation</span>
          <strong>{latestEvaluation ? new Date(latestEvaluation.evaluatedAt).toLocaleDateString() : "Not completed"}</strong>
        </article>
      </section>

      <section className="profile-content-grid">
        <article className="session-card">
          <div className="section-heading"><div><span className="section-kicker">GOALS</span><h2>Current goals</h2></div></div>
          {player.goals.length ? player.goals.slice(0,5).map((goal) => <div className="profile-list-row" key={goal.id}><strong>{goal.title}</strong><span>{goal.type.replaceAll("_", " ")} · {goal.status}</span></div>) : <p className="support-copy">No goals yet.</p>}
        </article>

        <article className="session-card">
          <div className="section-heading"><div><span className="section-kicker">COACH TAGS</span><h2>Quick reminders</h2></div></div>
          <div className="coach-tags">{player.coachTags.length ? player.coachTags.map((tag) => <span className="coach-tag" key={tag.id}>{tag.label}</span>) : <span className="support-copy">No coach tags yet.</span>}</div>
        </article>

        <article className="session-card">
          <div className="section-heading"><div><span className="section-kicker">EVALUATION</span><h2>Latest development plan</h2></div></div>
          {latestEvaluation ? <><p><strong>{latestEvaluation.priorityAreas.join(" · ") || "No priorities saved"}</strong></p><p className="support-copy">{latestEvaluation.shortTermGoal || "No short-term goal saved."}</p></> : <p className="support-copy">Complete the first baseline evaluation to establish priorities.</p>}
        </article>

        <article className="session-card">
          <div className="section-heading"><div><span className="section-kicker">TRAINER ONLY</span><h2>Private notes</h2></div></div>
          {player.trainerNotes.length ? player.trainerNotes.slice(0,3).map((note) => <div className="profile-list-row" key={note.id}><strong>{note.body}</strong><span>{new Date(note.createdAt).toLocaleDateString()}</span></div>) : <p className="support-copy">No private trainer notes yet.</p>}
        </article>
      </section>
    </main>
  );
}
