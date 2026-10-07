import { PlayIcon, ArrowIcon } from "./Icons.jsx";

export default function Hero({ onWatchVideo }) {
  return (
    <section id="top" className="hero">
      <img
        className="hero__image"
        src="/hero-banner.jpg"
        alt="Streetwear model in a dark hoodie against an urban background"
        loading="eager"
      />
      <div className="hero__scrim" aria-hidden="true" />

      <div className="hero__content">
        <p className="eyebrow eyebrow--light reveal-up">New Drop</p>
        <h1 className="hero__heading reveal-up stagger-1">
          Modern Fits for a<br />
          Better Tomorrow
        </h1>
        <p className="hero__subtext reveal-up stagger-2">
          Timeless styles. Premium comfort. Designed for the dreamers, the doers, and
          the everyday explorers.
        </p>
        <div className="hero__actions reveal-up stagger-3">
          <a href="#new-arrivals" className="btn btn--light">
            Shop New Arrivals <ArrowIcon />
          </a>
          <button className="btn btn--ghost-light" onClick={onWatchVideo}>
            <span className="btn__play">
              <PlayIcon />
            </span>
            Watch Video
          </button>
        </div>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span>Scroll Down</span>
        <div className="hero__scroll-line" />
      </div>
    </section>
  );
}
