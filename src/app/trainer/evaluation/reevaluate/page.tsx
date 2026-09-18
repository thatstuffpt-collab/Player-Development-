"use client";

import { useMemo, useState } from "react";

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

const priorRatings: Record<string, number> = {
  "Ball Control": 2,
  Finishing: 2,
  Shooting: 3,
  "Decision Making": 2,
  "Playing Under Pressure": 2,
  "Off-Ball Awareness": 3,
  "On-Ball Defense": 3,
  "Defensive Awareness": 2,
  "Effort & Competitiveness": 3,
  Coachability: 4,
  Confidence: 2,
  "Response to Mistakes": 2,
};

const evidence: Record<string, string[]> = {
  "Ball Control": ["Timed combo: 22.4s → 20.8s", "Stayed lower through live pressure"],
  Finishing: ["7/10 contact finishes right side", "Improved two-foot balance"],
  Shooting: ["8/10 one-dribble pull-up right slot"],
  "Decision Making": ["Quicker second-side read in live play"],
  "Playing Under Pressure": ["Two clean possessions vs guide-hand pressure"],
  "Off-Ball Awareness": ["Better spacing in 3v3"],
  "On-Ball Defense": ["Contained drive 4/6 reps"],
  "Defensive Awareness": ["Late help still showing up"],
  "Effort & Competitiveness": ["Competed through final live segment"],
  Coachability: ["Applied footwork cue within same session"],
  Confidence: ["Attacked closeout without hesitation"],
  "Response to Mistakes": ["Reset faster after turnover"],
};

export default function ReevaluationPage() {
  const [ratings, setRatings] = useState<Record<string, number | null>>(
    Object.fromEntries(categories.map((category) => [category, priorRatings[category]])),
  );
  const [priorities, setPriorities] = useState<string[]>(["Ball Control", "Decision Making"]);
  const [goal, setGoal] = useState("Keep control and make the correct first read under live pressure.");

  const changes = useMemo(
    () =>
      categories.map((category) => {
        const previous = priorRatings[category];
        const current = ratings[category];
        return {
          category,
          previous,
          current,
          delta: current === null ? null : current - previous,
        };
      }),
    [ratings],
  );

  const changedCount = changes.filter((item) => item.delta !== 0 && item.delta !== null).length;

  function togglePriority(category: string) {
    setPriorities((current) => {
      if (current.includes(category)) return current.filter((item) => item !== category);
      if (current.length >= 3) return current;
      return [...current, category];
    });
  }

  return (
    <main className="reeval-shell">
      <header className="reeval-header">
        <div>
          <p className="eyebrow">PLAYER REEVALUATION</p>
          <h1 className="evaluation-title">Jordan M.</h1>
          <p className="session-meta">Compare against baseline · Evidence since last evaluation included</p>
        </div>
        <div className="step-chip">{changedCount} rating changes</div>
      </header>

      <section className="reeval-overview">
        <div>
          <span>Previous evaluation</span>
          <strong>Aug 20, 2026</strong>
        </div>
        <div>
          <span>Current development focus</span>
          <strong>Ball control under pressure</strong>
        </div>
        <div>
          <span>Current short-term goal</span>
          <strong>Stay low and make the correct first read</strong>
        </div>
      </section>

      <section className="evaluation-card">
        <div className="section-heading">
          <div>
            <span className="section-kicker">COMPARE + UPDATE</span>
            <h2>Use evidence, then make the coaching call</h2>
          </div>
        </div>
        <p className="support-copy">
          The previous evaluation never changes. This screen creates a new evaluation while showing what happened in between.
        </p>

        <div className="reeval-stack">
          {categories.map((category) => {
            const previous = priorRatings[category];
            const current = ratings[category];
            const delta = current === null ? null : current - previous;

            return (
              <article className="reeval-card" key={category}>
                <div className="reeval-title-row">
                  <h3>{category}</h3>
                  {delta !== null && (
                    <span className={delta > 0 ? "delta positive" : delta < 0 ? "delta negative" : "delta"}>
                      {delta > 0 ? `+${delta}` : delta}
                    </span>
                  )}
                </div>

                <div className="reeval-columns">
                  <div className="previous-rating">
                    <span>Previous</span>
                    <strong>{previous}</strong>
                    <p>{ratingLabels[previous]}</p>
                  </div>

                  <div className="evidence-panel">
                    <span>Evidence since last evaluation</span>
                    <ul>
                      {(evidence[category] ?? ["No meaningful evidence logged yet"]).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="new-rating">
                    <span>New rating</span>
                    <div className="compact-rating-scale">
                      {[1,2,3,4,5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          className={current === rating ? "compact-rating selected" : "compact-rating"}
                          onClick={() => setRatings((state) => ({ ...state, [category]: rating }))}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                    <p>{current ? ratingLabels[current] : "Not assessed"}</p>
                  </div>
                </div>

                <textarea
                  className="evaluation-note"
                  rows={2}
                  placeholder="Why did this rating change or stay the same? Optional trainer note..."
                />
              </article>
            );
          })}
        </div>
      </section>

      <section className="evaluation-card reeval-plan">
        <div className="section-heading">
          <div>
            <span className="section-kicker">UPDATED DEVELOPMENT PLAN</span>
            <h2>What matters next?</h2>
          </div>
          <span className="speed-chip">{priorities.length}/3 priorities</span>
        </div>

        <p className="support-copy">
          Keep, remove, or replace the athlete&apos;s top 2–3 priorities based on this reevaluation.
        </p>

        <div className="priority-grid">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={priorities.includes(category) ? "priority-button selected" : "priority-button"}
              onClick={() => togglePriority(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <label className="goal-field">
          Updated short-term goal
          <textarea
            rows={3}
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
          />
        </label>

        <div className="reeval-summary">
          <div>
            <span>Keep doing</span>
            <strong>Use meaningful evidence between formal evaluations</strong>
          </div>
          <div>
            <span>Updated priorities</span>
            <strong>{priorities.length ? priorities.join(" · ") : "Choose 2–3 priorities"}</strong>
          </div>
          <div>
            <span>Next formal evaluation</span>
            <strong>Trainer decides based on development cycle</strong>
          </div>
        </div>

        <button className="primary-button" type="button">
          Save New Evaluation & Update Plan
        </button>
      </section>
    </main>
  );
}
