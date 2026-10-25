import { useEffect, useRef } from "react";
import { BoxIcon, LeafIcon, TruckIcon, RefreshIcon } from "./Icons.jsx";
import { gsap, prefersReducedMotion } from "../utils/motion.js";

const FEATURES = [
  { icon: BoxIcon, title: "Premium Quality", subtitle: "Crafted to last" },
  { icon: LeafIcon, title: "Sustainable Materials", subtitle: "Better for the planet" },
  { icon: TruckIcon, title: "Free Shipping", subtitle: "On orders over $75" },
  { icon: RefreshIcon, title: "Easy Returns", subtitle: "Hassle-free 30 days" },
];

const MARQUEE_PHRASES = [
  "New Season Essentials",
  "Free Shipping Over $75",
  "Sustainable Fabrics",
  "Members Get Early Access",
  "Easy 30-Day Returns",
];
const MARQUEE_TEXT = `${MARQUEE_PHRASES.join("  ✦  ")}  ✦  `;
const BASE_DURATION = 30;
const MAX_TIME_SCALE = 4;

export default function FeatureBar({ content }) {
  const items = content?.items || FEATURES.map(({ title, subtitle }) => ({ title, subtitle }));
  const marqueeRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const marquee = marqueeRef.current;
    const track = trackRef.current;
    if (!marquee || !track || prefersReducedMotion()) return undefined;

    marquee.classList.add("is-js");
    const tween = gsap.to(track, { xPercent: -50, ease: "none", duration: BASE_DURATION, repeat: -1 });

    let raf = 0;
    let lastY = window.scrollY;
    let lastTime = performance.now();
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const now = performance.now();
        const dt = Math.max(now - lastTime, 1);
        const velocity = Math.abs(window.scrollY - lastY) / dt; // px per ms
        lastY = window.scrollY;
        lastTime = now;
        const timeScale = Math.min(1 + velocity * 3, MAX_TIME_SCALE);
        gsap.to(tween, { timeScale, duration: 0.4, overwrite: true, onComplete: () => {
          gsap.to(tween, { timeScale: 1, duration: 1.2, overwrite: true });
        } });
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
      tween.kill();
      gsap.set(track, { xPercent: 0, timeScale: 1 });
      marquee.classList.remove("is-js");
    };
  }, []);

  return (
    <>
      <section className="feature-bar" aria-label="Store benefits">
        {items.map(({ title, subtitle }, index) => {
          const Icon = FEATURES[index % FEATURES.length].icon;
          return (
          <div className="feature-bar__item" key={title}>
            <span className="feature-bar__icon">
              <Icon />
            </span>
            <span>
              <p className="feature-bar__title">{title}</p>
              <p className="feature-bar__subtitle">{subtitle}</p>
            </span>
          </div>
          );
        })}
      </section>
      <div className="marquee" aria-hidden="true" ref={marqueeRef}>
        <div className="marquee__track" ref={trackRef}>
          {[0, 1].map((copy) => <span key={copy}>{MARQUEE_TEXT}</span>)}
        </div>
      </div>
    </>
  );
}
