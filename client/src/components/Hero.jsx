import { PlayIcon, ArrowIcon } from "./Icons.jsx";

export default function Hero({ onWatchVideo, content }) {
  const headingLines = (content?.heading || "Modern Fits for a Better Tomorrow").split("\n");
  return (
    <section id="top" className="hero">
      <img
        className="hero__image"
        src={content?.image || "/hero-banner.jpg"}
        alt={content?.alt || "Streetwear model in a dark hoodie against an urban background"}
        loading="eager"
      />
      <div className="hero__scrim" aria-hidden="true" />

      <div className="hero__content">
        <p className="eyebrow eyebrow--light reveal-up">{content?.eyebrow || "New Drop"}</p>
        <h1 className="hero__heading reveal-up stagger-1">
          {headingLines.map((line, index) => <span key={`${line}-${index}`}>{index > 0 && <br />}{line}</span>)}
        </h1>
        <p className="hero__subtext reveal-up stagger-2">
          {content?.description || "Timeless styles. Premium comfort. Designed for the dreamers, the doers, and the everyday explorers."}
        </p>
        <div className="hero__actions reveal-up stagger-3">
          <a href={content?.primaryHref || "#new-arrivals"} className="btn btn--light">
            {content?.primaryLabel || "Shop New Arrivals"} <ArrowIcon />
          </a>
          {(content ? content.secondaryLabel : "Watch Video") && (
            <button className="btn btn--ghost-light" onClick={onWatchVideo}>
              <span className="btn__play"><PlayIcon /></span>
              {content ? content.secondaryLabel : "Watch Video"}
            </button>
          )}
        </div>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span>Scroll Down</span>
        <div className="hero__scroll-line" />
      </div>
    </section>
  );
}
