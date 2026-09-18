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

const ratingLabels = [
  "",
  "Building Foundation",
  "Developing",
  "Game Ready",
  "Getting Tuff",
  "Tuff",
];

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

type RatingState = {
  rating: number | null;
  assessed: boolean;
  tags: string[];
};

export default function BaselineEvaluationPage() {
  const [step, setStep] = useState(1);
  const [ratings, setRatings] = useState<Record<string, RatingState>>(
    Object.fromEntries(
      categories.map((category) => [category, { rating: null, assessed: true, tags: [] }]),
    ),
  );
  const [priorities, setPriorities] = useState<string[]>([]);
  const [goal, setGoal] = useState("");

  const ratedCount = useMemo(
    () => Object.values(ratings).filter((item) => item.assessed && item.rating !== null).length,
    [ratings],
  );

  function updateRating(category: string, rating: number | null) {
    setRatings((current) => ({
      ...current,
      [category]: { ...current[category], rating, assessed: true },
    }));
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
          tags: active
            ? current[category].tags.filter((item) => item !== tag)
            : [...current[category].tags, tag],
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

  return (
    <main className="evaluation-shell">
      <header className="evaluation-header">
        <div>
          <p className="eyebrow">NEW ATHLETE · BASELINE</p>
          <h1 className="evaluation-title">First Evaluation</h1>
          <p className="session-meta">
            Build the starting point, then leave with a clear first development plan.
          </p>
        </div>
        <div className="step-chip">Step {step} of 3</div>
      </header>

      <nav className="evaluation-steps" aria-label="Baseline evaluation steps">
        <button className={step === 1 ? "active" : ""} onClick={() => setStep(1)}>1. Athlete</button>
        <button className={step === 2 ? "active" : ""} onClick={() => setStep(2)}>2. Evaluate</button>
        <button className={step === 3 ? "active" : ""} onClick={() => setStep(3)}>3. First Plan</button>
      </nav>

      {step === 1 && (
        <section className="evaluation-card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">ATHLETE INTAKE</span>
              <h2>Know who you&apos;re evaluating</h2>
            </div>
          </div>

          <div className="intake-grid">
            <label>First name<input placeholder="First name" /></label>
            <label>Last name<input placeholder="Last name" /></label>
            <label>Date of birth<input type="date" /></label>
            <label>Grade / class year<input placeholder="Example: 7th / 2032" /></label>
            <label>Height<input placeholder="Example: 5'8&quot;" /></label>
            <label>Position<input placeholder="PG / Wing / Post" /></label>
            <label>School / team<input placeholder="School or team" /></label>
            <label>Years playing<input inputMode="numeric" placeholder="Example: 3" /></label>
            <label className="full-field">
              Basketball experience
              <textarea rows={2} placeholder="School ball, AAU, rec league, varsity/JV, beginner, etc." />
            </label>
            <label className="full-field">
              What do they feel they need help with?
              <textarea rows={2} placeholder="Player/parent perspective before your evaluation" />
            </label>
            <label className="full-field">
              Basketball goals
              <textarea rows={2} placeholder="Make the team, earn more minutes, varsity, college, stronger handle..." />
            </label>
            <label className="full-field">
              Training limitations relevant to the session
              <textarea rows={2} placeholder="Only what you need to train them safely and appropriately" />
            </label>
            <label>Parent / guardian name<input placeholder="Guardian name" /></label>
            <label>Parent / guardian email<input type="email" placeholder="guardian@email.com" /></label>
          </div>

          <button className="primary-button" type="button" onClick={() => setStep(2)}>
            Start Baseline Evaluation
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="evaluation-card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">12-CATEGORY BASELINE</span>
              <h2>Rate what you actually observed</h2>
            </div>
            <span className="speed-chip">{ratedCount}/12 rated</span>
          </div>
          <p className="support-copy">
            The full template stays consistent, but a category can be marked Not Assessed when it was not meaningfully observed.
          </p>

          <div className="category-stack">
            {categories.map((category) => {
              const state = ratings[category];
              return (
                <article className={state.assessed ? "rating-card" : "rating-card muted-rating"} key={category}>
                  <div className="rating-card-header">
                    <h3>{category}</h3>
                    <button className="text-button" type="button" onClick={() => toggleAssessed(category)}>
                      {state.assessed ? "Not assessed" : "Assess category"}
                    </button>
                  </div>

                  {state.assessed ? (
                    <>
                      <div className="rating-scale">
                        {[1,2,3,4,5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            className={state.rating === rating ? "rating-button selected" : "rating-button"}
                            onClick={() => updateRating(category, rating)}
                          >
                            <strong>{rating}</strong>
                            <span>{ratingLabels[rating]}</span>
                          </button>
                        ))}
                      </div>

                      <div className="observation-tags">
                        {observationOptions[category].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            className={state.tags.includes(tag) ? "observation-tag selected" : "observation-tag"}
                            onClick={() => toggleTag(category, tag)}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>

                      <textarea className="evaluation-note" rows={2} placeholder="Optional trainer note or evidence..." />
                    </>
                  ) : (
                    <p className="not-assessed-copy">Not assessed in this baseline session.</p>
                  )}
                </article>
              );
            })}
          </div>

          <button className="primary-button" type="button" onClick={() => setStep(3)}>
            Build First Development Plan
          </button>
        </section>
      )}

      {step === 3 && (
        <section className="evaluation-card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">FIRST DEVELOPMENT PLAN</span>
              <h2>Turn the evaluation into action</h2>
            </div>
            <span className="speed-chip">{priorities.length}/3 priorities</span>
          </div>

          <p className="support-copy">
            Choose the 2–3 areas that matter most right now. These become the athlete&apos;s initial development focus.
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
            First short-term goal
            <textarea
              rows={3}
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              placeholder="Example: Maintain a low, strong stance through change-of-direction combinations under pressure."
            />
          </label>

          <div className="plan-summary">
            <span>Initial development focus</span>
            <strong>{priorities.length ? priorities.join(" · ") : "Choose 2–3 priorities"}</strong>
            <p>{goal || "Add the first measurable short-term goal."}</p>
          </div>

          <button className="primary-button" type="button">
            Save Baseline & Create Player Plan
          </button>
        </section>
      )}
    </main>
  );
}
