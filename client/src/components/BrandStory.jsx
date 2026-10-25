import { useEffect, useRef, useState } from "react";
import { ArrowIcon } from "./Icons.jsx";
import SplitHeading from "./SplitHeading.jsx";
import { useMagnetic } from "../utils/motion.js";

const STATS = [
  { value: "50K+", label: "Happy Customers" },
  { value: "4.8/5", label: "Average Rating" },
  { value: "100+", label: "Designs & Styles" },
  { value: "5", label: "Years of Impact" },
];

const COUNT_DURATION = 1400;

function parseStatValue(value) {
  const match = /^([\d.,]+)\s*(.*)$/.exec(String(value));
  if (!match) return null;
  const num = Number.parseFloat(match[1].replace(/,/g, ""));
  if (!Number.isFinite(num)) return null;
  const decimals = (match[1].split(".")[1] || "").length;
  return { num, decimals, suffix: match[2] };
}

export default function BrandStory({ content }) {
  const stats = content?.stats || STATS;
  const statsRef = useRef(null);
  const ctaRef = useRef(null);
  // null = idle (render final values); 0..1 = counting progress
  const [progress, setProgress] = useState(null);

  useMagnetic(ctaRef);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    let raf = 0;
    let started = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        const startTime = performance.now();
        const tick = (now) => {
          const linear = Math.min((now - startTime) / COUNT_DURATION, 1);
          setProgress(1 - Math.pow(1 - linear, 3));
          if (linear < 1) raf = window.requestAnimationFrame(tick);
        };
        raf = window.requestAnimationFrame(tick);
        observer.disconnect();
      });
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const renderStat = (value) => {
    if (progress === null) return value;
    const parsed = parseStatValue(value);
    if (!parsed) return value;
    return `${(parsed.num * progress).toFixed(parsed.decimals)}${parsed.suffix}`;
  };

  return (
    <section id="about" className="brand-story">
      <div className="brand-story__media reveal-clip">
        <img
          src={content?.image || "https://images.unsplash.com/photo-1552334488-bec0803d3c5b?auto=format&fit=crop&w=1200&q=90"}
          alt={content?.alt || "Two friends in casual streetwear sharing a bench"}
          loading="lazy"
        />
      </div>

      <div className="brand-story__content">
        <div className="brand-story__intro">
          <p className="eyebrow eyebrow--light reveal-up">{content?.eyebrow || "Our Story"}</p>
          <SplitHeading className="section-heading section-heading--light">{content?.heading || "More Than Just Clothing"}</SplitHeading>
          <p className="brand-story__copy reveal-up stagger-2">
            {content?.description || "We started NOVA with a simple belief — that what you wear should mean something. Our designs are inspired by real people, real stories and a better future."}
          </p>
          <a ref={ctaRef} href={content?.buttonHref || "#/about"} className="btn btn--light btn--magnetic reveal-up stagger-3">
            {content?.buttonLabel || "Our Journey"} <ArrowIcon />
          </a>
        </div>

        <div className="brand-story__stats" ref={statsRef}>
          {stats.map((stat) => (
            <div className="brand-story__stat" key={stat.label}>
              <p className="brand-story__stat-value">{renderStat(stat.value)}</p>
              <p className="brand-story__stat-label">{stat.label}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
