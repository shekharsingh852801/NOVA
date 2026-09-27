import { PlayIcon, ArrowIcon } from "./Icons.jsx";

export default function Hero() {
  return (
    <section id="top" className="hero">
      <img
        className="hero__image"
        src="https://images.unsplash.com/photo-1618920127003-86312e46397d?auto=format&fit=crop&w=2000&q=90"
        alt="Streetwear model in a dark hoodie against an urban background"
        loading="eager"
      />
      <div className="hero__scrim" aria-hidden="true" />

      <div className="hero__content">
        <p className="eyebrow eyebrow--light">New Drop</p>
        <h1 className="hero__heading">
          Modern Fits for a<br />
          Better Tomorrow
        </h1>
        <p className="hero__subtext">
          Timeless styles. Premium comfort. Designed for the dreamers, the doers, and
          the everyday explorers.
        </p>
        <div className="hero__actions">
          <a href="#new-arrivals" className="btn btn--light">
            Shop New Arrivals <ArrowIcon />
          </a>
          <button className="btn btn--ghost-light">
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
