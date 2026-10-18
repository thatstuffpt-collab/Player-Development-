import Link from "next/link";

export default function GroupsCampsPage() {
  return (
    <main className="players-shell">
      <header className="players-header">
        <div>
          <p className="eyebrow">GROUP / CAMP WORKSPACE</p>
          <h1>Group Sessions & Camps</h1>
          <p className="support-copy">Plan the workout, print a coach copy, or run quick camp player evaluations from one place.</p>
        </div>
      </header>

      <section className="profile-content-grid">
        <article className="session-card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">PRACTICE PLANNING</span>
              <h2>Group & Camp Practice Plans</h2>
            </div>
          </div>
          <p className="support-copy">Build Section → Drill plans from your Master Drill Library, save them for reuse, and print or save a PDF for other coaches.</p>
          <Link className="primary-link-button" href="/trainer/practice-plans">Open Practice Plans</Link>
        </article>

        <article className="session-card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">CAMP EVALUATIONS</span>
              <h2>Quick Player Evaluations</h2>
            </div>
          </div>
          <p className="support-copy">Evaluate camp athletes quickly without adding them to your recurring-client athlete list.</p>
          <Link className="primary-link-button" href="/trainer/evaluate/camp">Open Camp Evaluations</Link>
        </article>
      </section>
    </main>
  );
}
