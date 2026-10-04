import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function PagePreloader() {
  const rootRef = useRef(null);
  const [visible, setVisible] = useState(true);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const body = document.body;
    const html = document.documentElement;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPadding = body.style.paddingRight;
    const previousHtmlOverflow = html.style.overflow;
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    const heroImage = document.querySelector(".hero__image");
    const heroContent = document.querySelector(".hero__content");
    const navbarLogo = document.querySelector(".navbar__logo");
    const brand = root.querySelector(".page-preloader__brand");
    const tagline = root.querySelector(".page-preloader__tagline");
    const panels = root.querySelectorAll(".page-preloader__panel");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const blurAmount = window.matchMedia("(max-width: 680px)").matches ? 2 : 5;
    let disposed = false;
    let finished = false;
    let imageTimeout;
    let shutterDelayTimeout;
    let onImageLoad;
    let onImageError;
    let resolveImageReady;

    const restoreScroll = () => {
      body.style.overflow = previousBodyOverflow;
      body.style.paddingRight = previousBodyPadding;
      html.style.overflow = previousHtmlOverflow;
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      restoreScroll();
      setVisible(false);
    };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `calc(${previousBodyPadding || "0px"} + ${scrollbarWidth}px)`;
    }

    const context = gsap.context(() => {
      if (reducedMotion) {
        gsap.set([brand, tagline], { autoAlpha: 1 });
        gsap.to(root, { autoAlpha: 0, duration: 0.18, ease: "power1.out", onComplete: finish });
        return;
      }

      if (heroImage) gsap.set(heroImage, { scale: 1.04, filter: `blur(${blurAmount}px)` });
      if (heroContent) gsap.set(heroContent, { autoAlpha: 0, y: 8 });

      const imageReady = new Promise((resolve) => {
        resolveImageReady = resolve;
      });
      const markImageReady = () => {
        if (imageTimeout) window.clearTimeout(imageTimeout);
        if (heroImage && onImageLoad) heroImage.removeEventListener("load", onImageLoad);
        if (heroImage && onImageError) heroImage.removeEventListener("error", onImageError);
        resolveImageReady?.();
      };

      if (!heroImage || heroImage.complete) {
        markImageReady();
      } else {
        onImageLoad = markImageReady;
        onImageError = markImageReady;
        heroImage.addEventListener("load", onImageLoad, { once: true });
        heroImage.addEventListener("error", onImageError, { once: true });
        imageTimeout = window.setTimeout(markImageReady, 700);
        if (typeof heroImage.decode === "function") {
          heroImage.decode().then(markImageReady, () => {
            if (heroImage.complete) markImageReady();
          });
        }
      }

      gsap.fromTo(brand,
        { autoAlpha: 0, filter: "blur(5px)", scale: 1.04, letterSpacing: "0.15em" },
        { autoAlpha: 1, filter: "blur(0px)", scale: 1, letterSpacing: "0.07em", duration: 0.32, delay: 0.15, ease: "power3.out" },
      );
      gsap.fromTo(tagline,
        { autoAlpha: 0, y: 7, filter: "blur(3px)" },
        { autoAlpha: 0.72, y: 0, filter: "blur(0px)", duration: 0.34, delay: 0.3, ease: "power2.out" },
      );

      const introElapsed = new Promise((resolve) => {
        shutterDelayTimeout = window.setTimeout(resolve, 400);
      });
      Promise.all([imageReady, introElapsed]).then(() => {
        if (disposed) return;
        context.add(() => {
          const brandRect = brand.getBoundingClientRect();
          const logoRect = navbarLogo?.getBoundingClientRect();
          const target = logoRect && brandRect.width
            ? {
                x: logoRect.left + logoRect.width / 2 - (brandRect.left + brandRect.width / 2),
                y: logoRect.top + logoRect.height / 2 - (brandRect.top + brandRect.height / 2),
                scale: logoRect.width / brandRect.width,
              }
            : { x: 0, y: 0, scale: 1 };

          const timeline = gsap.timeline({ onComplete: finish });
          timeline.to(panels[0], { yPercent: -108, duration: 0.7, ease: "power3.inOut" }, 0);
          timeline.to(panels[1], { yPercent: -108, duration: 0.76, ease: "power2.inOut" }, 0.08);
          timeline.to(panels[2], { yPercent: -108, duration: 0.81, ease: "power3.inOut" }, 0.15);
          if (heroImage) {
            timeline.to(heroImage, { scale: 1, filter: "blur(0px)", duration: 0.48, ease: "power2.out" }, 0.42);
          }
          if (heroContent) {
            timeline.to(heroContent, { autoAlpha: 1, y: 0, duration: 0.24, ease: "power2.out" }, 0.68);
          }
          timeline.to(tagline, { autoAlpha: 0, y: -4, duration: 0.16, ease: "power1.out" }, 0.8);
          timeline.to(brand, {
            x: target.x * 0.55,
            y: target.y * 0.55 - 12,
            scale: 1 + (target.scale - 1) * 0.55,
            duration: 0.14,
            ease: "power2.in",
          }, 0.96);
          timeline.to(brand, { ...target, letterSpacing: "0.04em", duration: 0.17, ease: "power3.out" }, 1.1);
          timeline.to(root, { autoAlpha: 0, duration: 0.12, ease: "power1.out" }, 1.27);
        });
      });
    }, root);

    return () => {
      disposed = true;
      if (imageTimeout) window.clearTimeout(imageTimeout);
      if (shutterDelayTimeout) window.clearTimeout(shutterDelayTimeout);
      if (heroImage && onImageLoad) heroImage.removeEventListener("load", onImageLoad);
      if (heroImage && onImageError) heroImage.removeEventListener("error", onImageError);
      resolveImageReady?.();
      context.revert();
      restoreScroll();
    };
  }, []);

  if (!visible) return null;

  return (
    <div ref={rootRef} className="page-preloader" role="status" aria-label="Loading NOVA">
      <div className="page-preloader__panel page-preloader__panel--veil" aria-hidden="true" />
      <div className="page-preloader__panel page-preloader__panel--charcoal" aria-hidden="true" />
      <div className="page-preloader__panel page-preloader__panel--primary" aria-hidden="true" />
      <span className="page-preloader__brand" aria-hidden="true">NOVA</span>
      <span className="page-preloader__tagline" aria-hidden="true">Considered style, made to move.</span>
    </div>
  );
}