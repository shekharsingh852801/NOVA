import { useEffect, useState } from "react";
import { fetchNewArrivals } from "../api/api.js";
import { fallbackProducts } from "../data/products.js";
import { ArrowIcon, PlusIcon } from "./Icons.jsx";

export default function NewArrivals() {
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchNewArrivals()
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) setProducts(data);
      })
      .catch(() => {
        // API unreachable — keep the bundled fallback data so the UI never breaks.
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="new-arrivals" className="new-arrivals">
      <div className="section-header">
        <div>
          <p className="eyebrow eyebrow--light">Latest Drop</p>
          <h2 className="section-heading section-heading--light">New Arrivals</h2>
        </div>
        <a href="#shop" className="text-link text-link--light">
          View All New Arrivals <ArrowIcon />
        </a>
      </div>

      <div className={`product-grid ${loading ? "product-grid--loading" : ""}`}>
        {products.map((product) => (
          <article className="product-card" key={product._id}>
            <div className="product-card__media">
              {product.tag && <span className="product-card__tag">{product.tag}</span>}
              <img src={product.image} alt={product.name} loading="lazy" />
            </div>
            <h3 className="product-card__name">{product.name}</h3>
            <p className="product-card__price">${product.price}</p>
            <div className="product-card__options">
              {product.colors?.length > 0 && (
                <div className="product-card__colors" aria-hidden="true">
                  {product.colors.map((color, i) => (
                    <span key={i} className="product-card__swatch" style={{ background: color }} />
                  ))}
                </div>
              )}
              <button className="product-card__add" aria-label={`Add ${product.name} to cart`}>
                <PlusIcon />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
