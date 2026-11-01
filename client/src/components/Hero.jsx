import { useEffect, useRef, useState } from "react";
import { PlayIcon, ArrowIcon, ChevronIcon } from "./Icons.jsx";
import { gsap, prefersReducedMotion, useMagnetic } from "../utils/motion.js";

const fallbackLaunchSlides = [
  {
    image: "https://images.unsplash.com/photo-1581322929500-043ae5f512d5?auto=format&fit=crop&w=2000&q=85",
    alt: "Model wearing a cropped hoodie",
    eyebrow: "New Arrival",
    heading: "Meet the Studio\nCropped Hoodie",
    description: "An easy cropped layer with a clean neckline and brushed interior, made for everyday comfort.",
    primaryLabel: "Shop the Hoodie",
    primaryHref: "#/product/studio-cropped-hoodie",
  },
  {
    image: "https://images.unsplash.com/photo-1789938581122-d2af11a5d55a?auto=format&fit=crop&w=2000&q=85",
    alt: "Model wearing utility cargo trousers",
    eyebrow: "New Arrival",
    heading: "Utility, Made\nfor Every Day",
    description: "Durable cotton twill, considered utility details, and a straight fit built for everyday wear.",
    primaryLabel: "Shop Utility Trousers",
    primaryHref: "#/product/utility-cargo-trouser",
  },
  {
    image: "https://images.unsplash.com/photo-1790267462668-0519505ea776?auto=format&fit=crop&w=2000&q=85",
    alt: "Everyday heavyweight cotton tee",
    eyebrow: "New Arrival",
    heading: "A Better Everyday\nStarts Here",
    description: "A substantial 220 gsm organic cotton tee with a relaxed fit and a clean, considered finish.",
    primaryLabel: "Shop the Tee",
    primaryHref: "#/product/everyday-heavyweight-tee",
  },
];

export default function Hero({ onWatchVideo, content }) {
  const sectionRef = useRef(null);
  const mediaRef = useRef(null);
  const contentRef = useRef(null);
  const slideCopyRef = useRef(null);
  const ctaRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const firstSlide = {
    image: content?.image || "/hero-banner.jpg",
    alt: content?.alt || "Streetwear model in a dark hoodie against an urban background",
    eyebrow: content?.eyebrow || "New Drop",
    heading: content?.heading || "Modern Fits for a\nBetter Tomorrow",
    description: content?.description || "Timeless styles. Premium comfort. Designed for the dreamers, the doers, and the everyday explorers.",
    primaryLabel: content?.primaryLabel || "Shop New Arrivals",
    primaryHref: content?.primaryHref || "#new-arrivals",
    secondaryLabel: content ? content.secondaryLabel : "Watch Video",
  };
  const slides = [
    firstSlide,
    ...(Array.isArray(content?.slides) ? content.slides : fallbackLaunchSlides),
  ];
  const activeIndex = activeSlide % slides.length;
  const currentSlide = slides[activeIndex];
  const headingLines = currentSlide.heading.split("\n");

  useMagnetic(ctaRef);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const timeout = window.setTimeout(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % slides.length);
    }, 3000);
    return () => window.clearTimeout(timeout);
  }, [activeSlide, slides.length]);

  useEffect(() => {
    const copy = slideCopyRef.current;
    if (!copy) return;
    copy.classList.remove("hero__slide-copy--enter");
    void copy.offsetWidth;
    copy.classList.add("hero__slide-copy--enter");
  }, [activeIndex]);

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
    <section id="top" className="hero" ref={sectionRef} aria-label="Homepage hero" aria-roledescription="carousel">
      <div className="hero__media" ref={mediaRef}>
        {slides.map((slide, index) => (
          <img
            className={`hero__image${activeIndex === index ? " hero__image--active" : ""}`}
            key={`hero-image-${index}`}
            src={slide.image}
            alt={activeIndex === index ? slide.alt : ""}
            aria-hidden={activeIndex !== index}
            loading={activeIndex === index ? "eager" : "lazy"}
          />
        ))}
      </div>
      <div className="hero__scrim" aria-hidden="true" />

      <div className="hero__content" ref={contentRef}>
        <div className="hero__slide-copy hero__slide-copy--enter" ref={slideCopyRef}>
          <p className="eyebrow eyebrow--light reveal-up is-revealed">{currentSlide.eyebrow}</p>
          <h1 className="hero__heading reveal-mask is-revealed">
            {headingLines.map((line, index) => (
              <span className="hero__line" key={`${line}-${index}`}>
                <span className="hero__line-inner">{line}</span>
              </span>
            ))}
          </h1>
          <p className="hero__subtext reveal-up stagger-2 is-revealed">
            {currentSlide.description}
          </p>
          <div className="hero__actions reveal-up stagger-3 is-revealed">
            <a ref={ctaRef} href={currentSlide.primaryHref} className="btn btn--light btn--magnetic">
              {currentSlide.primaryLabel} <ArrowIcon />
            </a>
            {currentSlide.secondaryLabel && (
              <button className="btn btn--ghost-light" onClick={onWatchVideo}>
                <span className="btn__play"><PlayIcon /></span>
                {currentSlide.secondaryLabel}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="hero__controls" role="group" aria-label="Hero banner controls">
        <button
          className="hero__control"
          type="button"
          aria-label="Previous banner"
          onClick={() => setActiveSlide((activeIndex - 1 + slides.length) % slides.length)}
        >
          <ChevronIcon direction="left" />
        </button>
        <div className="hero__indicators" role="group" aria-label="Choose a banner">
          {slides.map((slide, index) => (
            <button
              className={`hero__indicator${activeIndex === index ? " hero__indicator--active" : ""}`}
              key={`hero-indicator-${index}`}
              type="button"
              aria-label={`Show banner ${index + 1}`}
              aria-current={activeIndex === index ? "true" : undefined}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>
        <button
          className="hero__control"
          type="button"
          aria-label="Next banner"
          onClick={() => setActiveSlide((activeIndex + 1) % slides.length)}
        >
          <ChevronIcon direction="right" />
        </button>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span>Scroll Down</span>
        <div className="hero__scroll-line" />
      </div>
    </section>
  );
}
