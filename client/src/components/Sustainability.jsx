import { useEffect, useRef } from "react";
import { LeafIcon, RecycleIcon, ShieldIcon, PackageIcon, ArrowIcon } from "./Icons.jsx";
import SplitHeading from "./SplitHeading.jsx";
import { gsap, prefersReducedMotion } from "../utils/motion.js";

const POINTS = [
  { icon: LeafIcon, title: "Organic Cotton", subtitle: "Naturally better" },
  { icon: RecycleIcon, title: "Recycled Fabrics", subtitle: "Less waste, more style" },
  { icon: ShieldIcon, title: "Ethical Production", subtitle: "Fair for everyone" },
  { icon: PackageIcon, title: "Eco Packaging", subtitle: "Plastic-free & recyclable" },
];

export default function Sustainability({ content }) {
  const points = content?.points || POINTS;
  const sectionRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const section = sectionRef.current;
    const image = imageRef.current;
    if (!section || !image) return undefined;

    const context = gsap.context(() => {
      gsap.set(image, { scale: 1.15 });
      gsap.fromTo(image,
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    }, section);
    return () => context.revert();
  }, []);

  return (
    <section className="sustainability" ref={sectionRef}>
      <img
        className="sustainability__image"
        ref={imageRef}
        src={content?.image || "https://images.unsplash.com/photo-1600599067176-1f47e3b6fe47?auto=format&fit=crop&w=2000&q=90"}
        alt={content?.alt || "A hiker with a backpack walking through a green mountain landscape"}
        loading="lazy"
      />
      <div className="sustainability__scrim" aria-hidden="true" />

      <div className="sustainability__content">
        <div className="sustainability__intro">
          <p className="eyebrow eyebrow--light reveal-up">{content?.eyebrow || "Sustainability"}</p>
          <SplitHeading className="section-heading section-heading--light">
            {content?.heading || "Style That Respects the Planet"}
          </SplitHeading>
          <p className="sustainability__copy reveal-up stagger-2">
            {content?.description || "We use eco-friendly fabrics, ethical production and sustainable packaging — because great style should never come at the earth's expense."}
          </p>
          <a href={content?.buttonHref || "#/about"} className="btn btn--light reveal-up stagger-3">
            {content?.buttonLabel || "Our Commitment"} <ArrowIcon />
          </a>
        </div>

        <div className="sustainability__grid">
          {points.map(({ title, subtitle }, index) => {
            const Icon = POINTS[index % POINTS.length].icon;
            return (
            <div className={`sustainability__point reveal-up stagger-${(index % 4) + 1}`} key={title}>
              <span className="sustainability__icon">
                <Icon />
              </span>
              <span>
                <p className="sustainability__point-title">{title}</p>
                <p className="sustainability__point-subtitle">{subtitle}</p>
              </span>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
