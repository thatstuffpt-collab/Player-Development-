"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

type Rating = { id: string; rating: number | null; criterion: { key: string; label: string; sortOrder: number } };
type Evaluation = {
  id: string;
  evaluatedAt: string;
  summary: string | null;
  nextFocus: string | null;
  priorityAreas: string[];
  shortTermGoal: string | null;
  template: { name: string; version: number };
  ratings: Rating[];
};
type ParentPlayer = {
  id: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  classYear: number | null;
  height: string | null;
  position: string | null;
  schoolTeam: string | null;
  goals: Array<{ id: string; type: string; title: string; description: string | null; status: string; targetDate: string | null; completedAt: string | null }>;
  developmentFocuses: Array<{ id: string; focus: string; reason: string | null; startedAt: string; completedAt: string | null }>;
  evaluations: Evaluation[];
  progressEvents: Array<{ id: string; occurredAt: string; type: string; category: string; title: string; result: string; nextStep: string | null }>;
  achievements: Array<{ id: string; type: string; title: string; description: string | null; achievedAt: string }>;
  assignedWork: Array<{ id: string; title: string; description: string | null; status: string; assignedAt: string; dueAt: string | null; completedAt: string | null }>;
};

const ratingLabel: Record<number, string> = {
  1: "Building Foundation",
  2: "Developing",
  3: "Game Ready",
  4: "Getting Tuff",
  5: "Tuff",
};

export default function ParentAthletePage() {
  const params = useParams<{ id: string }>();
  const [player, setPlayer] = useState<ParentPlayer | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void authenticatedFetch(`/api/parent/players/${params.id}`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Could not load athlete.");
        setPlayer(payload.player);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load athlete."));
  }, [params.id]);

  if (!player) {
    return <main className="parent-shell"><Link href="/parent" className="parent-back">← My Athletes</Link><p>{error || "Loading athlete…"}</p></main>;
  }

  const currentFocus = player.developmentFocuses.find((focus) => !focus.completedAt);
  const latestEvaluation = player.evaluations[0];

  return (
    <main className="parent-shell">
      <Link href="/parent" className="parent-back">← My Athletes</Link>
      <header className="parent-header">
        <p className="parent-eyebrow">ATHLETE DEVELOPMENT</p>
        <h1>{player.preferredName || player.firstName} {player.lastName}</h1>
        <p>{[player.position, player.schoolTeam, player.classYear ? `Class of ${player.classYear}` : null].filter(Boolean).join(" · ")}</p>
      </header>

      <section className="parent-overview">
        <article className="parent-card parent-highlight"><span>Current focus</span><h2>{currentFocus?.focus || "No current focus posted"}</h2></article>
        <article className="parent-card"><span>Goals</span><h2>{player.goals.filter((goal) => goal.status === "ACTIVE").length} active</h2></article>
        <article className="parent-card"><span>Latest evaluation</span><h2>{latestEvaluation ? new Date(latestEvaluation.evaluatedAt).toLocaleDateString() : "Not posted yet"}</h2></article>
      </section>

      <section className="parent-section">
        <div><p className="parent-eyebrow">GOALS</p><h2>What we are working toward</h2></div>
        <div className="parent-grid">
          {player.goals.map((goal) => <article className="parent-card" key={goal.id}><span className="parent-chip">{goal.type.replaceAll("_", " ")}</span><h3>{goal.title}</h3>{goal.description && <p>{goal.description}</p>}<small>{goal.status.replaceAll("_", " ")}</small></article>)}
          {!player.goals.length && <p>No goals have been shared yet.</p>}
        </div>
      </section>

      <section className="parent-section">
        <div><p className="parent-eyebrow">EVALUATIONS</p><h2>Development progress</h2></div>
        {player.evaluations.map((evaluation) => (
          <article className="parent-card parent-evaluation" key={evaluation.id}>
            <div className="parent-eval-heading"><div><strong>{evaluation.template.name}</strong><span>{new Date(evaluation.evaluatedAt).toLocaleDateString()}</span></div><span className="parent-chip">Version {evaluation.template.version}</span></div>
            {evaluation.priorityAreas.length > 0 && <p><strong>Priorities:</strong> {evaluation.priorityAreas.join(" · ")}</p>}
            {evaluation.shortTermGoal && <p><strong>Short-term goal:</strong> {evaluation.shortTermGoal}</p>}
            <div className="parent-ratings">{evaluation.ratings.map((item) => <div key={item.id}><span>{item.criterion.label}</span><strong>{item.rating ? `${item.rating} · ${ratingLabel[item.rating]}` : "Not assessed"}</strong></div>)}</div>
            {evaluation.summary && <p>{evaluation.summary}</p>}
            {evaluation.nextFocus && <p><strong>Next focus:</strong> {evaluation.nextFocus}</p>}
          </article>
        ))}
        {!player.evaluations.length && <p>No formal evaluations have been shared yet.</p>}
      </section>

      <section className="parent-section">
        <div><p className="parent-eyebrow">ASSIGNED WORK</p><h2>What to work on next</h2></div>
        <div className="parent-grid">{player.assignedWork.map((work) => <article className="parent-card" key={work.id}><span className="parent-chip">{work.status.replaceAll("_", " ")}</span><h3>{work.title}</h3>{work.description && <p>{work.description}</p>}{work.dueAt && <small>Due {new Date(work.dueAt).toLocaleDateString()}</small>}</article>)}</div>
        {!player.assignedWork.length && <p>No assigned work right now.</p>}
      </section>

      <section className="parent-section">
        <div><p className="parent-eyebrow">PROGRESS</p><h2>Trainer-shared results</h2></div>
        <div className="parent-grid">{player.progressEvents.map((event) => <article className="parent-card" key={event.id}><span>{new Date(event.occurredAt).toLocaleDateString()} · {event.category}</span><h3>{event.title}</h3><strong>{event.result}</strong>{event.nextStep && <small>{event.nextStep.replaceAll("_", " ")}</small>}</article>)}</div>
        {!player.progressEvents.length && <p>No training results have been shared yet.</p>}
      </section>

      <section className="parent-section">
        <div><p className="parent-eyebrow">ACHIEVEMENTS</p><h2>Milestones</h2></div>
        <div className="parent-grid">{player.achievements.map((achievement) => <article className="parent-card" key={achievement.id}><span>{new Date(achievement.achievedAt).toLocaleDateString()}</span><h3>{achievement.title}</h3>{achievement.description && <p>{achievement.description}</p>}</article>)}</div>
        {!player.achievements.length && <p>No achievements have been added yet.</p>}
      </section>
    </main>
  );
}
