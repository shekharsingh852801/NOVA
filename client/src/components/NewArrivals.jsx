import { ArrowIcon } from "./Icons.jsx";
import { ProductGrid } from "./Commerce.jsx";

export default function NewArrivals({ products = [], onQuickView, onViewAll }) {
  return (
    <section id="new-arrivals" className="new-arrivals">
      <div className="section-header">
        <div>
          <p className="eyebrow eyebrow--light">Latest Drop</p>
          <h2 className="section-heading section-heading--light">New Arrivals</h2>
        </div>
        <button type="button" onClick={onViewAll} className="text-link text-link--light">
          View All New Arrivals <ArrowIcon />
        </button>
      </div>
      <ProductGrid products={products} onQuickView={onQuickView} variant="home" />
    </section>
  );
}