"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { drillCategories, drillLibrary, type DrillDefinition } from "@/domain/drills/master-drill-library";
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import styles from "./practice-plans.module.css";

type PlanDrill = { title: string; notes: string; focusArea?: string | null };
type PlanSection = { id: number; title: string; notes: string; focusArea?: string | null; drills: PlanDrill[] };
type SavedItem = {
  id: string;
  parentItemId: string | null;
  itemType: "SECTION" | "DRILL";
  focusArea: string | null;
  sortOrder: number;
  title: string;
  notes: string | null;
};
type SavedPlan = {
  id: string;
  title: string;
  planType: "GROUP" | "CAMP";
  scheduledFor: string | null;
  notes: string | null;
  updatedAt: string;
  items: SavedItem[];
};

const starterPlan: PlanSection[] = [
  { id: 1, title: "Warm-up", notes: "Prepare the group for today's work", drills: [] },
  { id: 2, title: "Skill Development", notes: "", drills: [] },
  { id: 3, title: "Game-like Work", notes: "", drills: [] },
];

function focusAreaForDrill(drill: DrillDefinition): string | null {
  const map: Partial<Record<DrillDefinition["primaryCategory"], string>> = {
    "Ball Handling": "BALL_HANDLING",
    Shooting: "SHOOTING",
    Finishing: "FINISHING",
    Defense: "DEFENSE",
    Footwork: "FOOTWORK",
    "Decision-Making / Live Play": "DECISION_MAKING",
    Conditioning: "CONDITIONING",
  };
  return map[drill.primaryCategory] ?? null;
}

function sectionSuggestedCategories(title: string) {
  const normalized = title.toLowerCase();
  if (normalized.includes("shoot")) return ["Shooting"];
  if (normalized.includes("ball") || normalized.includes("handle") || normalized.includes("dribbl")) return ["Ball Handling"];
  if (normalized.includes("finish") || normalized.includes("layup")) return ["Finishing"];
  if (normalized.includes("defen")) return ["Defense"];
  if (normalized.includes("footwork")) return ["Footwork"];
  if (normalized.includes("condition")) return ["Conditioning"];
  if (normalized.includes("warm") || normalized.includes("movement")) return ["Warm-Up / Movement Prep"];
  if (normalized.includes("pass")) return ["Passing"];
  if (normalized.includes("rebound")) return ["Rebounding"];
  if (normalized.includes("live") || normalized.includes("game")) return ["Decision-Making / Live Play", "Competition / Games"];
  return [];
}

function planFromSaved(saved: SavedPlan): PlanSection[] {
  const sections = saved.items.filter((item) => item.itemType === "SECTION");
  return sections.map((section, index) => ({
    id: 1000 + index,
    title: section.title,
    notes: section.notes ?? "",
    focusArea: section.focusArea,
    drills: saved.items
      .filter((item) => item.itemType === "DRILL" && item.parentItemId === section.id)
      .map((drill) => ({
        title: drill.title,
        notes: drill.notes ?? "",
        focusArea: drill.focusArea,
      })),
  }));
}

function dateInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function GroupCampPracticePlansPage() {
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [title, setTitle] = useState("Group Session Practice Plan");
  const [planType, setPlanType] = useState<"GROUP" | "CAMP">("GROUP");
  const [scheduledFor, setScheduledFor] = useState("");
  const [planNotes, setPlanNotes] = useState("");
  const [plan, setPlan] = useState<PlanSection[]>(starterPlan);
  const [librarySectionId, setLibrarySectionId] = useState<number | null>(null);
  const [libraryQuery, setLibraryQuery] = useState("");
  const [libraryCategory, setLibraryCategory] = useState("All");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    const response = await authenticatedFetch("/api/trainer/practice-plans");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Could not load practice plans.");
    setSavedPlans(payload.plans ?? []);
  }

  useEffect(() => {
    let cancelled = false;
    void authenticatedFetch("/api/trainer/practice-plans")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Could not load practice plans.");
        if (!cancelled) setSavedPlans(payload.plans ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load practice plans.");
      });
    return () => { cancelled = true; };
  }, []);

  const librarySection = plan.find((section) => section.id === librarySectionId) ?? null;
  const filteredLibrary = useMemo(() => {
    const query = libraryQuery.trim().toLowerCase();
    const suggested = librarySection ? sectionSuggestedCategories(librarySection.title) : [];
    return drillLibrary
      .filter((drill) => libraryCategory === "All" || drill.tags.includes(libraryCategory as never))
      .filter((drill) => !query || drill.name.toLowerCase().includes(query) || drill.tags.some((tag) => tag.toLowerCase().includes(query)))
      .sort((a, b) => {
        const aSuggested = a.tags.some((tag) => suggested.includes(tag)) ? 1 : 0;
        const bSuggested = b.tags.some((tag) => suggested.includes(tag)) ? 1 : 0;
        return bSuggested - aSuggested || a.name.localeCompare(b.name);
      })
      .slice(0, 30);
  }, [libraryCategory, libraryQuery, librarySection]);

  function newPlan(type: "GROUP" | "CAMP" = "GROUP") {
    setActiveId(null);
    setPlanType(type);
    setTitle(type === "CAMP" ? "Camp Practice Plan" : "Group Session Practice Plan");
    setScheduledFor("");
    setPlanNotes("");
    setPlan(starterPlan.map((section) => ({ ...section, id: section.id + Date.now(), drills: [] })));
    setMessage("");
    setError("");
  }

  function loadPlan(saved: SavedPlan) {
    setActiveId(saved.id);
    setTitle(saved.title);
    setPlanType(saved.planType);
    setScheduledFor(dateInput(saved.scheduledFor));
    setPlanNotes(saved.notes ?? "");
    const loaded = planFromSaved(saved);
    setPlan(loaded.length ? loaded : starterPlan);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addSection() {
    setPlan((current) => [...current, { id: Date.now(), title: "New Section", notes: "", drills: [] }]);
  }

  function addCustomDrill(sectionId: number) {
    setPlan((current) => current.map((section) => section.id === sectionId
      ? { ...section, drills: [...section.drills, { title: "", notes: "", focusArea: section.focusArea }] }
      : section));
  }

  function addLibraryDrill(sectionId: number, drill: DrillDefinition) {
    setPlan((current) => current.map((section) => section.id === sectionId
      ? { ...section, drills: [...section.drills, { title: drill.name, notes: "", focusArea: focusAreaForDrill(drill) ?? section.focusArea }] }
      : section));
    setLibraryQuery("");
  }

  async function savePlan() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await authenticatedFetch(activeId ? `/api/trainer/practice-plans/${activeId}` : "/api/trainer/practice-plans", {
        method: activeId ? "PATCH" : "POST",
        body: JSON.stringify({
          title,
          planType,
          scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null,
          notes: planNotes,
          sections: plan,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not save practice plan.");
      setActiveId(payload.plan.id);
      setMessage("Practice plan saved.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save practice plan.");
    } finally {
      setBusy(false);
    }
  }

  async function deletePlan() {
    if (!activeId || !confirm("Delete this practice plan?")) return;
    setBusy(true);
    try {
      const response = await authenticatedFetch(`/api/trainer/practice-plans/${activeId}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not delete practice plan.");
      await refresh();
      newPlan(planType);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete practice plan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={styles.shell}>
      <div className={styles.screenOnly}>
        <header className="players-header">
          <div>
            <Link className="back-link" href="/trainer/players">← Trainer</Link>
            <p className="eyebrow">GROUP & CAMP PLANNING</p>
            <h1>Practice Plans</h1>
            <p className="support-copy">Build a coach-ready group session or camp plan from the same drill library used for individual workouts.</p>
          </div>
          <div className={styles.headerActions}>
            <button className="ghost-button" onClick={() => newPlan("GROUP")}>+ Group Plan</button>
            <button className="primary-button" onClick={() => newPlan("CAMP")}>+ Camp Plan</button>
          </div>
        </header>

        {error && <p className="auth-error">{error}</p>}
        {message && <p className={styles.success}>{message}</p>}

        <section className={styles.savedSection}>
          <div className="section-heading">
            <div><span className="section-kicker">SAVED PLANS</span><h2>Reuse or update a plan</h2></div>
            <span className="speed-chip">{savedPlans.length} saved</span>
          </div>
          <div className={styles.savedGrid}>
            {savedPlans.map((saved) => (
              <button key={saved.id} className={activeId === saved.id ? styles.savedActive : styles.savedCard} onClick={() => loadPlan(saved)}>
                <span>{saved.planType === "CAMP" ? "Camp" : "Group session"}</span>
                <strong>{saved.title}</strong>
                <small>{saved.scheduledFor ? new Date(saved.scheduledFor).toLocaleString() : "No date set"}</small>
              </button>
            ))}
            {!savedPlans.length && <p className="support-copy">No saved group or camp plans yet.</p>}
          </div>
        </section>

        <section className="session-card">
          <div className="section-heading">
            <div><span className="section-kicker">PLAN DETAILS</span><h2>{activeId ? "Edit plan" : "New plan"}</h2></div>
            <span className="speed-chip">{planType === "CAMP" ? "Camp" : "Group session"}</span>
          </div>
          <div className="player-create-grid">
            <label>Plan type<select value={planType} onChange={(e) => setPlanType(e.target.value as "GROUP" | "CAMP")}><option value="GROUP">Group session</option><option value="CAMP">Camp</option></select></label>
            <label>Plan title<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Example: Saturday Game Ready Group" /></label>
            <label>Date / time<input type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} /></label>
            <label className="full-field">Coach notes<textarea value={planNotes} onChange={(e) => setPlanNotes(e.target.value)} rows={2} placeholder="Staff assignments, equipment, timing notes..." /></label>
          </div>
        </section>

        <section className="session-card">
          <div className="section-heading"><div><span className="section-kicker">WORKOUT BUILDER</span><h2>Build from your drill library</h2></div><small>No live-session logging required</small></div>
          <div className={styles.builderStack}>
            {plan.map((section, sectionIndex) => (
              <article className={styles.sectionCard} key={section.id}>
                <div className={styles.sectionTop}>
                  <span className={styles.sectionNumber}>{sectionIndex + 1}</span>
                  <input value={section.title} onChange={(e) => setPlan((current) => current.map((item) => item.id === section.id ? { ...item, title: e.target.value } : item))} />
                  <button className="danger-text-button" onClick={() => setPlan((current) => current.filter((item) => item.id !== section.id))}>Remove section</button>
                </div>
                <textarea value={section.notes} onChange={(e) => setPlan((current) => current.map((item) => item.id === section.id ? { ...item, notes: e.target.value } : item))} rows={2} placeholder="Section goal / coaching emphasis" />

                <div className={styles.drillList}>
                  {section.drills.map((drill, drillIndex) => (
                    <div className={styles.drillRow} key={`${section.id}-${drillIndex}`}>
                      <span>{drillIndex + 1}</span>
                      <div>
                        <input value={drill.title} onChange={(e) => setPlan((current) => current.map((item) => item.id === section.id ? { ...item, drills: item.drills.map((entry, index) => index === drillIndex ? { ...entry, title: e.target.value } : entry) } : item))} placeholder="Drill name" />
                        <input value={drill.notes} onChange={(e) => setPlan((current) => current.map((item) => item.id === section.id ? { ...item, drills: item.drills.map((entry, index) => index === drillIndex ? { ...entry, notes: e.target.value } : entry) } : item))} placeholder="Reps, time, groups, coaching cues..." />
                      </div>
                      <button className="danger-text-button" onClick={() => setPlan((current) => current.map((item) => item.id === section.id ? { ...item, drills: item.drills.filter((_, index) => index !== drillIndex) } : item))}>Remove</button>
                    </div>
                  ))}
                </div>

                <div className={styles.builderActions}>
                  <button className="ghost-button" onClick={() => { setLibrarySectionId(librarySectionId === section.id ? null : section.id); setLibraryQuery(""); setLibraryCategory("All"); }}>
                    {librarySectionId === section.id ? "Close Library" : "Add from Library"}
                  </button>
                  <button className="ghost-button" onClick={() => addCustomDrill(section.id)}>+ Custom drill</button>
                </div>

                {librarySectionId === section.id && (
                  <div className={styles.libraryPicker}>
                    <div className="player-create-grid">
                      <label>Search Library<input autoFocus value={libraryQuery} onChange={(e) => setLibraryQuery(e.target.value)} placeholder="Search drill name..." /></label>
                      <label>Category<select value={libraryCategory} onChange={(e) => setLibraryCategory(e.target.value)}><option>All</option>{drillCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
                    </div>
                    <div className={styles.libraryResults}>
                      {filteredLibrary.map((drill) => (
                        <button type="button" key={drill.name} onClick={() => addLibraryDrill(section.id, drill)}>
                          <strong>{drill.name}</strong>
                          <span>{drill.tags.slice(0, 3).join(" · ")}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>

          <div className={styles.footerActions}>
            <button className="ghost-button" onClick={addSection}>+ Add section</button>
            <button className="primary-button" onClick={savePlan} disabled={busy}>{busy ? "Saving…" : activeId ? "Save changes" : "Save practice plan"}</button>
            <button className="ghost-button" onClick={() => window.print()}>Print / Save PDF</button>
            {activeId && <button className="danger-text-button" onClick={deletePlan} disabled={busy}>Delete plan</button>}
          </div>
          <p className="support-copy">For a PDF: choose <strong>Print / Save PDF</strong>, then select <strong>Save as PDF</strong> in your device&apos;s print dialog.</p>
        </section>
      </div>

      <section className={styles.printSheet}>
        <header>
          <p>THAT&apos;S TUFF PERFORMANCE TRAINING</p>
          <h1>{title || "Practice Plan"}</h1>
          <div>{planType === "CAMP" ? "Camp Practice Plan" : "Group Session Practice Plan"}{scheduledFor ? ` · ${new Date(scheduledFor).toLocaleString()}` : ""}</div>
          {planNotes && <p>{planNotes}</p>}
        </header>
        {plan.map((section, sectionIndex) => (
          <article key={section.id}>
            <h2>{sectionIndex + 1}. {section.title}</h2>
            {section.notes && <p>{section.notes}</p>}
            <ol>
              {section.drills.map((drill, drillIndex) => (
                <li key={`${section.id}-print-${drillIndex}`}>
                  <strong>{drill.title || "Untitled drill"}</strong>
                  {drill.notes && <span>{drill.notes}</span>}
                </li>
              ))}
            </ol>
          </article>
        ))}
      </section>
    </main>
  );
}
