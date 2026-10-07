import { ArrowIcon } from "./Icons.jsx";
import { ProductGrid } from "./Commerce.jsx";

export default function NewArrivals({ products = [], loading, onQuickView, onViewAll }) {
  return (
    <section id="new-arrivals" className="new-arrivals">
      <div className="section-header">
        <div>
          <p className="eyebrow eyebrow--light reveal-up">Latest Drop</p>
          <h2 className="section-heading section-heading--light reveal-up stagger-1">New Arrivals</h2>
        </div>
        <button type="button" onClick={onViewAll} className="text-link text-link--light">
          View All New Arrivals <ArrowIcon />
        </button>
      </div>
      <ProductGrid products={products} loading={loading} onQuickView={onQuickView} variant="home" />
    </section>
  );
}