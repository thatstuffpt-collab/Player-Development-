"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { drillCategories as defaultCategories, drillLibrary as fallbackLibrary, type DrillDefinition } from "@/domain/drills/master-drill-library";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

type DrillRow = DrillDefinition & {
  id?: string;
  subcategory?: string | null;
  aliases?: string[];
  notes?: string | null;
  isDefault?: boolean;
};

type PreviewRow = {
  "Drill Name": string;
  Category: string;
  "What It Works On": string;
  "Alternate Names": string;
  Notes: string;
  [key: string]: string;
};

const simpleHeaders = ["Drill Name", "Category", "What It Works On", "Alternate Names", "Notes"] as const;

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') { field += '"'; i += 1; continue; }
    if (char === '"') { quoted = !quoted; continue; }
    if (char === "," && !quoted) { row.push(field.trim()); field = ""; continue; }
    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
      continue;
    }
    field += char;
  }
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export default function DrillLibraryPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [measurable, setMeasurable] = useState(false);
  const [items, setItems] = useState<DrillRow[]>(fallbackLibrary);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [source, setSource] = useState<"default" | "custom">("default");
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [mode, setMode] = useState<"replace" | "add">("replace");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadLibrary() {
    const response = await authenticatedFetch("/api/trainer/drills");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Could not load drill library.");
    setItems(payload.drills ?? []);
    setCategories(payload.categories ?? defaultCategories);
    setSource(payload.source ?? "default");
  }

  useEffect(() => {
    let cancelled = false;
    void authenticatedFetch("/api/trainer/drills")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Could not load drill library.");
        if (cancelled) return;
        setItems(payload.drills ?? []);
        setCategories(payload.categories ?? defaultCategories);
        setSource(payload.source ?? "default");
      })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Could not load drill library."); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((drill) => {
      if (category !== "All" && !drill.tags.includes(category as never)) return false;
      if (measurable && !drill.measurable) return false;
      if (!query) return true;
      return [
        drill.name,
        drill.primaryCategory,
        drill.subcategory ?? "",
        ...(drill.aliases ?? []),
        ...(drill.tags ?? []),
        ...(drill.variations ?? []),
        drill.notes ?? "",
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [category, items, measurable, q]);

  const duplicatePreview = useMemo(() => {
    const groups = new Map<string, string[]>();
    for (const row of preview) {
      const key = normalize(row["Drill Name"]);
      if (!key) continue;
      groups.set(key, [...(groups.get(key) ?? []), row["Drill Name"]]);
    }
    return [...groups.values()].filter((names) => names.length > 1);
  }, [preview]);

  async function downloadTemplate() {
    setError("");
    try {
      const response = await authenticatedFetch("/api/trainer/drills/template");
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Could not download the spreadsheet template.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "thats-tuff-drill-library-template.xlsx";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not download the spreadsheet template.");
    }
  }

  async function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setMessage("");
    setPreview([]);
    setFileName(file.name);

    try {
      let rows: PreviewRow[] = [];
      if (file.name.toLowerCase().endsWith(".xlsx")) {
        const response = await authenticatedFetch("/api/trainer/drills/preview", {
          method: "POST",
          headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
          body: file,
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Could not read that spreadsheet.");
        rows = payload.rows ?? [];
      } else {
        const parsed = parseCsv(await file.text());
        if (parsed.length < 2) throw new Error("The CSV needs a header row and at least one drill.");
        const headers = parsed[0].map((value) => value.replace(/^\uFEFF/, "").trim());
        const hasNewHeaders = simpleHeaders.every((header) => headers.includes(header));
        const hasOldHeaders = headers.includes("Drill Name") && headers.includes("Primary Category");
        if (!hasNewHeaders && !hasOldHeaders) {
          throw new Error("Use the That’s Tuff template, or include Drill Name and Category columns.");
        }
        rows = parsed.slice(1).map((values) => {
          const raw = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
          return {
            ...raw,
            "Drill Name": String(raw["Drill Name"] ?? ""),
            Category: String(raw.Category ?? raw["Primary Category"] ?? ""),
            "What It Works On": String(raw["What It Works On"] ?? raw.Subcategory ?? ""),
            "Alternate Names": String(raw["Alternate Names"] ?? raw["Alternate Names / Aliases"] ?? ""),
            Notes: String(raw.Notes ?? ""),
          } as PreviewRow;
        }).filter((row) => row["Drill Name"].trim());
      }
      if (!rows.length) throw new Error("No drill rows were found in that file.");
      setPreview(rows);
    } catch (err) {
      setPreview([]);
      setError(err instanceof Error ? err.message : "Could not read that drill list.");
    }
  }

  async function importLibrary() {
    if (!preview.length || duplicatePreview.length) return;
    if (mode === "replace" && !confirm("Replace the current custom drill library with this uploaded list? Saved practice plans will keep their existing drill names.")) return;

    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await authenticatedFetch("/api/trainer/drills", {
        method: "POST",
        body: JSON.stringify({ action: "import", mode, rows: preview }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not import drill library.");
      setPreview([]);
      setFileName("");
      if (fileRef.current) fileRef.current.value = "";
      await loadLibrary();
      setMessage(`Drill library updated. ${payload.drills?.length ?? 0} drills are now active.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not import drill library.");
    } finally {
      setBusy(false);
    }
  }

  async function resetToDefault() {
    if (!confirm("Reset to the built-in starter library? This removes your custom uploaded library. Existing saved practice plans are not changed.")) return;
    setBusy(true);
    setError("");
    try {
      const response = await authenticatedFetch("/api/trainer/drills", {
        method: "POST",
        body: JSON.stringify({ action: "reset" }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not reset drill library.");
      await loadLibrary();
      setMessage("Custom library removed. The built-in starter library is active again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset drill library.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="players-shell">
      <header className="players-header">
        <div>
          <Link className="back-link" href="/trainer/players">← Trainer</Link>
          <p className="eyebrow">MASTER DRILL LIBRARY</p>
          <h1>Drills</h1>
          <p className="support-copy">Keep one official record per drill, use alternate names for search, and organize the same library used by individual, group, and camp workout builders.</p>
        </div>
        <span className="step-chip">{source === "custom" ? "Your custom library" : "Starter library"}</span>
      </header>

      {error && <p className="auth-error">{error}</p>}
      {message && <p className="support-copy">{message}</p>}

      <section className="session-card">
        <div className="section-heading">
          <div><span className="section-kicker">MANAGE LIBRARY</span><h2>Simple drill spreadsheet</h2></div>
          <span className="speed-chip">Excel / Numbers</span>
        </div>
        <p className="support-copy">The template now opens as a real spreadsheet. Each row is one drill. You only need a drill name and category; the other columns help keep similar drills organized.</p>

        <div className="profile-content-grid">
          <article className="session-card">
            <span className="section-kicker">1. DRILL NAME</span>
            <h3>Official drill name</h3>
            <p className="support-copy">Example: Cross-Step Punch. Use one row for the drill instead of making duplicate versions.</p>
          </article>
          <article className="session-card">
            <span className="section-kicker">2. CATEGORY</span>
            <h3>What part of training?</h3>
            <p className="support-copy">Choose from the same categories used inside the app. The spreadsheet includes a dropdown.</p>
          </article>
          <article className="session-card">
            <span className="section-kicker">3. WHAT IT WORKS ON</span>
            <h3>Make it easy to find</h3>
            <p className="support-copy">Example: change of direction, weak hand, contact finishing, closeouts, or decision-making.</p>
          </article>
          <article className="session-card">
            <span className="section-kicker">OPTIONAL</span>
            <h3>Alternate names & notes</h3>
            <p className="support-copy">Put other names for the same drill in Alternate Names so they stay searchable without becoming duplicate drills.</p>
          </article>
        </div>

        <div className="profile-actions">
          <button type="button" className="ghost-button" onClick={downloadTemplate}>Download Spreadsheet Template (.xlsx)</button>
          <button type="button" className="primary-button" onClick={() => fileRef.current?.click()}>Upload Drill Spreadsheet</button>
          {source === "custom" && <button type="button" className="danger-text-button" onClick={resetToDefault} disabled={busy}>Reset to Starter Library</button>}
        </div>
        <input ref={fileRef} hidden type="file" accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" onChange={chooseFile} />

        <div className="evaluation-card">
          <div className="section-heading"><div><span className="section-kicker">APP CATEGORIES</span><h3>Category choices in the spreadsheet</h3></div></div>
          <div className="coach-tags">{categories.map((item) => <span className="coach-tag" key={item}>{item}</span>)}</div>
        </div>

        {preview.length > 0 && (
          <div className="evaluation-card">
            <div className="section-heading">
              <div><span className="section-kicker">UPLOAD PREVIEW</span><h2>{fileName}</h2></div>
              <span className="speed-chip">{preview.length} drills</span>
            </div>
            <div className="player-create-grid">
              <label>Import behavior
                <select value={mode} onChange={(event) => setMode(event.target.value as "replace" | "add")}>
                  <option value="replace">Replace current custom library</option>
                  <option value="add">Add / update these drills</option>
                </select>
              </label>
            </div>
            {duplicatePreview.length > 0 && (
              <p className="auth-error">Duplicate official names found: {duplicatePreview.map((names) => names.join(" / ")).join("; ")}. Keep one official row and move other wording into Alternate Names.</p>
            )}
            <div className="profile-content-grid">
              {preview.slice(0, 12).map((row, index) => (
                <article className="session-card" key={`${row["Drill Name"]}-${index}`}>
                  <span className="section-kicker">{row.Category || "Missing category"}</span>
                  <h3>{row["Drill Name"]}</h3>
                  {row["What It Works On"] && <p className="support-copy">Works on: {row["What It Works On"]}</p>}
                  {row["Alternate Names"] && <p className="support-copy">Also called: {row["Alternate Names"]}</p>}
                </article>
              ))}
            </div>
            {preview.length > 12 && <p className="support-copy">Previewing 12 of {preview.length} rows.</p>}
            <button className="primary-button" type="button" onClick={importLibrary} disabled={busy || duplicatePreview.length > 0}>{busy ? "Importing…" : mode === "replace" ? "Replace Library" : "Add to Library"}</button>
          </div>
        )}
      </section>

      <section className="session-card">
        <div className="player-create-grid">
          <label>Search<input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search drills, what they work on, alternate names..." /></label>
          <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option>All</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Filters</span><button type="button" className={measurable ? "primary-button" : "ghost-button"} onClick={() => setMeasurable((value) => !value)}>Measurable only</button></label>
        </div>
        <p className="support-copy">Showing {filtered.length} of {items.length} drills</p>
      </section>

      <section className="profile-content-grid">
        {filtered.map((drill) => (
          <article className="session-card" key={drill.id ?? drill.name}>
            <span className="section-kicker">{drill.primaryCategory}</span>
            <h2>{drill.name}</h2>
            {drill.subcategory && <p className="support-copy">Works on: {drill.subcategory}</p>}
            <div className="coach-tags">{drill.tags.map((tag) => <span className="coach-tag" key={tag}>{tag}</span>)}</div>
            {(drill.aliases?.length ?? 0) > 0 && <p className="support-copy">Also searchable as: {drill.aliases?.join(" · ")}</p>}
            {drill.measurable && <p className="support-copy">Measurement: {drill.measurementType?.replaceAll("-", " / ")}</p>}
            {(drill.variations?.length ?? 0) > 0 && <p className="support-copy">Variations: {drill.variations?.join(" · ")}</p>}
            {drill.notes && <p className="support-copy">{drill.notes}</p>}
          </article>
        ))}
      </section>
    </main>
  );
}
