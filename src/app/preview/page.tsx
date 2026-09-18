export default function PreviewIndexPage() {
  const samples = [
    { href: "/preview/session", title: "Training Session", text: "Session focus, coach tags, practice plan, last meaningful result, goals, and Quick Log." },
    { href: "/preview/baseline", title: "New Athlete Baseline", text: "Athlete intake, 12-category baseline evaluation, and first development plan." },
    { href: "/preview/reevaluation", title: "Reevaluation", text: "Previous ratings, evidence since the last evaluation, new ratings, and updated development priorities." },
  ];

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">THAT&apos;S TUFF PLAYER DEVELOPMENT</p>
        <h1>Build Preview</h1>
        <p className="lede">These screens use sample athlete data so you can review the workflow and design without exposing real client information.</p>
      </section>

      <section className="preview-grid">
        {samples.map((sample) => (
          <a className="preview-card" href={sample.href} key={sample.href}>
            <span>Sample</span>
            <strong>{sample.title}</strong>
            <p>{sample.text}</p>
          </a>
        ))}
      </section>
    </main>
  );
}
