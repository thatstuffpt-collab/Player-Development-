const foundationItems = [
  "Player profiles",
  "Goals and development focus",
  "Historical evaluations",
  "Meaningful progression evidence",
  "Achievements and assigned work",
  "Trainer-private notes",
  "Parent/guardian access",
];

export default function Home() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">THAT&apos;S TUFF PERFORMANCE TRAINING</p>
        <h1>Player Development</h1>
        <p className="lede">
          A secure development system built around how athletes actually improve:
          goals, meaningful evidence, evaluation, and the next focus.
        </p>
        <div className="status">
          <span className="dot" aria-hidden="true" />
          Application foundation online
        </div>
      </section>

      <section className="card">
        <h2>MVP foundation</h2>
        <p>
          The first build is establishing the durable player-development model before
          trainer and parent workflows are layered on top.
        </p>
        <ul>
          {foundationItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
