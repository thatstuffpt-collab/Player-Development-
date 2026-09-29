"use client";

import { FormEvent, useEffect, useState } from "react";
import { authenticatedFetch, getActiveOrganizationId, setActiveOrganizationId } from "@/lib/authenticated-fetch";

type Organization = {
  id: string;
  name: string;
  slug: string;
  role: "OWNER" | "ADMIN" | "TRAINER";
};

export default function OrganizationPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const response = await authenticatedFetch("/api/trainer/organizations");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Could not load organizations.");
    setOrganizations(payload.organizations ?? []);
    setActiveId(getActiveOrganizationId() ?? payload.activeOrganizationId ?? null);
  }

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Could not load organizations."));
  }, []);

  function switchOrganization(organizationId: string) {
    setActiveOrganizationId(organizationId);
    window.location.href = "/trainer/today";
  }

  async function createOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const response = await authenticatedFetch("/api/trainer/organizations", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not create organization.");
      setName("");
      setActiveOrganizationId(payload.organization.id);
      window.location.href = "/trainer/today";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create organization.");
      setSaving(false);
    }
  }

  return (
    <main className="players-shell">
      <header className="players-header">
        <div>
          <p className="eyebrow">ORGANIZATION</p>
          <h1>Your workspace</h1>
          <p className="support-copy">Switch between training organizations without mixing athletes, sessions, or development history.</p>
        </div>
      </header>

      {error && <p className="auth-error">{error}</p>}

      <section className="player-list-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">YOUR ORGANIZATIONS</span>
            <h2>Choose where you&apos;re coaching</h2>
          </div>
        </div>
        <div className="player-list-grid">
          {organizations.map((organization) => {
            const active = organization.id === activeId;
            return (
              <article className="player-list-card" key={organization.id}>
                <div>
                  <strong>{organization.name}</strong>
                  <p>{organization.role === "OWNER" ? "Owner" : organization.role === "ADMIN" ? "Admin" : "Trainer"}{active ? " · Active organization" : ""}</p>
                </div>
                <div className="dashboard-actions">
                  {active ? (
                    <span className="speed-chip">Active</span>
                  ) : (
                    <button className="ghost-button" type="button" onClick={() => switchOrganization(organization.id)}>Switch organization</button>
                  )}
                </div>
              </article>
            );
          })}
          {!organizations.length && !error && <div className="empty-state">No training organizations are connected to this account yet.</div>}
        </div>
      </section>

      <section className="player-create-card">
        <div className="section-heading">
          <div>
            <span className="section-kicker">NEW ORGANIZATION</span>
            <h2>Create a separate training workspace</h2>
          </div>
        </div>
        <p className="support-copy">Use this for a different training business, academy, team, or test organization. Its athletes and training data stay isolated from your other organizations.</p>
        <form className="player-create-grid" onSubmit={createOrganization}>
          <label className="full-field">Organization name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Example: Southside Basketball Academy" required /></label>
          <button className="primary-button compact-primary" disabled={saving}>{saving ? "Creating…" : "Create organization"}</button>
        </form>
      </section>

      <section className="today-schedule-card">
        <div className="section-heading"><div><span className="section-kicker">STAFF</span><h2>Trainer invitations are next</h2></div></div>
        <p className="support-copy">This deployment establishes multi-organization membership and switching first. The next organization step is inviting additional trainers with Owner, Admin, and Trainer permissions.</p>
      </section>
    </main>
  );
}
