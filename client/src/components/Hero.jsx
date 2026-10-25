import { useEffect, useRef } from "react";
import { PlayIcon, ArrowIcon } from "./Icons.jsx";
import { gsap, prefersReducedMotion, useMagnetic } from "../utils/motion.js";

export default function Hero({ onWatchVideo, content }) {
  const sectionRef = useRef(null);
  const mediaRef = useRef(null);
  const contentRef = useRef(null);
  const ctaRef = useRef(null);
  const headingLines = (content?.heading || "Modern Fits for a Better Tomorrow").split("\n");

  useMagnetic(ctaRef);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const media = mediaRef.current;
    const copy = contentRef.current;
    const section = sectionRef.current;
    if (!media || !copy || !section) return undefined;

    const context = gsap.context(() => {
      const scroll = { trigger: section, start: "top top", end: "bottom top", scrub: true };
      // fromTo with explicit start values: the preloader briefly sets heroContent
      // to autoAlpha 0 on mount, and a plain .to() would capture that as the
      // scrub's start state — making the content vanish when scrolling back up.
      gsap.fromTo(media, { yPercent: 0 }, { yPercent: 14, ease: "none", immediateRender: false, scrollTrigger: { ...scroll } });
      gsap.fromTo(copy,
        { yPercent: 0, autoAlpha: 1 },
        { yPercent: -16, autoAlpha: 0.25, ease: "none", immediateRender: false, scrollTrigger: { ...scroll } },
      );
    }, section);
    return () => context.revert();
  }, []);

  return (
    <section id="top" className="hero" ref={sectionRef}>
      <div className="hero__media" ref={mediaRef}>
        <img
          className="hero__image"
          src={content?.image || "/hero-banner.jpg"}
          alt={content?.alt || "Streetwear model in a dark hoodie against an urban background"}
          loading="eager"
        />
      </div>
      <div className="hero__scrim" aria-hidden="true" />

      <div className="hero__content" ref={contentRef}>
        <p className="eyebrow eyebrow--light reveal-up">{content?.eyebrow || "New Drop"}</p>
        <h1 className="hero__heading reveal-mask">
          {headingLines.map((line, index) => (
            <span className="hero__line" key={`${line}-${index}`}>
              <span className="hero__line-inner">{line}</span>
            </span>
          ))}
        </h1>
        <p className="hero__subtext reveal-up stagger-2">
          {content?.description || "Timeless styles. Premium comfort. Designed for the dreamers, the doers, and the everyday explorers."}
        </p>
        <div className="hero__actions reveal-up stagger-3">
          <a ref={ctaRef} href={content?.primaryHref || "#new-arrivals"} className="btn btn--light btn--magnetic">
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
