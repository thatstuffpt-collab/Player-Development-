"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import { drillLibrary } from "@/domain/drills/master-drill-library";
import styles from "./session.module.css";

type PlanDrill = { id?: string; title: string; notes: string; focusArea?: string | null; canonicalDrillName?: string; measurementType?: string };
type PlanSection = { id: number; title: string; notes: string; focusArea?: string | null; drills: PlanDrill[] };
type QuickLog = {
  id: string;
  practicePlanItemId: string | null;
  type: string;
  category: string;
  title: string;
  result: string;
  spot: string | null;
  notes: string | null;
  nextStep: string | null;
};
type SessionRecord = {
  id: string;
  scheduledFor: string;
  summary: string | null;
  needsMoreWork: string | null;
  nextSessionFocus: string | null;
  completedAt: string | null;
  practicePlan: Array<{
    id: string;
    parentItemId: string | null;
    itemType: "SECTION" | "DRILL";
    title: string;
    notes: string | null;
    focusArea: string | null;
    sortOrder: number;
  }>;
  progressEvents: QuickLog[];
};
type WorkspacePlayer = {
  id: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  goals: Array<{ id: string; title: string; type: string }>;
  developmentFocuses: Array<{ id: string; focus: string; reason: string | null }>;
  progressEvents: QuickLog[];
  trainingSessions: SessionRecord[];
};

const shootingSpots = [
  "Right Corner", "Right Wing", "Top", "Left Wing", "Left Corner",
  "Right Short Corner", "Left Short Corner", "Right Elbow", "Left Elbow", "Paint / Rim", "Custom",
];

const athleticPlan: PlanSection[] = [
  { id: 101, title: "Movement Prep", notes: "Warm up hips, knees, ankles and movement patterns", drills: [{ title: "QKC + dynamic movement prep", notes: "" }] },
  { id: 102, title: "Speed & Agility", notes: "Acceleration, deceleration, change of direction", drills: [{ title: "Acceleration / change-of-direction work", notes: "" }] },
  { id: 103, title: "Vertical & Power", notes: "Jump mechanics and explosive output", drills: [{ title: "Jump / power progression", notes: "" }] },
  { id: 104, title: "Strength", notes: "Strength movement for today's goal", drills: [{ title: "Strength progression", notes: "" }] },
  { id: 105, title: "Conditioning", notes: "Game-ready work capacity", focusArea: "CONDITIONING", drills: [{ title: "Conditioning progression", notes: "", focusArea: "CONDITIONING" }] },
];

const starterPlan: PlanSection[] = [
  { id: 1, title: "Warm-up", notes: "Prep the body and basketball movement", drills: [{ title: "QKC + movement prep", notes: "" }] },
  { id: 2, title: "Ball Handling", notes: "Pace, stance, control", drills: [{ title: "Pound dribble series", notes: "" }, { title: "Change of direction series", notes: "" }] },
  { id: 3, title: "Shooting", notes: "Touch and balance", focusArea: "SHOOTING", drills: [{ title: "One-dribble pull-up", notes: "", focusArea: "SHOOTING" }] },
  { id: 4, title: "Game-like Work", notes: "Finish with reads at game speed", drills: [{ title: "Live read progression", notes: "" }] },
];

function nextLabel(value: string | null) {
  return value ? value.replaceAll("_", " ").toLowerCase().replace(/^./, (c) => c.toUpperCase()) : "";
}

function logTypeLabel(value: string) {
  const map: Record<string, string> = {
    SHOOTING_RESULT: "Shooting result",
    DRIBBLING_RESULT: "Dribbling result",
    DRILL_PROGRESSION: "Drill result",
    GOAL_CHECK: "Goal progress",
    COACH_OBSERVATION: "Coach observation",
    BODY_READINESS: "Body/readiness update",
    OTHER: "Drill result",
  };
  return map[value] ?? "Drill result";
}

async function fetchWorkspace(playerId: string): Promise<WorkspacePlayer> {
  const response = await authenticatedFetch(`/api/trainer/players/${playerId}/sessions`);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "Could not load session workspace.");
  return payload.player;
}

export default function RealPlayerSessionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [player, setPlayer] = useState<WorkspacePlayer | null>(null);
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [step, setStep] = useState<"before" | "during" | "wrap">("before");
  const [plan, setPlan] = useState<PlanSection[]>(starterPlan);
  const [sessionType, setSessionType] = useState("Basketball Skills");
  const [soreness, setSoreness] = useState("None");
  const [bodyArea, setBodyArea] = useState("");
  const [discomfort, setDiscomfort] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState<number>(starterPlan[0].id);
  const [selectedDrillId, setSelectedDrillId] = useState("");
  const [customDrill, setCustomDrill] = useState("");
  const [logType, setLogType] = useState("Drill result");
  const [selectedGoal, setSelectedGoal] = useState("");
  const [makes, setMakes] = useState("");
  const [attempts, setAttempts] = useState("");
  const [listening, setListening] = useState(false);
  const [spot, setSpot] = useState("");
  const [result, setResult] = useState("");
  const [note, setNote] = useState("");
  const [next, setNext] = useState("Keep progressing");
  const [editingLog, setEditingLog] = useState<QuickLog | null>(null);
  const [takeaway, setTakeaway] = useState("");
  const [needsWork, setNeedsWork] = useState("");
  const [nextFocus, setNextFocus] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pickerSectionId, setPickerSectionId] = useState<number | null>(null);
  const [drillSearch, setDrillSearch] = useState("");
  const [improvisedDrill, setImprovisedDrill] = useState("");
  const drillMatches = useMemo(() => { const q=drillSearch.trim().toLowerCase(); if(!q) return drillLibrary.slice(0,12); return drillLibrary.filter(d=>d.name.toLowerCase().includes(q)||d.primaryCategory.toLowerCase().includes(q)||d.tags.some(t=>t.toLowerCase().includes(q))).slice(0,12); }, [drillSearch]);

  useEffect(() => {
    let cancelled = false;

    void fetchWorkspace(params.id)
      .then((nextPlayer) => {
        if (!cancelled) setPlayer(nextPlayer);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load session workspace.");
      });

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const readiness = useMemo(() => {
    if (discomfort >= 7 || soreness === "High") return "Red";
    if (discomfort >= 3 || soreness === "Moderate" || bodyArea.trim()) return "Yellow";
    return "Green";
  }, [bodyArea, discomfort, soreness]);

  const activeSection = plan.find((item) => item.id === selectedSectionId) ?? plan[0];
  const sessionPlan = session?.practicePlan ?? [];
  const sessionSections = sessionPlan.filter((item) => item.itemType === "SECTION");
  const selectedSavedSection = sessionSections.find((item) => item.title === activeSection?.title) ?? sessionSections[0];
  const savedDrills = sessionPlan.filter((item) => item.itemType === "DRILL" && item.parentItemId === selectedSavedSection?.id);
  const selectedSavedDrill = savedDrills.find((item) => item.id === selectedDrillId);

  function chooseSessionType(value: string) {
    setSessionType(value);
    if (value === "Athletic Performance") setPlan(athleticPlan);
    else if (value === "Combined") setPlan([...starterPlan, ...athleticPlan.map((section, index) => ({ ...section, id: 200 + index }))]);
    else setPlan(starterPlan);
    setSelectedSectionId(value === "Athletic Performance" ? athleticPlan[0].id : starterPlan[0].id);
  }

  function addSection() {
    const id = Date.now();
    setPlan((current) => [...current, { id, title: "New Section", notes: "", drills: [] }]);
  }

  function openDrillPicker(sectionId: number) {
    setPickerSectionId(sectionId); setDrillSearch(""); setImprovisedDrill("");
  }
  function addLibraryDrill(sectionId: number, name: string, measurementType?: string) {
    setPlan(current=>current.map(section=>section.id===sectionId?{...section,drills:[...section.drills,{title:name,notes:"",focusArea:section.focusArea,canonicalDrillName:name,measurementType}]}:section));
    setPickerSectionId(null); setDrillSearch("");
  }
  function addImprovisedDrill(sectionId: number) {
    const name=improvisedDrill.trim(); if(!name)return;
    setPlan(current=>current.map(section=>section.id===sectionId?{...section,drills:[...section.drills,{title:name,notes:"",focusArea:section.focusArea}]}:section));
    setPickerSectionId(null); setImprovisedDrill("");
  }

  async function startSession() {
    setBusy(true);
    setError("");
    try {
      const currentFocus = player?.developmentFocuses[0]?.focus ?? "Player development";
      const response = await authenticatedFetch(`/api/trainer/players/${params.id}/sessions`, {
        method: "POST",
        body: JSON.stringify({
          primaryFocus: "OTHER",
          customFocus: currentFocus,
          sorenessLevel: soreness,
          bodyArea,
          discomfortLevel: discomfort,
          planAdjustmentReason: adjustmentReason,
          sections: plan,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not start session.");
      setSession({ ...payload.session, progressEvents: [] });
      const firstSection = payload.session.practicePlan.find((item: SessionRecord["practicePlan"][number]) => item.itemType === "SECTION");
      const firstDrill = payload.session.practicePlan.find((item: SessionRecord["practicePlan"][number]) => item.itemType === "DRILL" && item.parentItemId === firstSection?.id);
      if (firstDrill) setSelectedDrillId(firstDrill.id);
      setStep("during");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start session.");
    } finally {
      setBusy(false);
    }
  }

  function chooseSavedSection(sectionId: string) {
    const saved = sessionSections.find((item) => item.id === sectionId);
    if (!saved) return;
    const matchingPlan = plan.find((item) => item.title === saved.title);
    if (matchingPlan) setSelectedSectionId(matchingPlan.id);
    const firstDrill = sessionPlan.find((item) => item.itemType === "DRILL" && item.parentItemId === saved.id);
    setSelectedDrillId(firstDrill?.id ?? "other");
    setSpot("");
  }

  function startVoiceToText() {
    const speechWindow = window as Window & { webkitSpeechRecognition?: new () => { continuous: boolean; interimResults: boolean; lang: string; start: () => void; onresult: (event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void; onerror: () => void; onend: () => void } };
    const Recognition = speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setError("Voice-to-text is not supported in this browser. You can still use your phone keyboard microphone.");
      return;
    }
    setError("");
    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      if (transcript) setNote((current) => current ? `${current} ${transcript}` : transcript);
    };
    recognition.onerror = () => { setError("Voice-to-text could not hear you. Try again or use your keyboard microphone."); setListening(false); };
    recognition.onend = () => setListening(false);
    setListening(true);
    recognition.start();
  }

  async function saveLog(event: FormEvent) {
    event.preventDefault();
    if (!session) return;
    setBusy(true);
    setError("");
    try {
      const drillTitle = selectedDrillId === "other" ? customDrill.trim() : selectedSavedDrill?.title ?? "Session note";
      const logTitle = logType === "Goal progress" ? (selectedGoal || "Session goal") : drillTitle;
      const logResult = logType === "Shooting result" && makes && attempts ? `${makes}/${attempts}` : result;
      const response = await authenticatedFetch(`/api/trainer/sessions/${session.id}/logs`, {
        method: "POST",
        body: JSON.stringify({
          practicePlanItemId: selectedDrillId === "other" ? null : selectedDrillId,
          type: logType,
          category: selectedSavedSection?.title ?? "Session",
          title: logTitle,
          spot: logType === "Shooting result" ? spot : "",
          result: logResult,
          notes: note,
          next,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not save Quick Log.");
      setSession((current) => current ? { ...current, progressEvents: [...current.progressEvents, payload.event] } : current);
      setResult(""); setNote(""); setSpot(""); setCustomDrill(""); setMakes(""); setAttempts("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save Quick Log.");
    } finally {
      setBusy(false);
    }
  }

  async function saveEditedLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !editingLog) return;
    const data = new FormData(event.currentTarget);
    setBusy(true);
    try {
      const response = await authenticatedFetch(`/api/trainer/sessions/${session.id}/logs/${editingLog.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          practicePlanItemId: editingLog.practicePlanItemId,
          type: String(data.get("type") ?? "Drill result"),
          category: editingLog.category,
          title: String(data.get("title") ?? editingLog.title),
          spot: String(data.get("spot") ?? ""),
          result: String(data.get("result") ?? ""),
          notes: String(data.get("notes") ?? ""),
          next: String(data.get("next") ?? "Keep progressing"),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not edit Quick Log.");
      setSession((current) => current ? { ...current, progressEvents: current.progressEvents.map((item) => item.id === payload.event.id ? payload.event : item) } : current);
      setEditingLog(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not edit Quick Log.");
    } finally {
      setBusy(false);
    }
  }

  function openWrapUp() {
    const logs = session?.progressEvents ?? [];
    const measurable = [...logs].reverse().find((item) => item.result);
    const observation = [...logs].reverse().find((item) => item.notes);
    setTakeaway(measurable ? `${measurable.title}${measurable.spot ? ` at ${measurable.spot}` : ""}: ${measurable.result}` : "");
    setNeedsWork(observation?.notes ?? "");
    const revisit = [...logs].reverse().find((item) => item.nextStep === "REVISIT_NEXT_SESSION" || item.nextStep === "CHANGE_FOCUS");
    setNextFocus(revisit ? `Revisit ${revisit.title}${revisit.spot ? ` at ${revisit.spot}` : ""} next session.` : player?.developmentFocuses[0]?.focus ?? "");
    setStep("wrap");
  }

  async function completeSession() {
    if (!session) return;
    setBusy(true);
    setError("");
    try {
      const response = await authenticatedFetch(`/api/trainer/sessions/${session.id}`, {
        method: "PATCH",
        body: JSON.stringify({ summary: takeaway, needsMoreWork: needsWork, nextSessionFocus: nextFocus, complete: true }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not complete session.");
      setSession(payload.session);
      const refreshedPlayer = await fetchWorkspace(params.id);
      setPlayer(refreshedPlayer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete session.");
    } finally {
      setBusy(false);
    }
  }

  if (!player) return <main className={styles.shell}><p>{error || "Loading session workspace…"}</p></main>;

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div>
          <Link href={`/trainer/players/${player.id}`} className={styles.back}>← Player profile</Link>
          <p className={styles.eyebrow}>REAL TRAINER SESSION</p>
          <h1>{player.preferredName || player.firstName} {player.lastName}</h1>
          <p className={styles.meta}>Saved to this athlete&apos;s development history</p>
        </div>
        <div className={`${styles.readiness} ${styles[readiness.toLowerCase()]}`}>{readiness} readiness</div>
      </header>

      <nav className={styles.steps}>
        <button className={step === "before" ? styles.active : ""} onClick={() => setStep("before")}>1. Before session</button>
        <button disabled={!session} className={step === "during" ? styles.active : ""} onClick={() => session && setStep("during")}>2. During session</button>
        <button disabled={!session} className={step === "wrap" ? styles.active : ""} onClick={() => session && openWrapUp()}>3. Wrap-up</button>
      </nav>

      {error && <p className={styles.error}>{error}</p>}

      {step === "before" && (
        <div className={styles.stack}>
          <section className={styles.overviewGrid}>
            <article className={styles.card}><span>Current focus</span><strong>{player.developmentFocuses[0]?.focus ?? "Not set"}</strong></article>
            <article className={styles.card}><span>Active goals</span><strong>{player.goals.map((goal) => goal.title).join(" · ") || "No active goals"}</strong></article>
            <article className={styles.card}><span>Recent result</span><strong>{player.progressEvents[0] ? `${player.progressEvents[0].title}: ${player.progressEvents[0].result}` : "No Quick Logs yet"}</strong></article>
            <article className={styles.card}><span>Last session</span><strong>{player.trainingSessions[0]?.summary || "No completed session summary yet"}</strong></article>
          </section>

          <section className={styles.panel}>
            <h2>Body check</h2>
            <div className={styles.formGrid}>
              <label>Soreness<select value={soreness} onChange={(e) => setSoreness(e.target.value)}><option>None</option><option>Mild</option><option>Moderate</option><option>High</option></select></label>
              <label>Ache / pain area<input value={bodyArea} onChange={(e) => setBodyArea(e.target.value)} placeholder="Example: right knee" /></label>
              <label className={styles.full}>Discomfort: {discomfort}/10<input type="range" min="0" max="10" value={discomfort} onChange={(e) => setDiscomfort(Number(e.target.value))} /></label>
              <label className={styles.full}>Why are you changing the suggested plan? <input value={adjustmentReason} onChange={(e) => setAdjustmentReason(e.target.value)} placeholder="Optional: readiness, time, space, coach decision..." /></label>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.sectionHeading}><div><span>TODAY&apos;S PLAN</span><h2>Sections + drills</h2></div><small>Quick Log will pull directly from this plan</small></div>
            <div className={styles.planList}>
              {plan.map((section, sectionIndex) => (
                <article className={styles.planSection} key={section.id}>
                  <div className={styles.planSectionTop}>
                    <b>{sectionIndex + 1}</b>
                    <input value={section.title} onChange={(e) => setPlan((current) => current.map((item) => item.id === section.id ? { ...item, title: e.target.value } : item))} />
                    <button onClick={() => setPlan((current) => current.filter((item) => item.id !== section.id))}>Remove</button>
                  </div>
                  <input value={section.notes} onChange={(e) => setPlan((current) => current.map((item) => item.id === section.id ? { ...item, notes: e.target.value } : item))} placeholder="Section focus / notes" />
                  <div className={styles.drills}>
                    {section.drills.map((drill, drillIndex) => (
                      <div key={`${section.id}-${drillIndex}`} className={styles.drillRow}>
                        <span>Drill {drillIndex + 1}</span>
                        <input value={drill.title} onChange={(e) => setPlan((current) => current.map((item) => item.id === section.id ? { ...item, drills: item.drills.map((d, i) => i === drillIndex ? { ...d, title: e.target.value } : d) } : item))} />
                        <button onClick={() => setPlan((current) => current.map((item) => item.id === section.id ? { ...item, drills: item.drills.filter((_, i) => i !== drillIndex) } : item))}>Remove</button>
                      </div>
                    ))}
                    <button className={styles.smallButton} onClick={() => openDrillPicker(section.id)}>+ Add drill</button>{pickerSectionId===section.id&&<div className={styles.drillPicker}><input autoFocus placeholder="Search Drill Library..." value={drillSearch} onChange={e=>setDrillSearch(e.target.value)}/><div className={styles.drillPickerResults}>{drillMatches.map(d=><button type="button" key={d.name} onClick={()=>addLibraryDrill(section.id,d.name,d.measurementType)}><strong>{d.name}</strong><small>{d.primaryCategory}{d.measurable&&d.measurementType?` · ${d.measurementType}`:""}</small></button>)}</div><div className={styles.improvisedRow}><input placeholder="Custom / improvised drill" value={improvisedDrill} onChange={e=>setImprovisedDrill(e.target.value)}/><button type="button" disabled={!improvisedDrill.trim()} onClick={()=>addImprovisedDrill(section.id)}>Add custom</button></div></div>}
                  </div>
                </article>
              ))}
            </div>
            <div className={styles.actions}><button onClick={addSection}>+ Add section</button><button className={styles.primary} onClick={startSession} disabled={busy}>{busy ? "Saving…" : "Start & save session"}</button></div>
          </section>
        </div>
      )}

      {step === "during" && session && (
        <div className={styles.stack}>
          <section className={styles.panel}>
            <div className={styles.sectionHeading}><div><span>QUICK LOG</span><h2>Save what matters</h2></div><small>Drills come from today&apos;s plan</small></div>
            <form className={styles.quickForm} onSubmit={saveLog}>
              <label>Section<select value={selectedSavedSection?.id ?? ""} onChange={(e) => chooseSavedSection(e.target.value)}>{sessionSections.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label>
              <label>Drill<select value={selectedDrillId || savedDrills[0]?.id || "other"} onChange={(e) => { setSelectedDrillId(e.target.value); setSpot(""); }}>{savedDrills.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}<option value="other">Other / add drill</option></select></label>
              {selectedDrillId === "other" && <label>Custom drill<input value={customDrill} onChange={(e) => setCustomDrill(e.target.value)} placeholder="Type the improvised drill once" /></label>}
              <label>Log type<select value={logType} onChange={(e) => setLogType(e.target.value)}><option>Drill result</option><option>Shooting result</option><option>Dribbling result</option><option>Coach observation</option><option>Goal progress</option><option>Body/readiness update</option></select></label>
              {logType === "Shooting result" && <><label>Court spot<select value={spot} onChange={(e) => setSpot(e.target.value)}><option value="">Choose spot</option>{shootingSpots.map((item) => <option key={item}>{item}</option>)}</select></label><label>Makes<input inputMode="numeric" value={makes} onChange={(e) => setMakes(e.target.value)} placeholder="7" /></label><label>Attempts<input inputMode="numeric" value={attempts} onChange={(e) => setAttempts(e.target.value)} placeholder="10" /></label></>}
              {logType === "Dribbling result" && <label>Dribbling result<input value={result} onChange={(e) => setResult(e.target.value)} placeholder="18.4 sec, 12 clean reps, 2 mistakes" /></label>}
              {logType === "Drill result" && <label>Drill result<input value={result} onChange={(e) => setResult(e.target.value)} placeholder="Score, reps, time, or outcome" /></label>}
              {logType === "Goal progress" && <><label>Goal<select value={selectedGoal} onChange={(e) => setSelectedGoal(e.target.value)}><option value="">Choose session/player goal</option>{player.goals.map((goal) => <option value={goal.title} key={goal.id}>{goal.title}</option>)}</select></label><label>Goal status<select value={result} onChange={(e) => setResult(e.target.value)}><option value="">Choose status</option><option>Reached today</option><option>Progressing</option><option>Needs more work</option><option>Not worked today</option></select></label></>}
              {logType === "Body/readiness update" && <label>Readiness update<input value={result} onChange={(e) => setResult(e.target.value)} placeholder="Feeling good, knee 2/10, fatigue increased..." /></label>}
              {logType !== "Coach observation" && <label>What does it mean next?<select value={next} onChange={(e) => setNext(e.target.value)}><option>Keep progressing</option><option>Revisit next session</option><option>Goal met</option><option>Change focus</option></select></label>}
              <label className={styles.full}>{logType === "Coach observation" ? "Coach observation" : "Coach note"}<textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder={logType === "Coach observation" ? "What did you notice?" : "Optional context"} /></label>
              <div className={styles.actions}><button type="button" onClick={startVoiceToText} disabled={listening}>{listening ? "🎙 Listening…" : "🎙 Voice-to-text"}</button><button className={styles.primary} disabled={busy}>Save Quick Log</button></div>
            </form>
          </section>

          <section className={styles.panel}>
            <div className={styles.sectionHeading}><div><span>SESSION FEED</span><h2>Saved to athlete history</h2></div><small>Edit any mistake</small></div>
            <div className={styles.feed}>
              {session.progressEvents.map((log) => editingLog?.id === log.id ? (
                <form key={log.id} className={styles.quickForm} onSubmit={saveEditedLog}>
                  <label>Drill<input name="title" defaultValue={log.title} /></label>
                  <label>Log type<select name="type" defaultValue={logTypeLabel(log.type)}><option>Drill result</option><option>Shooting result</option><option>Dribbling result</option><option>Coach observation</option><option>Goal progress</option><option>Body/readiness update</option></select></label>
                  <label>Spot / side<input name="spot" defaultValue={log.spot ?? ""} /></label>
                  <label>Result<input name="result" defaultValue={log.result} /></label>
                  <label>Next<select name="next" defaultValue={nextLabel(log.nextStep)}><option>Keep progressing</option><option>Revisit next session</option><option>Goal met</option><option>Change focus</option></select></label>
                  <label className={styles.full}>Coach note<textarea name="notes" defaultValue={log.notes ?? ""} rows={2} /></label>
                  <div className={styles.actions}><button type="button" onClick={() => setEditingLog(null)}>Cancel</button><button className={styles.primary}>Save changes</button></div>
                </form>
              ) : (
                <article key={log.id}><span>{log.category} · {logTypeLabel(log.type)}</span><strong>{log.title}{log.spot ? ` · ${log.spot}` : ""}</strong><b>{log.result}</b>{log.notes && <p>{log.notes}</p>}<small>{nextLabel(log.nextStep)}</small><button onClick={() => setEditingLog(log)}>Edit Quick Log</button></article>
              ))}
            </div>
            <button className={styles.primaryWide} onClick={openWrapUp}>Finish session & review wrap-up</button>
          </section>
        </div>
      )}

      {step === "wrap" && session && (
        <section className={styles.panel}>
          <div className={styles.sectionHeading}><div><span>SESSION WRAP-UP</span><h2>Approve the carryover</h2></div><small>This becomes the next development focus</small></div>
          <div className={styles.wrapGrid}>
            <label>Main takeaway<textarea value={takeaway} onChange={(e) => setTakeaway(e.target.value)} rows={3} /></label>
            <label>Needs more work<textarea value={needsWork} onChange={(e) => setNeedsWork(e.target.value)} rows={3} /></label>
            <label>Next-session focus<textarea value={nextFocus} onChange={(e) => setNextFocus(e.target.value)} rows={3} /></label>
          </div>
          {session.completedAt ? <p className={styles.success}>Session saved and completed. The approved next focus is now attached to the player.</p> : <div className={styles.actions}><button onClick={() => setStep("during")}>Back to session</button><button className={styles.primary} onClick={completeSession} disabled={busy}>{busy ? "Saving…" : "Approve & complete session"}</button></div>}
        </section>
      )}
    </main>
  );
}