import Icon from "~/components/icon";

export default function Home() {
  return (
    <main className="hero" aria-labelledby="launch-title">
      <div className="hero__inner">
        <span className="hero__eyebrow">
          <b>Phase 01</b>
          building the stage
        </span>
        <h1 id="launch-title" className="hero__title">
          A learning
          <br />
          platform that <em>moves</em>.
        </h1>
        <p className="hero__sub">
          A living reimagining of Zedu: silk, glass, a WebGL vortex and a room
          that answers back. The full experience is arriving in the next phase.
        </p>
        <div className="hero__actions">
          <a className="btn btn--primary" href="#status">
            Follow the build <Icon name="arrow" />
          </a>
        </div>
        <p className="hero__hint" id="status">
          Foundation committed · landing experience next
        </p>
      </div>
    </main>
  );
}
