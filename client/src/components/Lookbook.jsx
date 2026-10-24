import { lookbookImages } from "../data/products.js";
import { ArrowIcon } from "./Icons.jsx";

export default function Lookbook({ onShopLook, content }) {
  const images = content?.images || lookbookImages.map((src, index) => ({ src, alt: `NOVA lookbook style ${index + 1}` }));
  return (
    <section id="lookbook" className="lookbook">
      <div className="lookbook__intro">
        <p className="eyebrow eyebrow--dark">{content?.eyebrow || "Style Inspiration"}</p>
        <h2 className="section-heading section-heading--dark">{content?.heading || "Our Lookbook"}</h2>
        <p className="lookbook__copy">
          {content?.description || "Real people. Real style. See how our community styles NOVA in everyday life."}
        </p>
        <button type="button" onClick={onShopLook} className="btn btn--dark">
          {content?.buttonLabel || "View Lookbook"} <ArrowIcon />
        </button>
      </div>

      <div className="lookbook__strip">
        {images.map(({ src, alt }, i) => (
          <img key={`${src}-${i}`} src={src} alt={alt} loading="lazy" />
        ))}
      </div>
    </section>
  );
}
