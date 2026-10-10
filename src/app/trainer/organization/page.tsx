"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountSignOutButton } from "@/components/auth/account-sign-out-button";
import { authenticatedFetch, getActiveOrganizationId, setActiveOrganizationId } from "@/lib/authenticated-fetch";

type Organization = {
  id: string;
  name: string;
  slug: string;
  role: "OWNER" | "ADMIN" | "TRAINER";
};

type StaffMember = {
  id: string;
  userId: string;
  email: string;
  displayName: string | null;
  role: "OWNER" | "ADMIN" | "TRAINER";
  status: "ACTIVE" | "INVITED";
};

export default function OrganizationPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [name, setName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [error, setError] = useState("");

  const activeOrganization = useMemo(
    () => organizations.find((organization) => organization.id === activeId) ?? null,
    [activeId, organizations],
  );
  const canManageStaff = activeOrganization?.role === "OWNER" || activeOrganization?.role === "ADMIN";

  async function loadStaff() {
    const response = await authenticatedFetch("/api/trainer/organizations/staff");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Could not load organization staff.");
    setStaff(payload.staff ?? []);
  }

  useEffect(() => {
    let cancelled = false;
    void authenticatedFetch("/api/trainer/organizations")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Could not load organizations.");
        return payload;
      })
      .then(async (payload) => {
        if (cancelled) return;
        setOrganizations(payload.organizations ?? []);
        const nextActiveId = getActiveOrganizationId() ?? payload.activeOrganizationId ?? null;
        setActiveId(nextActiveId);
        await loadStaff();
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load organizations.");
      });
    return () => { cancelled = true; };
  }, []);

  function switchOrganization(organizationId: string) {
    setActiveOrganizationId(organizationId);
    router.push("/trainer/today");
    router.refresh();
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
      router.push("/trainer/today");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create organization.");
      setSaving(false);
    }
  }

  async function inviteTrainer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setError("");
    setInviteMessage("");
    try {
      const response = await authenticatedFetch("/api/trainer/organizations/staff", {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not invite trainer.");
      setInviteEmail("");
      setInviteMessage(`${payload.staffMember.email} is connected to this organization. They can sign in with that email to finish account setup.`);
      await loadStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not invite trainer.");
    } finally {
      setInviting(false);
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

      <section className="player-list-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">STAFF</span>
            <h2>{activeOrganization?.name ? `${activeOrganization.name} staff` : "Organization staff"}</h2>
          </div>
          <span className="speed-chip">{staff.length} member{staff.length === 1 ? "" : "s"}</span>
        </div>

        <div className="player-list-grid">
          {staff.map((member) => (
            <article className="player-list-card" key={member.id}>
              <div>
                <strong>{member.displayName || member.email}</strong>
                <p>{member.email} · {member.role === "OWNER" ? "Owner" : member.role === "ADMIN" ? "Admin" : "Trainer"}</p>
              </div>
              <span className="speed-chip">{member.status === "ACTIVE" ? "Active" : "Invited"}</span>
            </article>
          ))}
          {!staff.length && <div className="empty-state">No staff members found for this organization.</div>}
        </div>

        {canManageStaff ? (
          <form className="player-create-grid" onSubmit={inviteTrainer}>
            <label className="full-field">Trainer email<input type="email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="coach@example.com" required /></label>
            <button className="primary-button compact-primary" disabled={inviting}>{inviting ? "Inviting…" : "Invite trainer"}</button>
          </form>
        ) : (
          <p className="support-copy">Only the organization owner or an admin can invite staff.</p>
        )}
        {inviteMessage && <p className="support-copy">{inviteMessage}</p>}
      </section>

      <section className="player-create-card">
        <div className="section-heading">
          <div>
            <span className="section-kicker">ACCOUNT</span>
            <h2>Signed-in account</h2>
          </div>
        </div>
        <p className="support-copy">Log out when you need to switch to another trainer or parent/guardian account.</p>
        <AccountSignOutButton className="ghost-button" />
      </section>
    </main>
  );
}
