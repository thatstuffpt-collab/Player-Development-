"use client";

import { useMemo, useState } from "react";

const categories=["Ball Control","Footwork","Decision-Making","Defense","Shooting Form","Layups","Finishing","Conditioning","Confidence","Motor / Engagement","Response to Mistakes","Coachability"];
const labels=["","Building Foundation","Developing","Game Ready","Getting Tuff","Tuff"];
type Rating={rating:number;status:"✓"|"△"|"○"};

export default function CampEvaluationPage(){
 const [name,setName]=useState("");
 const [number,setNumber]=useState("");
 const [ratings,setRatings]=useState<Record<string,Rating>>(Object.fromEntries(categories.map(c=>[c,{rating:3,status:"△"}])));
 const [notes,setNotes]=useState("");
 const [saved,setSaved]=useState<Array<{name:string;number:string;ratings:Record<string,Rating>;notes:string}>>([]);
 const average=useMemo(()=>Object.values(ratings).reduce((a,b)=>a+b.rating,0)/categories.length,[ratings]);
 function saveAndNext(){
  if(!name.trim())return;
  setSaved(current=>[{name:name.trim(),number:number.trim(),ratings,notes},...current]);
  setName("");setNumber("");setNotes("");setRatings(Object.fromEntries(categories.map(c=>[c,{rating:3,status:"△"}])));
  window.scrollTo({top:0,behavior:"smooth"});
 }
 return <main className="players-shell">
  <header className="players-header"><div><p className="eyebrow">CAMP / QUICK EVALUATION</p><h1>Fast athlete evaluation</h1><p className="support-copy">These athletes stay separate from your client player list. Save one, then move immediately to the next athlete.</p></div><div className="step-chip">{saved.length} saved this run</div></header>
  <section className="evaluation-card camp-athlete-card"><div className="player-create-grid"><label>Athlete name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Athlete name" /></label><label>Jersey / group number<input value={number} onChange={e=>setNumber(e.target.value)} placeholder="Optional" /></label></div></section>
  <section className="evaluation-card"><div className="section-heading"><div><span className="section-kicker">QUICK RATINGS</span><h2>Tap what you observed</h2></div><span className="speed-chip">{average.toFixed(1)} avg</span></div>
   <div className="camp-rating-stack">{categories.map(category=><article className="camp-rating-row" key={category}><div><strong>{category}</strong><small>{labels[ratings[category].rating]}</small></div><div className="compact-rating-scale">{[1,2,3,4,5].map(n=><button type="button" className={ratings[category].rating===n?"compact-rating selected":"compact-rating"} onClick={()=>setRatings(s=>({...s,[category]:{...s[category],rating:n}}))} key={n}>{n}</button>)}</div><div className="camp-status-buttons">{(["✓","△","○"] as const).map(status=><button type="button" className={ratings[category].status===status?"observation-tag selected":"observation-tag"} onClick={()=>setRatings(s=>({...s,[category]:{...s[category],status}}))} key={status}>{status}</button>)}</div></article>)}</div>
   <p className="support-copy">✓ Meets standard · △ Developing · ○ Needs focus</p>
   <label className="goal-field">Quick trainer note<textarea rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Best strength, biggest need, or next recommendation..." /></label>
   <button className="primary-button" type="button" disabled={!name.trim()} onClick={saveAndNext}>Save & Next Athlete</button>
  </section>
  {saved.length>0&&<section className="evaluation-card"><div className="section-heading"><div><span className="section-kicker">THIS CAMP RUN</span><h2>Completed quick evaluations</h2></div></div>{saved.map((item,i)=><div className="profile-list-row" key={i}><strong>{item.name}{item.number?` #${item.number}`:""}</strong><span>{item.notes||"Evaluation saved"}</span></div>)}</section>}
 </main>;
}
