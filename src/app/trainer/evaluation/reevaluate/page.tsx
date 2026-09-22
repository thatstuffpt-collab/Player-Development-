"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

type Rating = { rating:number|null; criterion:{label:string;sortOrder:number} };
type Evaluation = { id:string;evaluatedAt:string;priorityAreas:string[];shortTermGoal:string|null;ratings:Rating[] };
type Evidence = { id:string;category:string;title:string;result:string;occurredAt:string };
type Player = { id:string;firstName:string;lastName:string;preferredName:string|null;evaluations:Evaluation[];progressEvents:Evidence[] };

const labels=["","Building Foundation","Developing","Game Ready","Getting Tuff","Tuff"];

export default function ReevaluationPage(){
  const search=useSearchParams(); const playerId=search.get("playerId");
  const [player,setPlayer]=useState<Player|null>(null); const [ratings,setRatings]=useState<Record<string,number|null>>({});
  const [notes,setNotes]=useState<Record<string,string>>({}); const [priorities,setPriorities]=useState<string[]>([]);
  const [goal,setGoal]=useState(""); const [summary,setSummary]=useState(""); const [error,setError]=useState(""); const [saving,setSaving]=useState(false); const [saved,setSaved]=useState(false);

  useEffect(()=>{if(!playerId)return;authenticatedFetch(`/api/trainer/players/${playerId}`).then(async r=>{const p=await r.json();if(!r.ok)throw new Error(p.error??"Could not load player.");return p.player as Player}).then(p=>{setPlayer(p);const previous=p.evaluations[0];if(previous){setRatings(Object.fromEntries(previous.ratings.map(x=>[x.criterion.label,x.rating])));setPriorities(previous.priorityAreas);setGoal(previous.shortTermGoal??"")}}).catch(e=>setError(e instanceof Error?e.message:"Could not load player."))},[playerId]);

  const previous=player?.evaluations[0]; const categories=previous?.ratings.map(x=>x.criterion.label)??[];
  const prior=useMemo(()=>Object.fromEntries((previous?.ratings??[]).map(x=>[x.criterion.label,x.rating])),[previous]);
  const evidence=useMemo(()=>{if(!previous||!player)return[];const since=new Date(previous.evaluatedAt).getTime();return player.progressEvents.filter(x=>new Date(x.occurredAt).getTime()>since)},[player,previous]);

  function togglePriority(category:string){setPriorities(current=>current.includes(category)?current.filter(x=>x!==category):current.length<3?[...current,category]:current)}
  async function save(){if(!playerId)return;setSaving(true);setError("");try{const r=await authenticatedFetch(`/api/trainer/players/${playerId}/reevaluations`,{method:"POST",body:JSON.stringify({priorities,shortTermGoal:goal,summary,ratings:categories.map(category=>({category,rating:ratings[category]??null,note:notes[category]??""}))})});const p=await r.json();if(!r.ok)throw new Error(p.error??"Could not save reevaluation.");setSaved(true)}catch(e){setError(e instanceof Error?e.message:"Could not save reevaluation.")}finally{setSaving(false)}}

  if(!playerId)return <main className="reeval-shell"><p className="eyebrow">PLAYER REEVALUATION</p><h1>Choose a player first</h1><Link className="primary-link-button" href="/trainer/players">Open Players</Link></main>;
  if(!player)return <main className="reeval-shell"><p className="eyebrow">PLAYER REEVALUATION</p><h1>{error?"Could not load player":"Loading…"} </h1>{error&&<p className="auth-error">{error}</p>}</main>;
  if(!previous)return <main className="reeval-shell"><p className="eyebrow">PLAYER REEVALUATION</p><h1>Baseline required</h1><p className="support-copy">Complete the first evaluation before creating a reevaluation.</p><Link className="primary-link-button" href={`/trainer/evaluation/new?playerId=${player.id}`}>Start Baseline</Link></main>;
  if(saved)return <main className="reeval-shell"><p className="eyebrow">REEVALUATION SAVED</p><h1>New evaluation added to history.</h1><p className="support-copy">The previous evaluation is preserved unchanged and the active development plan has been updated.</p><Link className="primary-link-button" href={`/trainer/players/${player.id}`}>Back to Player Profile</Link></main>;

  return <main className="reeval-shell">
    <header className="reeval-header"><div><Link className="back-link" href={`/trainer/players/${player.id}`}>← Player profile</Link><p className="eyebrow">PLAYER REEVALUATION</p><h1 className="evaluation-title">{player.preferredName||player.firstName} {player.lastName}</h1><p className="session-meta">Previous evaluation: {new Date(previous.evaluatedAt).toLocaleDateString()} · {evidence.length} evidence entries since</p></div></header>
    {error&&<p className="auth-error">{error}</p>}
    <section className="evaluation-card"><div className="section-heading"><div><span className="section-kicker">COMPARE + UPDATE</span><h2>Use the training evidence, then make the coaching call</h2></div></div>
      <div className="reeval-stack">{categories.map(category=>{const old=prior[category] as number|null;const current=ratings[category];const related=evidence.filter(x=>x.category.toLowerCase().includes(category.toLowerCase().split(" ")[0])).slice(-3);return <article className="reeval-card" key={category}><div className="reeval-title-row"><h3>{category}</h3>{old!==null&&current!==null&&<span className="delta">{current-old>0?"+":""}{current-old}</span>}</div><div className="reeval-columns"><div className="previous-rating"><span>Previous</span><strong>{old??"—"}</strong><p>{old?labels[old]:"Not assessed"}</p></div><div className="evidence-panel"><span>Evidence since last evaluation</span>{related.length?<ul>{related.map(x=><li key={x.id}>{x.title}: {x.result}</li>)}</ul>:<p>No matching Quick Log yet.</p>}</div><div className="new-rating"><span>New rating</span><div className="compact-rating-scale">{[1,2,3,4,5].map(n=><button type="button" key={n} className={current===n?"compact-rating selected":"compact-rating"} onClick={()=>setRatings(s=>({...s,[category]:n}))}>{n}</button>)}</div><p>{current?labels[current]:"Not assessed"}</p></div></div><textarea className="evaluation-note" rows={2} value={notes[category]??""} onChange={e=>setNotes(s=>({...s,[category]:e.target.value}))} placeholder="Why did this rating change or stay the same? Optional trainer note..."/></article>})}</div>
    </section>
    <section className="evaluation-card reeval-plan"><div className="section-heading"><div><span className="section-kicker">UPDATED DEVELOPMENT PLAN</span><h2>What matters next?</h2></div><span className="speed-chip">{priorities.length}/3 priorities</span></div><div className="priority-grid">{categories.map(category=><button type="button" key={category} className={priorities.includes(category)?"priority-button selected":"priority-button"} onClick={()=>togglePriority(category)}>{category}</button>)}</div><label className="goal-field">Updated short-term goal<textarea rows={3} value={goal} onChange={e=>setGoal(e.target.value)}/></label><label className="goal-field">Parent-safe evaluation summary (optional)<textarea rows={3} value={summary} onChange={e=>setSummary(e.target.value)} placeholder="What improved and what are we focusing on next?"/></label><button className="primary-button" type="button" onClick={save} disabled={saving}>{saving?"Saving…":"Save New Evaluation & Update Plan"}</button></section>
  </main>
}
