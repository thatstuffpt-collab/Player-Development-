"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

type AthleticTest = { id:string; category:string; testKey:string; testName:string; value:number; unit:string; lowerIsBetter:boolean; notes:string|null; testedAt:string };
type ProgressEvent = { id:string; type:string; category:string; title:string; result:string; spot:string|null; occurredAt:string };
type PlayerDetail = {
  id:string; firstName:string; lastName:string; preferredName:string|null; birthDate:string|null; classYear:number|null; height:string|null; position:string|null; schoolTeam:string|null; yearsPlaying:number|null; playingExperience:string|null; selfReportedNeeds:string|null; trainingLimitations:string|null;
  goals:Array<{id:string;title:string;type:string;status:string;completedAt?:string|null}>;
  developmentFocuses:Array<{id:string;focus:string;completedAt:string|null}>;
  evaluations:Array<{id:string;evaluatedAt:string;priorityAreas:string[];shortTermGoal:string|null}>;
  achievements:Array<{id:string;title:string;achievedAt:string}>;
  assignedWork:Array<{id:string;title:string;status:string}>;
  trainerNotes:Array<{id:string;body:string;createdAt:string}>;
  coachTags:Array<{id:string;label:string}>;
  progressEvents:ProgressEvent[];
  athleticTests:AthleticTest[];
};

type WorkspaceTab = "overview"|"plan"|"results"|"history";

const testOptions = [
  ["vertical-jump","Vertical Jump"],["broad-jump","Broad Jump"],["10-yard-sprint","10-Yard Sprint"],["20-yard-sprint","20-Yard Sprint"],
  ["5-10-5-shuttle","5-10-5 Shuttle"],["lane-agility","Lane Agility"],["push-ups","Push-Ups"],["squat","Squat"],
  ["conditioning-time","Conditioning Test"],["mobility-score","Movement Score"],["custom","Custom Test"],
];

function numericResult(value:string) {
  const fraction=value.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (fraction) return Number(fraction[2]) ? (Number(fraction[1])/Number(fraction[2]))*100 : null;
  const match=value.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function MiniTrend({values}:{values:number[]}) {
  if (values.length < 2) return <span className="support-copy">Add another test to show a trend.</span>;
  const min=Math.min(...values), max=Math.max(...values), range=max-min || 1;
  const points=values.map((v,i)=>`${(i/(values.length-1))*100},${36-((v-min)/range)*32}`).join(" ");
  return <svg className="mini-trend" viewBox="0 0 100 40" preserveAspectRatio="none" aria-label="Progress trend"><polyline points={points} fill="none" stroke="currentColor" strokeWidth="3" vectorEffect="non-scaling-stroke" /></svg>;
}

export default function PlayerProfilePage() {
  const params=useParams<{id:string}>();
  const router=useRouter();
  const [player,setPlayer]=useState<PlayerDetail|null>(null);
  const [tab,setTab]=useState<WorkspaceTab>("overview");
  const [editing,setEditing]=useState(false);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const [newGoal,setNewGoal]=useState("");
  const [newTag,setNewTag]=useState("");
  const [newNote,setNewNote]=useState("");
  const [resultView,setResultView]=useState<"athletic"|"basketball">("athletic");
  const [testKey,setTestKey]=useState("vertical-jump");
  const [testValue,setTestValue]=useState("");
  const [customName,setCustomName]=useState("");
  const [customCategory,setCustomCategory]=useState("Speed");
  const [customUnit,setCustomUnit]=useState("sec");
  const [testNotes,setTestNotes]=useState("");

  async function fetchPlayer(){const r=await authenticatedFetch(`/api/trainer/players/${params.id}`);const p=await r.json();if(!r.ok)throw new Error(p.error??"Could not load player.");return p.player as PlayerDetail;}
  async function refresh(){setPlayer(await fetchPlayer());}
  useEffect(()=>{let cancelled=false;fetchPlayer().then(p=>!cancelled&&setPlayer(p)).catch(e=>!cancelled&&setError(e instanceof Error?e.message:"Could not load player."));return()=>{cancelled=true}},[params.id]);

  async function saveProfile(e:FormEvent<HTMLFormElement>){e.preventDefault();setSaving(true);setError("");try{const r=await authenticatedFetch(`/api/trainer/players/${params.id}`,{method:"PATCH",body:JSON.stringify(Object.fromEntries(new FormData(e.currentTarget).entries()))});const p=await r.json();if(!r.ok)throw new Error(p.error??"Could not save player.");await refresh();setEditing(false)}catch(e){setError(e instanceof Error?e.message:"Could not save player.")}finally{setSaving(false)}}
  async function action(body:Record<string,unknown>){const r=await authenticatedFetch(`/api/trainer/players/${params.id}`,{method:"PATCH",body:JSON.stringify(body)});const p=await r.json();if(!r.ok)throw new Error(p.error??"Could not save change.");await refresh()}
  async function addGoal(){if(!newGoal.trim())return;try{await action({action:"addGoal",title:newGoal,type:"DEVELOPMENT"});setNewGoal("")}catch(e){setError(e instanceof Error?e.message:"Could not add goal.")}}
  async function addTag(){if(!newTag.trim())return;try{await action({action:"addTag",label:newTag});setNewTag("")}catch(e){setError(e instanceof Error?e.message:"Could not add tag.")}}
  async function addNote(){if(!newNote.trim())return;try{await action({action:"addNote",body:newNote});setNewNote("")}catch(e){setError(e instanceof Error?e.message:"Could not add note.")}}
  async function archivePlayer(){if(!confirm("Archive this player? Their history will stay in the database."))return;const r=await authenticatedFetch(`/api/trainer/players/${params.id}`,{method:"DELETE"});if(r.ok)router.replace("/trainer/players")}
  async function deletePlayer(){if(!confirm("Permanently delete this player and ALL sessions, evaluations, goals, notes, results and testing history? This cannot be undone."))return;if(!confirm("Final confirmation: permanently delete this player?"))return;const r=await authenticatedFetch(`/api/trainer/players/${params.id}?permanent=true`,{method:"DELETE"});const p=await r.json();if(!r.ok){setError(p.error??"Could not delete player.");return}router.replace("/trainer/players")}
  async function saveAthleticTest(e:FormEvent){e.preventDefault();setSaving(true);setError("");try{const r=await authenticatedFetch(`/api/trainer/players/${params.id}/athletic-tests`,{method:"POST",body:JSON.stringify({testKey,testName:testKey==="custom"?customName:undefined,category:customCategory,unit:customUnit,value:testValue,notes:testNotes,lowerIsBetter:testKey==="custom"&&["sec","time"].includes(customUnit.toLowerCase())})});const p=await r.json();if(!r.ok)throw new Error(p.error??"Could not save test.");setTestValue("");setTestNotes("");await refresh()}catch(e){setError(e instanceof Error?e.message:"Could not save test.")}finally{setSaving(false)}}

  const athleticGroups=useMemo(()=>{const map=new Map<string,AthleticTest[]>();for(const t of player?.athleticTests??[]){const list=map.get(t.testKey)??[];list.push(t);map.set(t.testKey,list)}return [...map.values()]},[player]);
  const basketballGroups=useMemo(()=>{const map=new Map<string,ProgressEvent[]>();for(const e of player?.progressEvents??[]){if(!["SHOOTING_RESULT","DRIBBLING_RESULT","DRILL_PROGRESSION"].includes(e.type)||numericResult(e.result)===null)continue;const key=`${e.type}|${e.title}|${e.spot??""}`;const list=map.get(key)??[];list.push(e);map.set(key,list)}return [...map.values()]},[player]);

  if(!player)return <main className="players-shell"><p className="eyebrow">ATHLETE WORKSPACE</p><h1>{error?"Could not load athlete":"Loading athlete…"}</h1>{error&&<p className="auth-error">{error}</p>}</main>;

  const currentFocus=player.developmentFocuses.find(x=>!x.completedAt)?.focus;
  const latestEvaluation=player.evaluations[0];
  const activeGoals=player.goals.filter(g=>g.status==="ACTIVE");
  const recentResult=player.progressEvents[0];
  const timeline=[
    ...player.evaluations.map(x=>({date:x.evaluatedAt,title:"Formal Evaluation",detail:x.shortTermGoal||x.priorityAreas.join(" · ")})),
    ...player.progressEvents.map(x=>({date:x.occurredAt,title:x.title,detail:x.result})),
    ...player.athleticTests.map(x=>({date:x.testedAt,title:x.testName,detail:`${x.value} ${x.unit}`})),
    ...player.achievements.map(x=>({date:x.achievedAt,title:"Achievement",detail:x.title})),
  ].sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime());

  return <main className="players-shell">
    <header className="players-header athlete-workspace-header">
      <div><Link className="back-link" href="/trainer/players">← All athletes</Link><p className="eyebrow">ATHLETE WORKSPACE</p><h1>{player.preferredName||player.firstName} {player.lastName}</h1><p className="support-copy">{[player.position,player.schoolTeam,player.classYear?`Class of ${player.classYear}`:null].filter(Boolean).join(" · ")||"Development profile"}</p></div>
      <div className="profile-actions"><Link className="primary-link-button" href={`/trainer/players/${player.id}/session`}>Start Session</Link>{player.evaluations.length?<Link className="ghost-link-button" href={`/trainer/evaluation/reevaluate?playerId=${player.id}`}>Reevaluate</Link>:<Link className="ghost-link-button" href={`/trainer/evaluation/new?playerId=${player.id}`}>Evaluate</Link>}<button className="ghost-button" onClick={()=>setEditing(v=>!v)}>{editing?"Close edit":"Edit athlete"}</button></div>
    </header>

    {error&&<p className="auth-error">{error}</p>}
    {editing&&<section className="player-create-card"><div className="section-heading"><div><span className="section-kicker">PROFILE DETAILS</span><h2>Edit athlete</h2></div></div><form className="player-create-grid" onSubmit={saveProfile}>
      <label>First name<input name="firstName" defaultValue={player.firstName} required/></label><label>Last name<input name="lastName" defaultValue={player.lastName} required/></label><label>Preferred name<input name="preferredName" defaultValue={player.preferredName??""}/></label><label>Date of birth<input name="birthDate" type="date" defaultValue={player.birthDate?.slice(0,10)??""}/></label><label>Class year<input name="classYear" defaultValue={player.classYear??""}/></label><label>Height<input name="height" defaultValue={player.height??""}/></label><label>Position<input name="position" defaultValue={player.position??""}/></label><label>School / team<input name="schoolTeam" defaultValue={player.schoolTeam??""}/></label><label>Years playing<input name="yearsPlaying" defaultValue={player.yearsPlaying??""}/></label><label className="full-field">Basketball experience<textarea name="playingExperience" defaultValue={player.playingExperience??""}/></label><label className="full-field">Development needs<textarea name="selfReportedNeeds" defaultValue={player.selfReportedNeeds??""}/></label><label className="full-field">Training limitations<textarea name="trainingLimitations" defaultValue={player.trainingLimitations??""}/></label><button className="primary-button" disabled={saving}>Save profile</button>
    </form><div className="danger-zone"><button className="danger-text-button" onClick={archivePlayer}>Archive athlete</button><button className="danger-button" onClick={deletePlayer}>Delete permanently</button></div></section>}

    <nav className="athlete-workspace-tabs" aria-label="Athlete workspace views">
      {(["overview","plan","results","history"] as WorkspaceTab[]).map(item=><button key={item} className={tab===item?"active-workspace-tab":""} onClick={()=>setTab(item)}>{item[0].toUpperCase()+item.slice(1)}</button>)}
    </nav>

    {tab==="overview"&&<div className="workspace-stack">
      <section className="profile-summary-grid"><article className="profile-summary-card highlight-card"><span>Current development focus</span><strong>{currentFocus??"Not set yet"}</strong></article><article className="profile-summary-card"><span>Active goals</span><strong>{activeGoals.length}</strong></article><article className="profile-summary-card"><span>Recent result</span><strong>{recentResult?`${recentResult.title}: ${recentResult.result}`:"No result logged yet"}</strong></article><article className="profile-summary-card"><span>Latest evaluation</span><strong>{latestEvaluation?new Date(latestEvaluation.evaluatedAt).toLocaleDateString():"Not completed"}</strong></article></section>
      <section className="profile-content-grid"><article className="session-card"><div className="section-heading"><div><span className="section-kicker">NEXT ACTION</span><h2>Ready to coach</h2></div></div><p className="support-copy">Open the live session workspace with the athlete&apos;s current focus and recent evidence already in context.</p><Link className="primary-link-button" href={`/trainer/players/${player.id}/session`}>Start Session</Link></article>
      <article className="session-card"><div className="section-heading"><div><span className="section-kicker">DEVELOPMENT PLAN</span><h2>Current priorities</h2></div></div>{latestEvaluation?<><p><strong>{latestEvaluation.priorityAreas.join(" · ")||"No priorities saved"}</strong></p><p className="support-copy">{latestEvaluation.shortTermGoal||"No short-term goal saved."}</p></>:<p className="support-copy">Complete the first evaluation to establish development priorities.</p>}<button className="ghost-button" onClick={()=>setTab("plan")}>Open Plan</button></article></section>
      <section className="session-card"><div className="section-heading"><div><span className="section-kicker">COACH REMINDERS</span><h2>Keep in mind today</h2></div></div><div className="coach-tags">{player.coachTags.length?player.coachTags.map(t=><span className="coach-tag" key={t.id}>{t.label}</span>):<span className="support-copy">No coach reminders saved.</span>}</div></section>
    </div>}

    {tab==="plan"&&<div className="workspace-stack">
      <section className="profile-content-grid"><article className="session-card"><div className="section-heading"><div><span className="section-kicker">GOALS</span><h2>Active development goals</h2></div></div><div className="profile-inline-form"><input value={newGoal} onChange={e=>setNewGoal(e.target.value)} placeholder="Add a new goal..."/><button className="primary-button" onClick={addGoal}>Add Goal</button></div>{activeGoals.length?activeGoals.map(g=><div className="profile-list-row profile-action-row" key={g.id}><strong>{g.title}</strong><button className="ghost-button" onClick={()=>action({action:"completeGoal",goalId:g.id})}>✓ Complete</button></div>):<p className="support-copy">No active development goals.</p>}</article>
      <article className="session-card"><div className="section-heading"><div><span className="section-kicker">CURRENT FOCUS</span><h2>Development direction</h2></div></div><p><strong>{currentFocus??"No active development focus"}</strong></p>{latestEvaluation&&<><p className="support-copy">Priorities: {latestEvaluation.priorityAreas.join(" · ")||"None saved"}</p><p className="support-copy">Short-term goal: {latestEvaluation.shortTermGoal||"Not set"}</p></>}</article>
      <article className="session-card"><div className="section-heading"><div><span className="section-kicker">ASSIGNED WORK</span><h2>Work outside sessions</h2></div></div>{player.assignedWork.length?player.assignedWork.map(w=><div className="profile-list-row" key={w.id}><strong>{w.title}</strong><span>{w.status}</span></div>):<p className="support-copy">No assigned work yet.</p>}</article>
      <article className="session-card"><div className="section-heading"><div><span className="section-kicker">COACH TAGS</span><h2>Quick reminders</h2></div></div><div className="profile-inline-form"><input value={newTag} onChange={e=>setNewTag(e.target.value)} placeholder="Add coach reminder..."/><button className="primary-button" onClick={addTag}>Add Tag</button></div><div className="coach-tags">{player.coachTags.map(t=><button className="coach-tag removable-tag" key={t.id} onClick={()=>action({action:"removeTag",tagId:t.id})}>{t.label} ×</button>)}</div></article></section>
      <section className="session-card"><div className="section-heading"><div><span className="section-kicker">TRAINER ONLY</span><h2>Private notes</h2></div></div><div className="profile-note-form"><textarea rows={3} value={newNote} onChange={e=>setNewNote(e.target.value)} placeholder="Private trainer note..."/><button className="primary-button" onClick={addNote}>Add Private Note</button></div>{player.trainerNotes.slice(0,8).map(n=><div className="profile-list-row" key={n.id}><strong>{n.body}</strong><span>{new Date(n.createdAt).toLocaleDateString()}</span></div>)}</section>
    </div>}

    {tab==="results"&&<section className="results-panel"><div className="section-heading"><div><span className="section-kicker">RESULTS</span><h2>Progress over time</h2></div><small>Objective measurements stay separate from coach ratings</small></div>
      <div className="results-tabs"><button className={resultView==="athletic"?"active-result-tab":""} onClick={()=>setResultView("athletic")}>Athletic Performance</button><button className={resultView==="basketball"?"active-result-tab":""} onClick={()=>setResultView("basketball")}>Basketball Development</button></div>
      {resultView==="athletic"&&<><form className="athletic-test-form" onSubmit={saveAthleticTest}><label>Test<select value={testKey} onChange={e=>setTestKey(e.target.value)}>{testOptions.map(([k,n])=><option value={k} key={k}>{n}</option>)}</select></label>{testKey==="custom"&&<><label>Test name<input value={customName} onChange={e=>setCustomName(e.target.value)} placeholder="Example: Pro Agility"/></label><label>Category<select value={customCategory} onChange={e=>setCustomCategory(e.target.value)}><option>Speed</option><option>Agility / COD</option><option>Vertical / Power</option><option>Strength</option><option>Conditioning</option><option>Mobility / Movement</option><option>Other</option></select></label><label>Unit<input value={customUnit} onChange={e=>setCustomUnit(e.target.value)} placeholder="sec, in, lb, reps"/></label></>}<label>Result<input inputMode="decimal" value={testValue} onChange={e=>setTestValue(e.target.value)} placeholder="Enter number" required/></label><label className="full-field">Test note<input value={testNotes} onChange={e=>setTestNotes(e.target.value)} placeholder="Optional context"/></label><button className="primary-button" disabled={saving}>{saving?"Saving…":"+ Save New Test"}</button></form>
      <div className="result-card-grid">{athleticGroups.length?athleticGroups.map(group=>{const first=group[0],latest=group[group.length-1],best=first.lowerIsBetter?Math.min(...group.map(x=>x.value)):Math.max(...group.map(x=>x.value));const change=latest.value-first.value;return <article className="result-card" key={first.testKey}><span>{first.category}</span><h3>{first.testName}</h3><div className="result-numbers"><div><small>First</small><strong>{first.value} {first.unit}</strong></div><div><small>Latest</small><strong>{latest.value} {latest.unit}</strong></div><div><small>Best</small><strong>{best} {first.unit}</strong></div></div><MiniTrend values={group.map(x=>x.value)}/><p className="result-change">{group.length>1?`${change>0?"+":""}${Number(change.toFixed(2))} ${first.unit} since first test`:"Baseline saved"}</p><details><summary>History ({group.length})</summary>{[...group].reverse().map(x=><div className="test-history-row" key={x.id}><span>{new Date(x.testedAt).toLocaleDateString()}</span><strong>{x.value} {x.unit}</strong></div>)}</details></article>}):<p className="support-copy">No athletic testing yet. Save the first test above to establish a baseline.</p>}</div></>}
      {resultView==="basketball"&&<div className="result-card-grid">{basketballGroups.length?basketballGroups.map(group=>{const first=group[0],latest=group[group.length-1],vals=group.map(x=>numericResult(x.result) as number);return <article className="result-card" key={first.id}><span>{first.category}</span><h3>{first.title}{first.spot?` · ${first.spot}`:""}</h3><div className="result-numbers"><div><small>First</small><strong>{first.result}</strong></div><div><small>Latest</small><strong>{latest.result}</strong></div><div><small>Entries</small><strong>{group.length}</strong></div></div><MiniTrend values={vals}/></article>}):<p className="support-copy">Measurable Quick Logs will build basketball progress here. Repeating the same drill name and spot creates a trend.</p>}</div>}
    </section>}

    {tab==="history"&&<div className="workspace-stack"><section className="session-card"><div className="section-heading"><div><span className="section-kicker">DEVELOPMENT TIMELINE</span><h2>Development history</h2></div><small>Newest activity first</small></div>{timeline.slice(0,50).map((item,index)=><div className="profile-list-row timeline-row" key={`${item.date}-${item.title}-${index}`}><div><strong>{item.title}</strong><p className="support-copy">{item.detail}</p></div><span>{new Date(item.date).toLocaleDateString()}</span></div>)}{!timeline.length&&<p className="support-copy">Development history will appear here as evaluations, results, tests and achievements are saved.</p>}</section>
      <section className="profile-content-grid"><article className="session-card"><div className="section-heading"><div><span className="section-kicker">ACHIEVEMENTS</span><h2>Milestones</h2></div></div>{player.achievements.length?player.achievements.map(a=><div className="profile-list-row" key={a.id}><strong>{a.title}</strong><span>{new Date(a.achievedAt).toLocaleDateString()}</span></div>):<p className="support-copy">No achievements saved yet.</p>}</article><article className="session-card"><div className="section-heading"><div><span className="section-kicker">EVALUATIONS</span><h2>Formal checkpoints</h2></div></div>{player.evaluations.length?player.evaluations.map(e=><div className="profile-list-row" key={e.id}><strong>{e.priorityAreas.join(" · ")||"Evaluation"}</strong><p className="support-copy">{e.shortTermGoal||"No short-term goal saved."}</p><span>{new Date(e.evaluatedAt).toLocaleDateString()}</span></div>):<p className="support-copy">No evaluations saved yet.</p>}</article></section>
    </div>}
  </main>;
}
