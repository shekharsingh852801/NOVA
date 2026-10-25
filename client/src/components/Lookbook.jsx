import { useEffect, useRef } from "react";
import { lookbookImages } from "../data/products.js";
import { ArrowIcon } from "./Icons.jsx";
import SplitHeading from "./SplitHeading.jsx";
import { gsap, prefersReducedMotion, useMagnetic } from "../utils/motion.js";

export default function Lookbook({ onShopLook, content }) {
  const images = content?.images || lookbookImages.map((src, index) => ({ src, alt: `NOVA lookbook style ${index + 1}` }));
  const sectionRef = useRef(null);
  const stripRef = useRef(null);
  const ctaRef = useRef(null);

  useMagnetic(ctaRef);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const section = sectionRef.current;
    const strip = stripRef.current;
    if (!section || !strip) return undefined;

    const context = gsap.context(() => {
      gsap.fromTo(strip,
        { xPercent: -3.5 },
        {
          xPercent: 0,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "top 25%", scrub: true },
        },
      );
    }, section);
    return () => context.revert();
  }, []);

  return (
    <section id="lookbook" className="lookbook" ref={sectionRef}>
      <div className="lookbook__intro">
        <p className="eyebrow eyebrow--dark reveal-up">{content?.eyebrow || "Style Inspiration"}</p>
        <SplitHeading className="section-heading section-heading--dark">{content?.heading || "Our Lookbook"}</SplitHeading>
        <p className="lookbook__copy reveal-up stagger-2">
          {content?.description || "Real people. Real style. See how our community styles NOVA in everyday life."}
        </p>
        <button type="button" ref={ctaRef} onClick={onShopLook} className="btn btn--dark btn--magnetic reveal-up stagger-3">
          {content?.buttonLabel || "View Lookbook"} <ArrowIcon />
        </button>
      </div>

      <div className="lookbook__strip" ref={stripRef}>
        {images.map(({ src, alt }, i) => (
          <img key={`${src}-${i}`} className="reveal-up" src={src} alt={alt} loading="lazy" />
        ))}
      </div>
    </section>
  );
}
