import { useRef } from "react";
import { categories } from "../data/products.js";
import { ArrowIcon } from "./Icons.jsx";
import SplitHeading from "./SplitHeading.jsx";
import { hasFinePointer, prefersReducedMotion, useMagnetic } from "../utils/motion.js";

const PARALLAX_SHIFT = 5;

export default function CategoryGrid({ onCategorySelect, content, onExplore }) {
  const items = content?.items || categories;
  const ctaRef = useRef(null);
  useMagnetic(ctaRef);

  const handleCardPointer = (event) => {
    if (prefersReducedMotion() || !hasFinePointer() || event.pointerType !== "mouse") return;
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    card.style.setProperty("--px", `${(dx * PARALLAX_SHIFT).toFixed(1)}px`);
    card.style.setProperty("--py", `${(dy * PARALLAX_SHIFT).toFixed(1)}px`);
  };
  const resetCardPointer = (event) => {
    const card = event.currentTarget;
    card.style.setProperty("--px", "0px");
    card.style.setProperty("--py", "0px");
  };

  return (
    <section id="shop" className="category-section">
      <div className="category-section__intro">
        <p className="eyebrow eyebrow--dark reveal-up">{content?.eyebrow || "Shop By Category"}</p>
        <SplitHeading className="section-heading section-heading--dark">
          {content?.heading || "Find Your Perfect Fit"}
        </SplitHeading>
        <p className="category-section__copy reveal-up stagger-2">
          {content?.description || "From everyday essentials to seasonal statement pieces — explore our carefully curated categories."}
        </p>
        <button type="button" ref={ctaRef} onClick={onExplore || (() => onCategorySelect("All"))} className="btn btn--dark btn--magnetic reveal-up stagger-3">
          {content?.buttonLabel || "Explore All"} <ArrowIcon />
        </button>
      </div>

      <div className="category-grid">
        {items.map((cat) => (
          <a
            href={`#/shop?category=${cat.name}`}
            className="category-card reveal-up"
            key={cat.name}
            onClick={(event) => { event.preventDefault(); onCategorySelect(cat.name); }}
            onPointerMove={handleCardPointer}
            onPointerLeave={resetCardPointer}
          >
            <img src={cat.image} alt={`${cat.name} collection`} loading="lazy" />
            <div className="category-card__scrim" aria-hidden="true" />
            <div className="category-card__label">
              <p className="category-card__name">{cat.name}</p>
              <span className="text-link text-link--light text-link--sm">
                {cat.cta} <ArrowIcon width="13" height="13" />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
