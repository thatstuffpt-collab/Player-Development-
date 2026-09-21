"use client";

import { FormEvent, useMemo, useState } from "react";
import styles from "./session-workflow.module.css";

type SessionSection = {
  id: number;
  title: string;
  detail: string;
};

type QuickLog = {
  id: number;
  sectionId: number;
  section: string;
  type: string;
  drill: string;
  spot: string;
  result: string;
  note: string;
  next: string;
};

const starterPlan: SessionSection[] = [
  { id: 1, title: "Warm-up", detail: "Squats, lateral lunges, QKC's, toe touches, sprint/backpedals" },
  { id: 2, title: "Ball Handling", detail: "Pace + low stance, change of direction, pressure control" },
  { id: 3, title: "Shooting Touch", detail: "One-dribble pull-ups from five spots" },
  { id: 4, title: "Game-like Work", detail: "Live reads into pull-up or finish" },
];

export default function SessionWorkflowPreviewPage() {
  const [step, setStep] = useState<"before" | "during" | "wrap">("before");
  const [soreness, setSoreness] = useState("None");
  const [painArea, setPainArea] = useState("");
  const [discomfort, setDiscomfort] = useState(0);
  const [modifyPlan, setModifyPlan] = useState(false);
  const [plan, setPlan] = useState(starterPlan);
  const [newSection, setNewSection] = useState("");
  const [logs, setLogs] = useState<QuickLog[]>([
    {
      id: 1,
      sectionId: 3,
      section: "Shooting Touch",
      type: "Drill result",
      drill: "One-dribble pull-up",
      spot: "Right wing",
      result: "7/10",
      note: "Better balance. Still drifting on misses.",
      next: "Keep progressing",
    },
  ]);
  const [editingLog, setEditingLog] = useState<QuickLog | null>(null);
  const [takeaway, setTakeaway] = useState("Pull-up balance improved, especially from the wing and top.");
  const [needsWork, setNeedsWork] = useState("Clean up drift on right-side pull-ups and stay under control late in reps.");
  const [nextFocus, setNextFocus] = useState("Continue pull-up balance work and progress into more game-speed reads.");

  const readiness = useMemo(() => {
    if (discomfort >= 7 || soreness === "High") return "Red";
    if (discomfort >= 3 || soreness === "Moderate" || painArea.trim()) return "Yellow";
    return "Green";
  }, [discomfort, painArea, soreness]);

  function addSection(event: FormEvent) {
    event.preventDefault();
    const title = newSection.trim();
    if (!title) return;
    setPlan((current) => [...current, { id: Date.now(), title, detail: "Add drills or details for this section" }]);
    setNewSection("");
  }

  function addQuickLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const sectionId = Number(data.get("sectionId"));
    const section = plan.find((item) => item.id === sectionId)?.title ?? "Session";
    const type = String(data.get("type") ?? "Coach observation");
    const drill = String(data.get("drill") ?? "").trim();
    const spot = String(data.get("spot") ?? "").trim();
    const result = String(data.get("result") ?? "").trim();
    const note = String(data.get("note") ?? "").trim();
    const next = String(data.get("next") ?? "Keep progressing");

    if (!result && !note) return;

    setLogs((current) => [
      ...current,
      { id: Date.now(), sectionId, section, type, drill, spot, result, note, next },
    ]);
    form.reset();
  }

  function saveEditedLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingLog) return;
    const data = new FormData(event.currentTarget);
    const sectionId = Number(data.get("sectionId"));
    const section = plan.find((item) => item.id === sectionId)?.title ?? "Session";
    const updated: QuickLog = {
      ...editingLog,
      sectionId,
      section,
      type: String(data.get("type") ?? editingLog.type),
      drill: String(data.get("drill") ?? "").trim(),
      spot: String(data.get("spot") ?? "").trim(),
      result: String(data.get("result") ?? "").trim(),
      note: String(data.get("note") ?? "").trim(),
      next: String(data.get("next") ?? editingLog.next),
    };

    if (!updated.result && !updated.note) return;
    setLogs((current) => current.map((log) => (log.id === updated.id ? updated : log)));
    setEditingLog(null);
  }

  function suggestWrapUp() {
    const measurable = [...logs].reverse().find((log) => log.result);
    const observation = [...logs].reverse().find((log) => log.note);
    if (measurable) {
      setTakeaway(`${measurable.drill || measurable.section}${measurable.spot ? ` at ${measurable.spot}` : ""}: ${measurable.result}.`);
    }
    if (observation?.note) setNeedsWork(observation.note);
    const revisit = [...logs].reverse().find((log) => log.next === "Revisit next session" || log.next === "Change focus");
    if (revisit) {
      setNextFocus(`Revisit ${revisit.drill || revisit.section}${revisit.spot ? ` at ${revisit.spot}` : ""} next session.`);
    }
    setStep("wrap");
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>INTERACTIVE COACHING WORKFLOW PREVIEW</p>
          <h1>Jordan M.</h1>
          <p className={styles.meta}>Fake athlete data · 60-minute individual session</p>
        </div>
        <div className={`${styles.readiness} ${styles[readiness.toLowerCase()]}`}>{readiness} readiness</div>
      </header>

      <nav className={styles.steps} aria-label="Session workflow">
        <button className={step === "before" ? styles.active : ""} onClick={() => setStep("before")} type="button">1. Before session</button>
        <button className={step === "during" ? styles.active : ""} onClick={() => setStep("during")} type="button">2. During session</button>
        <button className={step === "wrap" ? styles.active : ""} onClick={() => setStep("wrap")} type="button">3. Wrap-up</button>
      </nav>

      {step === "before" && (
        <div className={styles.stack}>
          <section className={styles.overviewGrid}>
            <article className={styles.card}><span>Current focus</span><strong>Ball control + pull-up balance</strong></article>
            <article className={styles.card}><span>Last takeaway</span><strong>Better pace. Still drifting on right-side pull-ups.</strong></article>
            <article className={styles.card}><span>Active goals</span><strong>Improve game-speed control · Build consistent pull-up balance</strong></article>
            <article className={styles.card}><span>Recent result</span><strong>Right wing pull-up: 7/10</strong></article>
          </section>

          <section className={styles.panel}>
            <div className={styles.sectionHeading}>
              <div><span>PRE-SESSION</span><h2>Body check</h2></div>
              <small>How does the athlete feel today?</small>
            </div>
            <div className={styles.formGrid}>
              <label>Soreness
                <select value={soreness} onChange={(event) => setSoreness(event.target.value)}>
                  <option>None</option><option>Mild</option><option>Moderate</option><option>High</option>
                </select>
              </label>
              <label>Ache / pain area
                <input value={painArea} onChange={(event) => setPainArea(event.target.value)} placeholder="Example: right knee, shooting finger" />
              </label>
              <label className={styles.full}>Discomfort: {discomfort}/10
                <input type="range" min="0" max="10" value={discomfort} onChange={(event) => setDiscomfort(Number(event.target.value))} />
              </label>
            </div>
            <div className={styles.actionsRow}>
              <button className={!modifyPlan ? styles.selectedAction : ""} onClick={() => setModifyPlan(false)} type="button">Keep suggested plan</button>
              <button className={modifyPlan ? styles.selectedAction : ""} onClick={() => setModifyPlan(true)} type="button">Modify plan</button>
            </div>
            {modifyPlan && <p className={styles.callout}>Plan marked for adjustment because today&apos;s readiness may change what is appropriate.</p>}
          </section>

          <section className={styles.panel}>
            <div className={styles.sectionHeading}>
              <div><span>TODAY&apos;S PLAN</span><h2>Suggested workout</h2></div>
              <small>Built from the current development focus</small>
            </div>
            <div className={styles.planList}>
              {plan.map((section, index) => (
                <div className={styles.planItem} key={section.id}>
                  <b>{index + 1}</b>
                  <input value={section.title} onChange={(event) => setPlan((current) => current.map((item) => item.id === section.id ? { ...item, title: event.target.value } : item))} />
                  <input value={section.detail} onChange={(event) => setPlan((current) => current.map((item) => item.id === section.id ? { ...item, detail: event.target.value } : item))} />
                  <button onClick={() => setPlan((current) => current.filter((item) => item.id !== section.id))} type="button">Remove</button>
                </div>
              ))}
            </div>
            <form className={styles.addRow} onSubmit={addSection}>
              <input value={newSection} onChange={(event) => setNewSection(event.target.value)} placeholder="Add a section, e.g. Defense" />
              <button type="submit">Add section</button>
            </form>
            <button className={styles.primary} onClick={() => setStep("during")} type="button">Start session</button>
          </section>
        </div>
      )}

      {step === "during" && (
        <div className={styles.stack}>
          <section className={styles.panel}>
            <div className={styles.sectionHeading}>
              <div><span>LIVE SESSION</span><h2>Today&apos;s sections</h2></div>
              <small>Log during water breaks or come back later</small>
            </div>
            <div className={styles.sectionCards}>
              {plan.map((section) => (
                <article className={styles.sessionSection} key={section.id}>
                  <div><strong>{section.title}</strong><p>{section.detail}</p></div>
                  <span>{logs.filter((log) => log.sectionId === section.id).length} logs</span>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.sectionHeading}>
              <div><span>QUICK LOG</span><h2>Save what matters</h2></div>
              <small>Target: 10–20 seconds</small>
            </div>
            <form className={styles.quickForm} onSubmit={addQuickLog}>
              <label>Section
                <select name="sectionId" defaultValue={plan[0]?.id ?? 1}>{plan.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
              </label>
              <label>Log type
                <select name="type" defaultValue="Drill result"><option>Drill result</option><option>Coach observation</option><option>Goal progress</option><option>Body/readiness update</option></select>
              </label>
              <label>Drill
                <input name="drill" placeholder="One-dribble pull-up" />
              </label>
              <label>Spot / side
                <input name="spot" placeholder="Right corner, left hand..." />
              </label>
              <label>Result
                <input name="result" placeholder="5/10, 18.4 sec, 12 reps" />
              </label>
              <label>What does it mean next?
                <select name="next" defaultValue="Keep progressing"><option>Keep progressing</option><option>Revisit next session</option><option>Goal met</option><option>Change focus</option></select>
              </label>
              <label className={styles.full}>Coach note
                <textarea name="note" rows={3} placeholder="Better balance, rushed under pressure, stronger weak hand..." />
              </label>
              <div className={`${styles.full} ${styles.logButtons}`}>
                <button type="button">🎙 Voice-to-text</button>
                <button className={styles.primary} type="submit">Save Quick Log</button>
              </div>
            </form>
          </section>

          <section className={styles.panel}>
            <div className={styles.sectionHeading}><div><span>SESSION FEED</span><h2>What you&apos;ve logged</h2></div><small>Tap Edit to correct any entry</small></div>
            <div className={styles.feed}>
              {logs.map((log) => (
                <article key={log.id}>
                  {editingLog?.id === log.id ? (
                    <form className={styles.quickForm} onSubmit={saveEditedLog}>
                      <label>Section
                        <select name="sectionId" defaultValue={editingLog.sectionId}>{plan.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
                      </label>
                      <label>Log type
                        <select name="type" defaultValue={editingLog.type}><option>Drill result</option><option>Coach observation</option><option>Goal progress</option><option>Body/readiness update</option></select>
                      </label>
                      <label>Drill<input name="drill" defaultValue={editingLog.drill} /></label>
                      <label>Spot / side<input name="spot" defaultValue={editingLog.spot} /></label>
                      <label>Result<input name="result" defaultValue={editingLog.result} /></label>
                      <label>What does it mean next?
                        <select name="next" defaultValue={editingLog.next}><option>Keep progressing</option><option>Revisit next session</option><option>Goal met</option><option>Change focus</option></select>
                      </label>
                      <label className={styles.full}>Coach note<textarea name="note" rows={3} defaultValue={editingLog.note} /></label>
                      <div className={`${styles.full} ${styles.actionsRow}`}>
                        <button onClick={() => setEditingLog(null)} type="button">Cancel</button>
                        <button className={styles.primary} type="submit">Save changes</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div><span>{log.section} · {log.type}</span><strong>{log.drill || "General note"}{log.spot ? ` · ${log.spot}` : ""}</strong></div>
                      {log.result && <b>{log.result}</b>}
                      {log.note && <p>{log.note}</p>}
                      <small>{log.next}</small>
                      <div className={styles.actionsRow}>
                        <button onClick={() => setEditingLog({ ...log })} type="button">Edit Quick Log</button>
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
            <button className={styles.primary} onClick={suggestWrapUp} type="button">Finish session & suggest wrap-up</button>
          </section>
        </div>
      )}

      {step === "wrap" && (
        <section className={styles.panel}>
          <div className={styles.sectionHeading}>
            <div><span>SESSION WRAP-UP</span><h2>Review the suggested carryover</h2></div>
            <small>Approve or edit before saving</small>
          </div>
          <div className={styles.wrapGrid}>
            <label>Main takeaway<textarea value={takeaway} onChange={(event) => setTakeaway(event.target.value)} rows={3} /></label>
            <label>Needs more work<textarea value={needsWork} onChange={(event) => setNeedsWork(event.target.value)} rows={3} /></label>
            <label>Next-session focus<textarea value={nextFocus} onChange={(event) => setNextFocus(event.target.value)} rows={3} /></label>
          </div>
          <div className={styles.summaryBox}>
            <span>Next time this athlete opens</span>
            <strong>{nextFocus}</strong>
            <p>The approved focus would help generate the next suggested workout, while the body check can still override or modify it.</p>
          </div>
          <div className={styles.actionsRow}>
            <button onClick={() => setStep("during")} type="button">Back to session</button>
            <button className={styles.primary} type="button">Approve wrap-up</button>
          </div>
        </section>
      )}
    </main>
  );
}
