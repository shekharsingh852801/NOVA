import { ArrowIcon } from "./Icons.jsx";
import { ProductGrid } from "./Commerce.jsx";
import SplitHeading from "./SplitHeading.jsx";

export default function NewArrivals({ products = [], loading, onQuickView, onViewAll, content }) {
  return (
    <section id="new-arrivals" className="new-arrivals">
      <div className="section-header">
        <div>
          <p className="eyebrow eyebrow--light reveal-up">{content?.eyebrow || "Latest Drop"}</p>
          <SplitHeading className="section-heading section-heading--light">{content?.heading || "New Arrivals"}</SplitHeading>
        </div>
        <button type="button" onClick={onViewAll} className="text-link text-link--light">
          {content?.buttonLabel || "View All New Arrivals"} <ArrowIcon />
        </button>
      </div>
      <ProductGrid products={products} loading={loading} onQuickView={onQuickView} variant="home" />
    </section>
  );
}