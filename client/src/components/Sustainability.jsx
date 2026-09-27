import { LeafIcon, RecycleIcon, ShieldIcon, PackageIcon, ArrowIcon } from "./Icons.jsx";

const POINTS = [
  { icon: LeafIcon, title: "Organic Cotton", subtitle: "Naturally better" },
  { icon: RecycleIcon, title: "Recycled Fabrics", subtitle: "Less waste, more style" },
  { icon: ShieldIcon, title: "Ethical Production", subtitle: "Fair for everyone" },
  { icon: PackageIcon, title: "Eco Packaging", subtitle: "Plastic-free & recyclable" },
];

export default function Sustainability() {
  return (
    <section className="sustainability">
      <img
        className="sustainability__image"
        src="https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=2000&q=90"
        alt="A hiker looking out over green mountains, wearing a NOVA jacket"
        loading="lazy"
      />
      <div className="sustainability__scrim" aria-hidden="true" />

      <div className="sustainability__content">
        <div className="sustainability__intro">
          <p className="eyebrow eyebrow--light">Sustainability</p>
          <h2 className="section-heading section-heading--light">
            Style That Respects the Planet
          </h2>
          <p className="sustainability__copy">
            We use eco-friendly fabrics, ethical production and sustainable
            packaging — because great style should never come at the earth's expense.
          </p>
          <a href="#about" className="btn btn--light">
            Our Commitment <ArrowIcon />
          </a>
        </div>

        <div className="sustainability__grid">
          {POINTS.map(({ icon: Icon, title, subtitle }) => (
            <div className="sustainability__point" key={title}>
              <span className="sustainability__icon">
                <Icon />
              </span>
              <span>
                <p className="sustainability__point-title">{title}</p>
                <p className="sustainability__point-subtitle">{subtitle}</p>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
