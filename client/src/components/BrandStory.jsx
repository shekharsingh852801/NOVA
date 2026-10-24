import { ArrowIcon } from "./Icons.jsx";

const STATS = [
  { value: "50K+", label: "Happy Customers" },
  { value: "4.8/5", label: "Average Rating" },
  { value: "100+", label: "Designs & Styles" },
  { value: "5", label: "Years of Impact" },
];

export default function BrandStory({ content }) {
  const stats = content?.stats || STATS;
  return (
    <section id="about" className="brand-story">
      <div className="brand-story__media">
        <img
          src={content?.image || "https://images.unsplash.com/photo-1552334488-bec0803d3c5b?auto=format&fit=crop&w=1200&q=90"}
          alt={content?.alt || "Two friends in casual streetwear sharing a bench"}
          loading="lazy"
        />
      </div>

      <div className="brand-story__content">
        <div className="brand-story__intro">
          <p className="eyebrow eyebrow--light reveal-up">{content?.eyebrow || "Our Story"}</p>
          <h2 className="section-heading section-heading--light reveal-up stagger-1">{content?.heading || "More Than Just Clothing"}</h2>
          <p className="brand-story__copy reveal-up stagger-2">
            {content?.description || "We started NOVA with a simple belief — that what you wear should mean something. Our designs are inspired by real people, real stories and a better future."}
          </p>
          <a href={content?.buttonHref || "#/about"} className="btn btn--light reveal-up stagger-3">
            {content?.buttonLabel || "Our Journey"} <ArrowIcon />
          </a>
        </div>

        <div className="brand-story__stats">
          {stats.map((stat, index) => (
            <div className={`brand-story__stat reveal-up stagger-${index + 1}`} key={stat.label}>
              <p className="brand-story__stat-value">{stat.value}</p>
              <p className="brand-story__stat-label">{stat.label}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
