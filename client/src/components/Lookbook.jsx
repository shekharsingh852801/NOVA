import { lookbookImages } from "../data/products.js";
import { ArrowIcon } from "./Icons.jsx";

export default function Lookbook({ onShopLook }) {
  return (
    <section className="lookbook">
      <div className="lookbook__intro">
        <p className="eyebrow eyebrow--dark">Style Inspiration</p>
        <h2 className="section-heading section-heading--dark">Our Lookbook</h2>
        <p className="lookbook__copy">
          Real people. Real style. See how our community styles NOVA in everyday life.
        </p>
        <button type="button" onClick={onShopLook} className="btn btn--dark">
          View Lookbook <ArrowIcon />
        </button>
      </div>

      <div className="lookbook__strip">
        {lookbookImages.map((src, i) => (
          <img key={i} src={src} alt={`NOVA lookbook style ${i + 1}`} loading="lazy" />
        ))}
      </div>
    </section>
  );
}
