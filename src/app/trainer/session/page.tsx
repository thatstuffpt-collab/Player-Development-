"use client";

import { FormEvent, useMemo, useState } from "react";

const focusOptions = [
  "Ball Handling",
  "Finishing",
  "Shooting",
  "Defense",
  "Footwork",
  "Decision Making",
  "Conditioning",
];

const starterTags = [
  "Stronger dribble",
  "Clean up footwork",
  "Stay lower",
  "Finish through contact",
];

const plan = [
  { title: "Handle warm-up", detail: "Low stance + control" },
  { title: "Primary progression", detail: "Change of direction into live read" },
  { title: "Finishing", detail: "2-foot finishes through contact" },
  { title: "Competitive close", detail: "Live decision-making" },
];

export default function TrainerSessionPage() {
  const [focus, setFocus] = useState("Ball Handling");
  const [tags, setTags] = useState(starterTags);
  const [tagInput, setTagInput] = useState("");
  const [logs, setLogs] = useState([
    {
      type: "Dribbling result",
      result: "Timed combination improved from 22.4s to 20.8s",
      next: "Keep progressing",
    },
  ]);

  const lastMeaningful = useMemo(() => logs[0], [logs]);

  function addTag(event: FormEvent) {
    event.preventDefault();
    const nextTag = tagInput.trim();
    if (!nextTag || tags.includes(nextTag)) return;
    setTags((current) => [...current, nextTag]);
    setTagInput("");
  }

  function addQuickLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const type = String(data.get("type") ?? "Coach observation");
    const result = String(data.get("result") ?? "").trim();
    const next = String(data.get("next") ?? "Keep progressing");

    if (!result) return;

    setLogs((current) => [{ type, result, next }, ...current]);
    event.currentTarget.reset();
  }

  return (
    <main className="session-shell">
      <header className="session-header">
        <div>
          <p className="eyebrow">TRAINER SESSION</p>
          <h1 className="player-name">Jordan M.</h1>
          <p className="session-meta">Today · 60 min individual session</p>
        </div>
        <button className="ghost-button" type="button">Player profile</button>
      </header>

      <section className="session-grid">
        <article className="session-card focus-card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">01</span>
              <h2>Today&apos;s focus</h2>
            </div>
            <span className="required-chip">Start here</span>
          </div>
          <div className="focus-options" role="list" aria-label="Session focus options">
            {focusOptions.map((option) => (
              <button
                key={option}
                className={option === focus ? "focus-pill active" : "focus-pill"}
                onClick={() => setFocus(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
          <div className="focus-summary">
            <span>Main training focus</span>
            <strong>{focus}</strong>
          </div>
        </article>

        <article className="session-card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">02</span>
              <h2>Quick coach notes</h2>
            </div>
          </div>
          <p className="support-copy">
            Fast tags that stay on the player profile until you remove them.
          </p>
          <div className="coach-tags">
            {tags.map((tag) => (
              <button key={tag} className="coach-tag" type="button">{tag}</button>
            ))}
          </div>
          <form className="inline-form" onSubmit={addTag}>
            <input
              aria-label="New coach tag"
              onChange={(event) => setTagInput(event.target.value)}
              placeholder="Add coaching note tag..."
              value={tagInput}
            />
            <button type="submit">Add</button>
          </form>
        </article>

        <article className="session-card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">03</span>
              <h2>Last session</h2>
            </div>
          </div>
          <div className="meaningful-result">
            <span>{lastMeaningful.type}</span>
            <strong>{lastMeaningful.result}</strong>
            <p>{lastMeaningful.next}</p>
          </div>
          <div className="mini-list">
            <div>
              <span>Current development focus</span>
              <strong>Ball control under pressure</strong>
            </div>
            <div>
              <span>Active goal</span>
              <strong>Stay low and maintain control through contact</strong>
            </div>
          </div>
        </article>

        <article className="session-card plan-card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">04</span>
              <h2>Today&apos;s practice plan</h2>
            </div>
            <button className="text-button" type="button">Edit plan</button>
          </div>
          <ol className="practice-plan">
            {plan.map((item, index) => (
              <li key={item.title}>
                <span className="plan-number">{index + 1}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </article>

        <article className="session-card quick-log-card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">05</span>
              <h2>Quick Log</h2>
            </div>
            <span className="speed-chip">10–20 sec</span>
          </div>
          <p className="support-copy">
            Save only results that change how you evaluate, progress, or plan the athlete.
          </p>
          <form className="quick-log-form" onSubmit={addQuickLog}>
            <label>
              What happened?
              <select name="type" defaultValue="Shooting result">
                <option>Shooting result</option>
                <option>Dribbling result</option>
                <option>Drill progression</option>
                <option>Goal check</option>
                <option>Coach observation</option>
              </select>
            </label>

            <label>
              Result
              <textarea
                name="result"
                placeholder="Example: 8/10 from right slot, or passed timed combo at 19.8s"
                rows={3}
                required
              />
            </label>

            <label>
              What does this mean next?
              <select name="next" defaultValue="Keep progressing">
                <option>Goal met</option>
                <option>Keep progressing</option>
                <option>Revisit next session</option>
                <option>Change focus</option>
              </select>
            </label>

            <button className="primary-button" type="submit">Save Quick Log</button>
          </form>

          <div className="log-feed">
            {logs.slice(0, 3).map((log, index) => (
              <div className="log-item" key={`${log.result}-${index}`}>
                <span>{log.type}</span>
                <strong>{log.result}</strong>
                <p>{log.next}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
