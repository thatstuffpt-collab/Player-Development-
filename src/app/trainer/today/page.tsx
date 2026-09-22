"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

type Player = { id:string; firstName:string; lastName:string; preferredName:string|null; developmentFocuses:Array<{focus:string}> };

export default function TrainerDashboardPage() {
  const [players,setPlayers]=useState<Player[]>([]);
  const [error,setError]=useState("");
  useEffect(()=>{ void authenticatedFetch("/api/trainer/players").then(async r=>{const p=await r.json(); if(!r.ok) throw new Error(p.error); setPlayers(p.players ?? []);}).catch(e=>setError(e instanceof Error?e.message:"Could not load dashboard.")); },[]);
  return <main className="players-shell">
    <header className="players-header"><div><p className="eyebrow">TRAINER DASHBOARD</p><h1>Today</h1><p className="support-copy">Your quick starting point for sessions, evaluations, and athlete follow-up.</p></div></header>
    {error && <p className="auth-error">{error}</p>}
    <section className="profile-summary-grid">
      <article className="profile-summary-card highlight-card"><span>Active athletes</span><strong>{players.length}</strong></article>
      <article className="profile-summary-card"><span>Start a session</span><strong>Choose an athlete below</strong></article>
      <article className="profile-summary-card"><span>Evaluation</span><strong>Baseline or follow-up from athlete profile</strong></article>
      <article className="profile-summary-card"><span>Workflow</span><strong>Review → train → log → wrap up</strong></article>
    </section>
    <section className="player-list-section"><div className="section-heading"><div><span className="section-kicker">QUICK START</span><h2>Choose an athlete</h2></div></div>
      <div className="player-list-grid">{players.map(player=><article className="player-list-card" key={player.id}><Link className="player-card-profile-link" href={`/trainer/players/${player.id}`}><strong>{player.preferredName||player.firstName} {player.lastName}</strong><p>{player.developmentFocuses[0]?.focus || "No current focus set"}</p></Link><div className="dashboard-actions"><Link className="player-session-link" href={`/trainer/players/${player.id}/session`}>Start Session</Link><Link className="ghost-link-button" href={`/trainer/evaluation/new?playerId=${player.id}`}>Evaluate</Link></div></article>)}</div>
    </section>
  </main>;
}
