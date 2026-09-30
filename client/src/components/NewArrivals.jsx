import { ArrowIcon, HeartIcon, PlusIcon } from "./Icons.jsx";
import { useStore } from "../context/StoreContext.jsx";

export default function NewArrivals({ products = [], onProductSelect, onQuickView, onViewAll }) {
  const { wishlist, toggleWishlist } = useStore();
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

      <div className="product-grid arrivals-grid">
        {products.map((product) => (
          <article className="product-card" key={product._id}>
            <div className="product-card__media" onClick={() => onProductSelect(product)}>
              {product.tag && <span className="product-card__tag">{product.tag}</span>}
              <img src={product.images?.[0] || product.image} alt={product.name} loading="lazy" />
              <button className={`arrivals-wishlist ${wishlist.includes(product.id) ? "is-active" : ""}`} aria-label={`Save ${product.name}`} aria-pressed={wishlist.includes(product.id)} onClick={(event) => { event.stopPropagation(); toggleWishlist(product.id); }}><HeartIcon /></button>
              <button className="arrivals-quick-view" onClick={(event) => { event.stopPropagation(); onQuickView(product); }}>Quick view</button>
            </div>
            <button className="product-card__name" onClick={() => onProductSelect(product)}>{product.name}</button>
            <p className="product-card__price">${product.price}</p>
            <div className="product-card__options">
              {product.colors?.length > 0 && (
                <div className="product-card__colors" aria-hidden="true">
                  {product.colors.map((color, i) => (
                    <span key={i} className="product-card__swatch" style={{ background: color }} />
                  ))}
                </div>
              )}
              <button className="product-card__add" aria-label={`Quick view ${product.name}`} onClick={() => onQuickView(product)}>
                <PlusIcon />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
