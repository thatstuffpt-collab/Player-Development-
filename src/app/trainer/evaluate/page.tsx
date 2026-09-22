"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

type Player={id:string;firstName:string;lastName:string;preferredName:string|null;developmentFocuses:Array<{focus:string}>};

export default function EvaluateHubPage(){
 const [players,setPlayers]=useState<Player[]>([]);
 const [error,setError]=useState("");
 useEffect(()=>{void authenticatedFetch("/api/trainer/players").then(async r=>{const p=await r.json();if(!r.ok)throw new Error(p.error);setPlayers(p.players??[])}).catch(e=>setError(e instanceof Error?e.message:"Could not load athletes."));},[]);
 return <main className="players-shell">
  <header className="players-header"><div><p className="eyebrow">EVALUATIONS</p><h1>Evaluate</h1><p className="support-copy">Choose whether this evaluation belongs to a client profile or is a quick camp evaluation.</p></div></header>
  {error&&<p className="auth-error">{error}</p>}
  <section className="evaluation-choice-grid">
   <article className="evaluation-choice-card"><span className="section-kicker">PLAYER EVALUATION</span><h2>Saved client athlete</h2><p>Use the full That&apos;s Tuff evaluation and keep the results with the athlete&apos;s development history.</p><div className="evaluation-player-list">{players.map(p=><Link className="evaluation-athlete-link" href={`/trainer/evaluation/new?playerId=${p.id}`} key={p.id}><strong>{p.preferredName||p.firstName} {p.lastName}</strong><span>{p.developmentFocuses[0]?.focus||"Start evaluation"}</span></Link>)}</div></article>
   <article className="evaluation-choice-card camp-choice"><span className="section-kicker">CAMP / QUICK EVALUATION</span><h2>Evaluate without creating a client</h2><p>Fast 1–2 minute evaluations for camps, clinics, tryouts, and athletes who are not in your client list.</p><Link className="primary-link-button" href="/trainer/evaluate/camp">Start Camp Evaluation</Link></article>
  </section>
 </main>;
}
