"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

type Achievement={id:string;type:string;title:string;description:string|null;achievedAt:string};
type Work={id:string;title:string;description:string|null;status:string;assignedAt:string;dueAt:string|null;completedAt:string|null};
type Player={id:string;firstName:string;lastName:string;preferredName:string|null;achievements:Achievement[];assignedWork:Work[]};

const achievementTypes=["PERSONAL_MILESTONE","TRAINING_MILESTONE","RATING_IMPROVEMENT","TEAM_SELECTION","AWARD","OFFER","CAMP_RECOGNITION","OTHER"];
const pretty=(value:string)=>value.toLowerCase().replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase());

export default function DevelopmentWorkPage(){
 const params=useParams<{id:string}>(); const [player,setPlayer]=useState<Player|null>(null); const [error,setError]=useState(""); const [saving,setSaving]=useState(false);
 async function refresh(){const r=await authenticatedFetch(`/api/trainer/players/${params.id}`);const p=await r.json();if(!r.ok)throw new Error(p.error??"Could not load player.");setPlayer(p.player)}
 useEffect(()=>{refresh().catch(e=>setError(e instanceof Error?e.message:"Could not load player."))},[params.id]);
 async function action(body:Record<string,unknown>){setSaving(true);setError("");try{const r=await authenticatedFetch(`/api/trainer/players/${params.id}`,{method:"PATCH",body:JSON.stringify(body)});const p=await r.json();if(!r.ok)throw new Error(p.error??"Could not save change.");await refresh()}catch(e){setError(e instanceof Error?e.message:"Could not save change.")}finally{setSaving(false)}}
 async function addAchievement(e:FormEvent<HTMLFormElement>){e.preventDefault();const form=e.currentTarget;const d=Object.fromEntries(new FormData(form).entries());await action({action:"addAchievement",...d});form.reset()}
 async function addWork(e:FormEvent<HTMLFormElement>){e.preventDefault();const form=e.currentTarget;const d=Object.fromEntries(new FormData(form).entries());await action({action:"addAssignedWork",...d});form.reset()}
 if(!player)return <main className="players-shell"><h1>{error?"Could not load player":"Loading…"}</h1>{error&&<p className="auth-error">{error}</p>}</main>;
 return <main className="players-shell">
  <header className="players-header"><div><Link className="back-link" href={`/trainer/players/${player.id}`}>← Player profile</Link><p className="eyebrow">DEVELOPMENT WORK</p><h1>{player.preferredName||player.firstName} {player.lastName}</h1><p className="support-copy">Track milestones and development work without losing completed history.</p></div></header>
  {error&&<p className="auth-error">{error}</p>}
  <section className="player-create-card"><div className="section-heading"><div><span className="section-kicker">ACHIEVEMENTS</span><h2>Add milestone</h2></div></div>
   <form className="player-create-grid" onSubmit={addAchievement}><label>Achievement<input name="title" required placeholder="Made varsity team"/></label><label>Type<select name="type" defaultValue="PERSONAL_MILESTONE">{achievementTypes.map(x=><option key={x} value={x}>{pretty(x)}</option>)}</select></label><label>Date<input name="achievedAt" type="date"/></label><label className="full-field">Notes<textarea name="description" rows={2} placeholder="Optional context"/></label><button className="primary-button" disabled={saving}>Add Achievement</button></form>
   <div className="player-list-grid">{player.achievements.map(a=><article className="player-list-card" key={a.id}><strong>{a.title}</strong><p>{pretty(a.type)} · {new Date(a.achievedAt).toLocaleDateString()}</p>{a.description&&<p>{a.description}</p>}<button className="danger-text-button" onClick={()=>confirm("Delete this achievement?")&&action({action:"deleteAchievement",achievementId:a.id})}>Delete</button></article>)}</div>
  </section>
  <section className="player-create-card"><div className="section-heading"><div><span className="section-kicker">ASSIGNED WORK</span><h2>Assign development work</h2></div></div>
   <form className="player-create-grid" onSubmit={addWork}><label>Workout / assignment<input name="title" required placeholder="HandleMaster Week 1"/></label><label>Due date<input name="dueAt" type="date"/></label><label className="full-field">Instructions<textarea name="description" rows={3} placeholder="Sets, reps, focus, or workout instructions"/></label><button className="primary-button" disabled={saving}>Assign Work</button></form>
   <div className="player-list-grid">{player.assignedWork.filter(w=>w.status!=="ARCHIVED").map(w=><article className="player-list-card" key={w.id}><strong>{w.title}</strong><p>{pretty(w.status)}{w.dueAt?` · Due ${new Date(w.dueAt).toLocaleDateString()}`:""}</p>{w.description&&<p>{w.description}</p>}<div className="profile-actions">{w.status!=="IN_PROGRESS"&&w.status!=="COMPLETED"&&<button className="ghost-button" onClick={()=>action({action:"updateAssignedWork",workId:w.id,status:"IN_PROGRESS"})}>Start</button>}{w.status!=="COMPLETED"&&<button className="primary-button" onClick={()=>action({action:"updateAssignedWork",workId:w.id,status:"COMPLETED"})}>Complete</button>}{w.status==="COMPLETED"&&<button className="ghost-button" onClick={()=>action({action:"updateAssignedWork",workId:w.id,status:"ASSIGNED"})}>Reopen</button>}<button className="danger-text-button" onClick={()=>confirm("Delete this assigned work permanently?")&&action({action:"deleteAssignedWork",workId:w.id})}>Delete</button></div></article>)}</div>
  </section>
 </main>
}
