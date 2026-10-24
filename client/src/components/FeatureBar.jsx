import { BoxIcon, LeafIcon, TruckIcon, RefreshIcon } from "./Icons.jsx";

const FEATURES = [
  { icon: BoxIcon, title: "Premium Quality", subtitle: "Crafted to last" },
  { icon: LeafIcon, title: "Sustainable Materials", subtitle: "Better for the planet" },
  { icon: TruckIcon, title: "Free Shipping", subtitle: "On orders over $75" },
  { icon: RefreshIcon, title: "Easy Returns", subtitle: "Hassle-free 30 days" },
];

export default function FeatureBar({ content }) {
  const items = content?.items || FEATURES.map(({ title, subtitle }) => ({ title, subtitle }));
  return (
    <section className="feature-bar" aria-label="Store benefits">
      {items.map(({ title, subtitle }, index) => {
        const Icon = FEATURES[index % FEATURES.length].icon;
        return (
        <div className="feature-bar__item" key={title}>
          <span className="feature-bar__icon">
            <Icon />
          </span>
          <span>
            <p className="feature-bar__title">{title}</p>
            <p className="feature-bar__subtitle">{subtitle}</p>
          </span>
        </div>
        );
      })}
    </section>
  );
}
