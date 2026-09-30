import { categories } from "../data/products.js";
import { ArrowIcon } from "./Icons.jsx";

export default function CategoryGrid({ onCategorySelect }) {
  return (
    <section id="shop" className="category-section">
      <div className="category-section__intro">
        <p className="eyebrow eyebrow--dark">Shop By Category</p>
        <h2 className="section-heading section-heading--dark">Find Your Perfect Fit</h2>
        <p className="category-section__copy">
          From everyday essentials to seasonal statement pieces — explore our carefully
          curated categories.
        </p>
        <button type="button" onClick={() => onCategorySelect("All")} className="btn btn--dark">
          Explore All <ArrowIcon />
        </button>
      </div>

      <div className="category-grid">
        {categories.map((cat) => (
          <a href={`#/shop?category=${cat.name}`} className="category-card" key={cat.name} onClick={(event) => { event.preventDefault(); onCategorySelect(cat.name); }}>
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
