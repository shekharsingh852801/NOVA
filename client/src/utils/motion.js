import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function hasFinePointer() {
  return window.matchMedia("(pointer: fine)").matches;
}

/**
 * Magnetic pointer-follow for call-to-action elements.
 * The element drifts toward the cursor (capped) while hovered and
 * springs back on leave. No-op for reduced motion or coarse pointers.
 */
export function useMagnetic(ref, { strength = 0.3, maxShift = 8 } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !hasFinePointer()) return undefined;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;

    const apply = () => {
      raf = 0;
      el.style.transform = `translate3d(${targetX.toFixed(1)}px, ${targetY.toFixed(1)}px, 0)`;
    };
    const requestApply = () => {
      if (!raf) raf = window.requestAnimationFrame(apply);
    };
    const onMove = (event) => {
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      targetX = Math.max(-maxShift, Math.min(maxShift, dx * strength));
      targetY = Math.max(-maxShift, Math.min(maxShift, dy * strength));
      requestApply();
    };
    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      requestApply();
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (raf) window.cancelAnimationFrame(raf);
      el.style.transform = "";
    };
  }, [ref, strength, maxShift]);
}
