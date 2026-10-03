"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

type OpenSession={id:string;scheduledFor:string;startedAt:string|null;createdAt:string};
type Player={
  id:string;
  firstName:string;
  lastName:string;
  preferredName:string|null;
  developmentFocuses:Array<{focus:string}>;
  trainingSessions:OpenSession[];
};

export default function TrainerDashboardPage(){
 const [players,setPlayers]=useState<Player[]>([]);
 const [error,setError]=useState("");
 useEffect(()=>{void authenticatedFetch("/api/trainer/players").then(async r=>{const p=await r.json();if(!r.ok)throw new Error(p.error);setPlayers(p.players??[])}).catch(e=>setError(e instanceof Error?e.message:"Could not load dashboard."));},[]);

 const planned=useMemo(()=>players.filter(p=>p.trainingSessions[0]&&!p.trainingSessions[0].startedAt),[players]);
 const inProgress=useMemo(()=>players.filter(p=>p.trainingSessions[0]?.startedAt),[players]);
 const athleteName=(player:Player)=>`${player.preferredName||player.firstName} ${player.lastName}`;

 return <main className="players-shell">
  <header className="players-header"><div><p className="eyebrow">TRAINER DASHBOARD</p><h1>Today</h1><p className="support-copy">Plan workouts before you leave, start them in the gym, and pick up unfinished sessions without rebuilding anything.</p></div></header>
  {error&&<p className="auth-error">{error}</p>}

  {(planned.length>0||inProgress.length>0)&&<section className="today-schedule-card">
    <div className="section-heading"><div><span className="section-kicker">SESSION QUEUE</span><h2>Ready to coach</h2></div><span className="speed-chip">{planned.length+inProgress.length} open</span></div>
    <div className="player-list-grid">
      {inProgress.map(player=><article className="player-list-card" key={`progress-${player.id}`}>
        <div className="player-card-profile-link"><strong>{athleteName(player)}</strong><p>Session in progress · continue where you left off</p></div>
        <div className="dashboard-actions"><Link className="player-session-link" href={`/trainer/players/${player.id}/session`}>Continue Session</Link></div>
      </article>)}
      {planned.map(player=>{const session=player.trainingSessions[0];return <article className="player-list-card" key={`planned-${player.id}`}>
        <div className="player-card-profile-link"><strong>{athleteName(player)}</strong><p>Planned workout · {new Date(session.scheduledFor).toLocaleString()}</p></div>
        <div className="dashboard-actions"><Link className="player-session-link" href={`/trainer/players/${player.id}/session`}>Open Planned Workout</Link></div>
      </article>})}
    </div>
  </section>}

  <section className="profile-summary-grid">
    <article className="profile-summary-card highlight-card"><span>Active athletes</span><strong>{players.length}</strong></article>
    <article className="profile-summary-card"><span>Planned workouts</span><strong>{planned.length}</strong></article>
    <article className="profile-summary-card"><span>In progress</span><strong>{inProgress.length}</strong></article>
    <article className="profile-summary-card"><span>Workflow</span><strong>Plan → Start → Wrap up</strong></article>
  </section>

  <section className="today-schedule-card"><div className="section-heading"><div><span className="section-kicker">TODAY&apos;S SCHEDULE</span><h2>Sessions</h2></div><span className="speed-chip">Calendar sync next</span></div><p className="support-copy">Planned workout dates now live here. Calendar sync can later place booked sessions into this same view automatically.</p></section>

  <section className="player-list-section"><div className="section-heading"><div><span className="section-kicker">QUICK START</span><h2>Choose an athlete</h2></div><Link className="ghost-link-button" href="/trainer/evaluate">Evaluation Center</Link></div>
   <div className="player-list-grid">{players.map(player=>{const open=player.trainingSessions[0];const action=open?(open.startedAt?"Continue Session":"Open Planned Workout"):"Plan / Start Workout";return <article className="player-list-card" key={player.id}><Link className="player-card-profile-link" href={`/trainer/players/${player.id}`}><strong>{athleteName(player)}</strong><p>{player.developmentFocuses[0]?.focus||"No current focus set"}</p></Link><div className="dashboard-actions"><Link className="player-session-link" href={`/trainer/players/${player.id}/session`}>{action}</Link><Link className="ghost-link-button" href={`/trainer/evaluation/new?playerId=${player.id}`}>Evaluate</Link></div></article>})}</div>
  </section>
 </main>;
}
