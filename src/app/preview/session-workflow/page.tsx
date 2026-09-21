"use client";

import { FormEvent, useMemo, useState } from "react";
import styles from "./session-workflow.module.css";

type DrillCategory = "Warm-up" | "Ball Handling" | "Shooting" | "Finishing" | "Defense" | "Passing" | "Footwork" | "Conditioning" | "Other";

type SessionDrill = { id: number; name: string; category: DrillCategory };
type SessionSection = { id: number; title: string; detail: string; drills: SessionDrill[] };
type QuickLog = {
  id: number;
  sectionId: number;
  section: string;
  type: string;
  drill: string;
  drillCategory: DrillCategory;
  spot: string;
  result: string;
  note: string;
  next: string;
};

const categories: DrillCategory[] = ["Warm-up", "Ball Handling", "Shooting", "Finishing", "Defense", "Passing", "Footwork", "Conditioning", "Other"];
const shootingSpots = ["Right Corner", "Right Wing", "Top", "Left Wing", "Left Corner", "Right Short Corner", "Left Short Corner", "Right Elbow", "Left Elbow", "Paint / Rim", "Custom"];

const starterPlan: SessionSection[] = [
  {
    id: 1,
    title: "Warm-up",
    detail: "Movement prep",
    drills: [
      { id: 101, name: "Squats + lateral lunges", category: "Warm-up" },
      { id: 102, name: "QKC's + toe touches", category: "Warm-up" },
    ],
  },
  {
    id: 2,
    title: "Ball Handling",
    detail: "Pace + low stance",
    drills: [
      { id: 201, name: "Pound dribble series", category: "Ball Handling" },
      { id: 202, name: "Between-cross series", category: "Ball Handling" },
      { id: 203, name: "PG combo", category: "Ball Handling" },
    ],
  },
  {
    id: 3,
    title: "Shooting",
    detail: "Touch + pull-up balance",
    drills: [
      { id: 301, name: "One-dribble pull-up", category: "Shooting" },
      { id: 302, name: "Catch-and-shoot", category: "Shooting" },
    ],
  },
  {
    id: 4,
    title: "Game-like Work",
    detail: "Live reads",
    drills: [
      { id: 401, name: "Pull-up or finish read", category: "Other" },
    ],
  },
];

export default function SessionWorkflowPreviewPage() {
  const [step, setStep] = useState<"before" | "during" | "wrap">("before");
  const [soreness, setSoreness] = useState("None");
  const [painArea, setPainArea] = useState("");
  const [discomfort, setDiscomfort] = useState(0);
  const [modifyPlan, setModifyPlan] = useState(false);
  const [plan, setPlan] = useState(starterPlan);
  const [newSection, setNewSection] = useState("");
  const [newDrills, setNewDrills] = useState<Record<number, string>>({});
  const [selectedSectionId, setSelectedSectionId] = useState(2);
  const [selectedDrillId, setSelectedDrillId] = useState<string>("201");
  const [customDrill, setCustomDrill] = useState("");
  const [selectedSpot, setSelectedSpot] = useState("");
  const [customSpot, setCustomSpot] = useState("");
  const [logs, setLogs] = useState<QuickLog[]>([
    {
      id: 1,
      sectionId: 3,
      section: "Shooting",
      type: "Drill result",
      drill: "One-dribble pull-up",
      drillCategory: "Shooting",
      spot: "Right Wing",
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

  const selectedSection = plan.find((section) => section.id === selectedSectionId) ?? plan[0];
  const selectedDrill = selectedSection?.drills.find((drill) => String(drill.id) === selectedDrillId);
  const quickLogCategory: DrillCategory = selectedDrill?.category ?? "Other";

  function addSection(event: FormEvent) {
    event.preventDefault();
    const title = newSection.trim();
    if (!title) return;
    setPlan((current) => [...current, { id: Date.now(), title, detail: "Section focus", drills: [] }]);
    setNewSection("");
  }

  function addDrill(sectionId: number) {
    const name = (newDrills[sectionId] ?? "").trim();
    if (!name) return;
    setPlan((current) => current.map((section) => section.id === sectionId
      ? { ...section, drills: [...section.drills, { id: Date.now(), name, category: section.title.toLowerCase().includes("shoot") ? "Shooting" : "Other" }] }
      : section));
    setNewDrills((current) => ({ ...current, [sectionId]: "" }));
  }

  function handleSectionChange(value: number) {
    setSelectedSectionId(value);
    const firstDrill = plan.find((section) => section.id === value)?.drills[0];
    setSelectedDrillId(firstDrill ? String(firstDrill.id) : "custom");
    setCustomDrill("");
    setSelectedSpot("");
    setCustomSpot("");
  }

  function addQuickLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const section = plan.find((item) => item.id === selectedSectionId);
    const planDrill = section?.drills.find((drill) => String(drill.id) === selectedDrillId);
    const drill = selectedDrillId === "custom" ? customDrill.trim() : (planDrill?.name ?? "");
    const drillCategory: DrillCategory = planDrill?.category ?? "Other";
    const spot = drillCategory === "Shooting"
      ? (selectedSpot === "Custom" ? customSpot.trim() : selectedSpot)
      : String(data.get("spot") ?? "").trim();
    const result = String(data.get("result") ?? "").trim();
    const note = String(data.get("note") ?? "").trim();
    if (!result && !note) return;

    if (selectedDrillId === "custom" && drill && section) {
      const newDrill: SessionDrill = { id: Date.now(), name: drill, category: "Other" };
      setPlan((current) => current.map((item) => item.id === section.id ? { ...item, drills: [...item.drills, newDrill] } : item));
      setSelectedDrillId(String(newDrill.id));
      setCustomDrill("");
    }

    setLogs((current) => [...current, {
      id: Date.now() + 1,
      sectionId: selectedSectionId,
      section: section?.title ?? "Session",
      type: String(data.get("type") ?? "Drill result"),
      drill,
      drillCategory,
      spot,
      result,
      note,
      next: String(data.get("next") ?? "Keep progressing"),
    }]);
    event.currentTarget.reset();
    setSelectedSpot("");
    setCustomSpot("");
  }

  function saveEditedLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingLog) return;
    const data = new FormData(event.currentTarget);
    const sectionId = Number(data.get("sectionId"));
    const section = plan.find((item) => item.id === sectionId);
    const drill = String(data.get("drill") ?? "").trim();
    const matchedDrill = section?.drills.find((item) => item.name === drill);
    const updated: QuickLog = {
      ...editingLog,
      sectionId,
      section: section?.title ?? "Session",
      type: String(data.get("type") ?? editingLog.type),
      drill,
      drillCategory: matchedDrill?.category ?? editingLog.drillCategory,
      spot: String(data.get("spot") ?? "").trim(),
      result: String(data.get("result") ?? "").trim(),
      note: String(data.get("note") ?? "").trim(),
      next: String(data.get("next") ?? editingLog.next),
    };
    if (!updated.result && !updated.note) return;
    setLogs((current) => current.map((log) => log.id === updated.id ? updated : log));
    setEditingLog(null);
  }

  function suggestWrapUp() {
    const measurable = [...logs].reverse().find((log) => log.result);
    const observation = [...logs].reverse().find((log) => log.note);
    if (measurable) setTakeaway(`${measurable.drill || measurable.section}${measurable.spot ? ` at ${measurable.spot}` : ""}: ${measurable.result}.`);
    if (observation?.note) setNeedsWork(observation.note);
    const revisit = [...logs].reverse().find((log) => log.next === "Revisit next session" || log.next === "Change focus");
    if (revisit) setNextFocus(`Revisit ${revisit.drill || revisit.section}${revisit.spot ? ` at ${revisit.spot}` : ""} next session.`);
    setStep("wrap");
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div><p className={styles.eyebrow}>INTERACTIVE COACHING WORKFLOW PREVIEW</p><h1>Jordan M.</h1><p className={styles.meta}>Fake athlete data · 60-minute individual session</p></div>
        <div className={`${styles.readiness} ${styles[readiness.toLowerCase()]}`}>{readiness} readiness</div>
      </header>

      <nav className={styles.steps} aria-label="Session workflow">
        <button className={step === "before" ? styles.active : ""} onClick={() => setStep("before")} type="button">1. Before session</button>
        <button className={step === "during" ? styles.active : ""} onClick={() => setStep("during")} type="button">2. During session</button>
        <button className={step === "wrap" ? styles.active : ""} onClick={() => setStep("wrap")} type="button">3. Wrap-up</button>
      </nav>

      {step === "before" && <div className={styles.stack}>
        <section className={styles.overviewGrid}>
          <article className={styles.card}><span>Current focus</span><strong>Ball control + pull-up balance</strong></article>
          <article className={styles.card}><span>Last takeaway</span><strong>Better pace. Still drifting on right-side pull-ups.</strong></article>
          <article className={styles.card}><span>Active goals</span><strong>Improve game-speed control · Build consistent pull-up balance</strong></article>
          <article className={styles.card}><span>Recent result</span><strong>Right wing pull-up: 7/10</strong></article>
        </section>

        <section className={styles.panel}>
          <div className={styles.sectionHeading}><div><span>PRE-SESSION</span><h2>Body check</h2></div><small>How does the athlete feel today?</small></div>
          <div className={styles.formGrid}>
            <label>Soreness<select value={soreness} onChange={(event) => setSoreness(event.target.value)}><option>None</option><option>Mild</option><option>Moderate</option><option>High</option></select></label>
            <label>Ache / pain area<input value={painArea} onChange={(event) => setPainArea(event.target.value)} placeholder="Example: right knee, shooting finger" /></label>
            <label className={styles.full}>Discomfort: {discomfort}/10<input type="range" min="0" max="10" value={discomfort} onChange={(event) => setDiscomfort(Number(event.target.value))} /></label>
          </div>
          <div className={styles.actionsRow}><button className={!modifyPlan ? styles.selectedAction : ""} onClick={() => setModifyPlan(false)} type="button">Keep suggested plan</button><button className={modifyPlan ? styles.selectedAction : ""} onClick={() => setModifyPlan(true)} type="button">Modify plan</button></div>
          {modifyPlan && <p className={styles.callout}>Plan marked for adjustment because today&apos;s readiness may change what is appropriate.</p>}
        </section>

        <section className={styles.panel}>
          <div className={styles.sectionHeading}><div><span>TODAY&apos;S PLAN</span><h2>Sections + drills</h2></div><small>Quick Log will pull directly from this plan</small></div>
          <div className={styles.planList}>
            {plan.map((section, index) => <article className={styles.planSection} key={section.id}>
              <div className={styles.planSectionHeader}>
                <b>{index + 1}</b>
                <input value={section.title} onChange={(event) => setPlan((current) => current.map((item) => item.id === section.id ? { ...item, title: event.target.value } : item))} />
                <input value={section.detail} onChange={(event) => setPlan((current) => current.map((item) => item.id === section.id ? { ...item, detail: event.target.value } : item))} />
                <button onClick={() => setPlan((current) => current.filter((item) => item.id !== section.id))} type="button">Remove section</button>
              </div>
              <div className={styles.drillList}>
                {section.drills.map((drill) => <div className={styles.drillRow} key={drill.id}>
                  <span>Drill</span>
                  <input value={drill.name} onChange={(event) => setPlan((current) => current.map((item) => item.id === section.id ? { ...item, drills: item.drills.map((entry) => entry.id === drill.id ? { ...entry, name: event.target.value } : entry) } : item))} />
                  <select value={drill.category} onChange={(event) => setPlan((current) => current.map((item) => item.id === section.id ? { ...item, drills: item.drills.map((entry) => entry.id === drill.id ? { ...entry, category: event.target.value as DrillCategory } : entry) } : item))}>{categories.map((category) => <option key={category}>{category}</option>)}</select>
                  <button onClick={() => setPlan((current) => current.map((item) => item.id === section.id ? { ...item, drills: item.drills.filter((entry) => entry.id !== drill.id) } : item))} type="button">Remove</button>
                </div>)}
              </div>
              <div className={styles.addDrillRow}><input value={newDrills[section.id] ?? ""} onChange={(event) => setNewDrills((current) => ({ ...current, [section.id]: event.target.value }))} placeholder={`Add drill under ${section.title}`} /><button onClick={() => addDrill(section.id)} type="button">Add drill</button></div>
            </article>)}
          </div>
          <form className={styles.addRow} onSubmit={addSection}><input value={newSection} onChange={(event) => setNewSection(event.target.value)} placeholder="Add a section, e.g. Defense" /><button type="submit">Add section</button></form>
          <button className={styles.primary} onClick={() => setStep("during")} type="button">Start session</button>
        </section>
      </div>}

      {step === "during" && <div className={styles.stack}>
        <section className={styles.panel}>
          <div className={styles.sectionHeading}><div><span>LIVE SESSION</span><h2>Today&apos;s sections</h2></div><small>Plan drills are ready inside Quick Log</small></div>
          <div className={styles.sectionCards}>{plan.map((section) => <article className={styles.sessionSection} key={section.id}><div><strong>{section.title}</strong><p>{section.drills.map((drill) => drill.name).join(" · ") || "No drills added"}</p></div><span>{logs.filter((log) => log.sectionId === section.id).length} logs</span></article>)}</div>
        </section>

        <section className={styles.panel}>
          <div className={styles.sectionHeading}><div><span>QUICK LOG</span><h2>Save what matters</h2></div><small>Section → drill → relevant spot</small></div>
          <form className={styles.quickForm} onSubmit={addQuickLog}>
            <label>Section<select value={selectedSectionId} onChange={(event) => handleSectionChange(Number(event.target.value))}>{plan.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
            <label>Drill<select value={selectedDrillId} onChange={(event) => { setSelectedDrillId(event.target.value); setSelectedSpot(""); setCustomSpot(""); }}>{selectedSection?.drills.map((drill) => <option key={drill.id} value={drill.id}>{drill.name}</option>)}<option value="custom">Other / add drill...</option></select></label>
            {selectedDrillId === "custom" && <label>New drill<input value={customDrill} onChange={(event) => setCustomDrill(event.target.value)} placeholder="Type the drill once" /></label>}
            <label>Log type<select name="type" defaultValue="Drill result"><option>Drill result</option><option>Coach observation</option><option>Goal progress</option><option>Body/readiness update</option></select></label>
            {quickLogCategory === "Shooting" ? <label>Court spot<select value={selectedSpot} onChange={(event) => setSelectedSpot(event.target.value)}><option value="">Choose spot</option>{shootingSpots.map((spot) => <option key={spot}>{spot}</option>)}</select></label> : <label>Side / context (optional)<input name="spot" placeholder="Right hand, left side..." /></label>}
            {quickLogCategory === "Shooting" && selectedSpot === "Custom" && <label>Custom spot<input value={customSpot} onChange={(event) => setCustomSpot(event.target.value)} placeholder="Name the spot" /></label>}
            <label>Result<input name="result" placeholder="5/10, 18.4 sec, 12 reps" /></label>
            <label>What does it mean next?<select name="next" defaultValue="Keep progressing"><option>Keep progressing</option><option>Revisit next session</option><option>Goal met</option><option>Change focus</option></select></label>
            <label className={styles.full}>Coach note<textarea name="note" rows={3} placeholder="Better balance, rushed under pressure, stronger weak hand..." /></label>
            <div className={`${styles.full} ${styles.logButtons}`}><button type="button">🎙 Voice-to-text</button><button className={styles.primary} type="submit">Save Quick Log</button></div>
          </form>
        </section>

        <section className={styles.panel}>
          <div className={styles.sectionHeading}><div><span>SESSION FEED</span><h2>What you&apos;ve logged</h2></div><small>Tap Edit to correct any entry</small></div>
          <div className={styles.feed}>{logs.map((log) => <article key={log.id}>{editingLog?.id === log.id ? <form className={styles.quickForm} onSubmit={saveEditedLog}>
            <label>Section<select name="sectionId" value={editingLog.sectionId} onChange={(event) => { const sectionId = Number(event.target.value); const section = plan.find((item) => item.id === sectionId); setEditingLog({ ...editingLog, sectionId, section: section?.title ?? "Session", drill: section?.drills[0]?.name ?? "", drillCategory: section?.drills[0]?.category ?? "Other", spot: "" }); }}>{plan.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
            <label>Drill<select name="drill" value={editingLog.drill} onChange={(event) => { const section = plan.find((item) => item.id === editingLog.sectionId); const drill = section?.drills.find((item) => item.name === event.target.value); setEditingLog({ ...editingLog, drill: event.target.value, drillCategory: drill?.category ?? "Other", spot: "" }); }}>{(plan.find((item) => item.id === editingLog.sectionId)?.drills ?? []).map((drill) => <option key={drill.id} value={drill.name}>{drill.name}</option>)}</select></label>
            <label>Log type<select name="type" defaultValue={editingLog.type}><option>Drill result</option><option>Coach observation</option><option>Goal progress</option><option>Body/readiness update</option></select></label>
            {editingLog.drillCategory === "Shooting" ? <label>Court spot<select name="spot" value={editingLog.spot} onChange={(event) => setEditingLog({ ...editingLog, spot: event.target.value })}><option value="">Choose spot</option>{shootingSpots.filter((spot) => spot !== "Custom").map((spot) => <option key={spot}>{spot}</option>)}</select></label> : <label>Side / context<input name="spot" defaultValue={editingLog.spot} /></label>}
            <label>Result<input name="result" defaultValue={editingLog.result} /></label>
            <label>What does it mean next?<select name="next" defaultValue={editingLog.next}><option>Keep progressing</option><option>Revisit next session</option><option>Goal met</option><option>Change focus</option></select></label>
            <label className={styles.full}>Coach note<textarea name="note" rows={3} defaultValue={editingLog.note} /></label>
            <div className={`${styles.full} ${styles.actionsRow}`}><button onClick={() => setEditingLog(null)} type="button">Cancel</button><button className={styles.primary} type="submit">Save changes</button></div>
          </form> : <><div><span>{log.section} · {log.type}</span><strong>{log.drill || "General note"}{log.spot ? ` · ${log.spot}` : ""}</strong></div>{log.result && <b>{log.result}</b>}{log.note && <p>{log.note}</p>}<small>{log.next}</small><div className={styles.actionsRow}><button onClick={() => setEditingLog({ ...log })} type="button">Edit Quick Log</button></div></>}</article>)}</div>
          <button className={styles.primary} onClick={suggestWrapUp} type="button">Finish session & suggest wrap-up</button>
        </section>
      </div>}

      {step === "wrap" && <section className={styles.panel}>
        <div className={styles.sectionHeading}><div><span>SESSION WRAP-UP</span><h2>Review the suggested carryover</h2></div><small>Approve or edit before saving</small></div>
        <div className={styles.wrapGrid}><label>Main takeaway<textarea value={takeaway} onChange={(event) => setTakeaway(event.target.value)} rows={3} /></label><label>Needs more work<textarea value={needsWork} onChange={(event) => setNeedsWork(event.target.value)} rows={3} /></label><label>Next-session focus<textarea value={nextFocus} onChange={(event) => setNextFocus(event.target.value)} rows={3} /></label></div>
        <div className={styles.summaryBox}><span>Next time this athlete opens</span><strong>{nextFocus}</strong><p>The approved focus would help generate the next suggested workout, while the body check can still override or modify it.</p></div>
        <div className={styles.actionsRow}><button onClick={() => setStep("during")} type="button">Back to session</button><button className={styles.primary} type="button">Approve wrap-up</button></div>
      </section>}
    </main>
  );
}
