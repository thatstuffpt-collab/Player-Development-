"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

const categories = [
  "Ball Control",
  "Finishing",
  "Shooting",
  "Decision Making",
  "Playing Under Pressure",
  "Off-Ball Awareness",
  "On-Ball Defense",
  "Defensive Awareness",
  "Effort & Competitiveness",
  "Coachability",
  "Confidence",
  "Response to Mistakes",
];

const ratingLabels = ["", "Building Foundation", "Developing", "Game Ready", "Getting Tuff", "Tuff"];

const observationOptions: Record<string, string[]> = {
  "Ball Control": ["Weak off-hand", "Loses stance", "Struggles changing direction", "Good pace control"],
  Finishing: ["Avoids contact", "Needs touch", "Strong hand only", "Finishes through contact"],
  Shooting: ["Balance inconsistent", "Needs cleaner pickup", "Good shot prep", "Repeatable mechanics"],
  "Decision Making": ["Slow reads", "Predetermines move", "Sees help", "Makes quick reads"],
  "Playing Under Pressure": ["Speeds up", "Loses control", "Stays composed", "Handles contact"],
  "Off-Ball Awareness": ["Stands still", "Late cuts", "Finds space", "Reads defender"],
  "On-Ball Defense": ["Stance too high", "Crosses feet", "Contains drive", "Active hands"],
  "Defensive Awareness": ["Ball watches", "Late help", "Communicates", "Rotates on time"],
  "Effort & Competitiveness": ["Needs more motor", "Inconsistent effort", "Competes every rep", "Responds to challenge"],
  Coachability: ["Needs repeated cue", "Applies correction", "Asks good questions", "Self-corrects"],
  Confidence: ["Hesitant", "Avoids mistakes", "Plays assertive", "Trusts skill"],
  "Response to Mistakes": ["Dwells on error", "Body language drops", "Resets quickly", "Next-play mindset"],
};

type RatingState = { rating: number | null; assessed: boolean; tags: string[]; note: string };
type PlayerSummary = {
  id: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  classYear: number | null;
  position: string | null;
  schoolTeam: string | null;
  playingExperience: string | null;
  selfReportedNeeds: string | null;
  trainingLimitations: string | null;
  evaluations: Array<{ id: string }>;
};

export default function BaselineEvaluationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playerId = searchParams.get("playerId");
  const [player, setPlayer] = useState<PlayerSummary | null>(null);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [intake, setIntake] = useState({
    playingExperience: "",
    selfReportedNeeds: "",
    trainingLimitations: "",
    bigPictureGoal: "",
    guardianName: "",
    guardianEmail: "",
  });
  const [ratings, setRatings] = useState<Record<string, RatingState>>(
    Object.fromEntries(categories.map((category) => [category, { rating: null, assessed: true, tags: [], note: "" }])),
  );
  const [priorities, setPriorities] = useState<string[]>([]);
  const [goal, setGoal] = useState("");

  useEffect(() => {
    if (!playerId) return;
    (async () => {
      try {
        const response = await authenticatedFetch(`/api/trainer/players/${playerId}`);
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Could not load player.");
        setPlayer(payload.player);
        setIntake((current) => ({
          ...current,
          playingExperience: payload.player.playingExperience ?? "",
          selfReportedNeeds: payload.player.selfReportedNeeds ?? "",
          trainingLimitations: payload.player.trainingLimitations ?? "",
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load player.");
      }
    })();
  }, [playerId]);

  const ratedCount = useMemo(
    () => Object.values(ratings).filter((item) => item.assessed && item.rating !== null).length,
    [ratings],
  );

  function updateRating(category: string, rating: number | null) {
    setRatings((current) => ({ ...current, [category]: { ...current[category], rating, assessed: true } }));
  }

  function toggleAssessed(category: string) {
    setRatings((current) => {
      const nextAssessed = !current[category].assessed;
      return {
        ...current,
        [category]: {
          ...current[category],
          assessed: nextAssessed,
          rating: nextAssessed ? current[category].rating : null,
          tags: nextAssessed ? current[category].tags : [],
          note: nextAssessed ? current[category].note : "",
        },
      };
    });
  }

  function toggleTag(category: string, tag: string) {
    setRatings((current) => {
      const active = current[category].tags.includes(tag);
      return {
        ...current,
        [category]: {
          ...current[category],
          tags: active ? current[category].tags.filter((item) => item !== tag) : [...current[category].tags, tag],
        },
      };
    });
  }

  function togglePriority(category: string) {
    setPriorities((current) => {
      if (current.includes(category)) return current.filter((item) => item !== category);
      if (current.length >= 3) return current;
      return [...current, category];
    });
  }

  async function saveBaseline() {
    if (!playerId) return;
    setSaving(true);
    setError("");
    try {
      const response = await authenticatedFetch(`/api/trainer/players/${playerId}/baseline`, {
        method: "POST",
        body: JSON.stringify({
          ...intake,
          priorities,
          shortTermGoal: goal,
          ratings: categories.map((category) => ({
            category,
            rating: ratings[category].assessed ? ratings[category].rating : null,
            tags: ratings[category].tags,
            note: ratings[category].note,
          })),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not save baseline.");
      router.push(`/trainer/players/${playerId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save baseline.");
      setSaving(false);
    }
  }

  if (!playerId) {
    return (
      <main className="evaluation-shell">
        <p className="eyebrow">BASELINE EVALUATION</p>
        <h1 className="evaluation-title">Choose a player first</h1>
        <p className="support-copy">Create or open a player profile, then start the baseline from that profile.</p>
        <Link className="primary-link-button" href="/trainer/players">Open players</Link>
      </main>
    );
  }

  if (!player) {
    return <main className="evaluation-shell"><p className="eyebrow">BASELINE EVALUATION</p><h1 className="evaluation-title">{error || "Loading athlete…"}</h1></main>;
  }

  if (player.evaluations.length > 0) {
    return (
      <main className="evaluation-shell">
        <p className="eyebrow">BASELINE EVALUATION</p>
        <h1 className="evaluation-title">Baseline already completed</h1>
        <p className="support-copy">Use the reevaluation workflow for this athlete.</p>
        <Link className="primary-link-button" href={`/trainer/players/${player.id}`}>Back to player</Link>
      </main>
    );
  }

  const playerName = player.preferredName || player.firstName;

  return (
    <main className="evaluation-shell">
      <header className="evaluation-header">
        <div>
          <p className="eyebrow">{playerName.toUpperCase()} · BASELINE</p>
          <h1 className="evaluation-title">First Evaluation</h1>
          <p className="session-meta">Build the starting point, then leave with a clear first development plan.</p>
        </div>
        <div className="step-chip">Step {step} of 3</div>
      </header>

      <nav className="evaluation-steps" aria-label="Baseline evaluation steps">
        <button className={step === 1 ? "active" : ""} onClick={() => setStep(1)}>1. Athlete</button>
        <button className={step === 2 ? "active" : ""} onClick={() => setStep(2)}>2. Evaluate</button>
        <button className={step === 3 ? "active" : ""} onClick={() => setStep(3)}>3. First Plan</button>
      </nav>

      {error && <p className="auth-error">{error}</p>}

      {step === 1 && (
        <section className="evaluation-card">
          <div className="section-heading"><div><span className="section-kicker">ATHLETE INTAKE</span><h2>{playerName} {player.lastName}</h2></div></div>
          <p className="support-copy">{[player.position, player.schoolTeam, player.classYear ? `Class of ${player.classYear}` : null].filter(Boolean).join(" · ") || "Profile started"}</p>
          <div className="intake-grid">
            <label className="full-field">Basketball experience<textarea rows={2} value={intake.playingExperience} onChange={(event) => setIntake({ ...intake, playingExperience: event.target.value })} /></label>
            <label className="full-field">What do they feel they need help with?<textarea rows={2} value={intake.selfReportedNeeds} onChange={(event) => setIntake({ ...intake, selfReportedNeeds: event.target.value })} /></label>
            <label className="full-field">Big-picture basketball goal<textarea rows={2} value={intake.bigPictureGoal} onChange={(event) => setIntake({ ...intake, bigPictureGoal: event.target.value })} placeholder="Make varsity, earn more minutes, play college basketball..." /></label>
            <label className="full-field">Training limitations relevant to the session<textarea rows={2} value={intake.trainingLimitations} onChange={(event) => setIntake({ ...intake, trainingLimitations: event.target.value })} /></label>
            <label>Parent / guardian name<input value={intake.guardianName} onChange={(event) => setIntake({ ...intake, guardianName: event.target.value })} /></label>
            <label>Parent / guardian email<input type="email" value={intake.guardianEmail} onChange={(event) => setIntake({ ...intake, guardianEmail: event.target.value })} /></label>
          </div>
          <button className="primary-button" type="button" onClick={() => setStep(2)}>Start Baseline Evaluation</button>
        </section>
      )}

      {step === 2 && (
        <section className="evaluation-card">
          <div className="section-heading"><div><span className="section-kicker">12-CATEGORY BASELINE</span><h2>Rate what you actually observed</h2></div><span className="speed-chip">{ratedCount}/12 rated</span></div>
          <p className="support-copy">The full template stays consistent, but a category can be marked Not Assessed when it was not meaningfully observed.</p>
          <div className="category-stack">
            {categories.map((category) => {
              const state = ratings[category];
              return (
                <article className={state.assessed ? "rating-card" : "rating-card muted-rating"} key={category}>
                  <div className="rating-card-header"><h3>{category}</h3><button className="text-button" type="button" onClick={() => toggleAssessed(category)}>{state.assessed ? "Not assessed" : "Assess category"}</button></div>
                  {state.assessed ? <>
                    <div className="rating-scale">{[1,2,3,4,5].map((rating) => <button key={rating} type="button" className={state.rating === rating ? "rating-button selected" : "rating-button"} onClick={() => updateRating(category, rating)}><strong>{rating}</strong><span>{ratingLabels[rating]}</span></button>)}</div>
                    <div className="observation-tags">{observationOptions[category].map((tag) => <button key={tag} type="button" className={state.tags.includes(tag) ? "observation-tag selected" : "observation-tag"} onClick={() => toggleTag(category, tag)}>{tag}</button>)}</div>
                    <textarea className="evaluation-note" rows={2} placeholder="Optional trainer note or evidence..." value={state.note} onChange={(event) => setRatings((current) => ({ ...current, [category]: { ...current[category], note: event.target.value } }))} />
                  </> : <p className="not-assessed-copy">Not assessed in this baseline session.</p>}
                </article>
              );
            })}
          </div>
          <button className="primary-button" type="button" onClick={() => setStep(3)}>Build First Development Plan</button>
        </section>
      )}

      {step === 3 && (
        <section className="evaluation-card">
          <div className="section-heading"><div><span className="section-kicker">FIRST DEVELOPMENT PLAN</span><h2>Turn the evaluation into action</h2></div><span className="speed-chip">{priorities.length}/3 priorities</span></div>
          <p className="support-copy">Choose the 2–3 areas that matter most right now. These become the athlete&apos;s initial development focus.</p>
          <div className="priority-grid">{categories.map((category) => <button key={category} type="button" className={priorities.includes(category) ? "priority-button selected" : "priority-button"} onClick={() => togglePriority(category)}>{category}</button>)}</div>
          <label className="goal-field">First short-term goal<textarea rows={3} value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Example: Maintain a low, strong stance through change-of-direction combinations under pressure." /></label>
          <div className="plan-summary"><span>Initial development focus</span><strong>{priorities.length ? priorities.join(" · ") : "Choose 2–3 priorities"}</strong><p>{goal || "Add the first measurable short-term goal."}</p></div>
          <button className="primary-button" type="button" onClick={saveBaseline} disabled={saving}>{saving ? "Saving baseline…" : "Save Baseline & Create Player Plan"}</button>{error && <p className="auth-error" role="alert">{error}</p>}
        </section>
      )}
    </main>
  );
}
