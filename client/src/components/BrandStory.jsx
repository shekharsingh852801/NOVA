import { ArrowIcon } from "./Icons.jsx";

const STATS = [
  { value: "50K+", label: "Happy Customers" },
  { value: "4.8/5", label: "Average Rating" },
  { value: "100+", label: "Designs & Styles" },
  { value: "5", label: "Years of Impact" },
];

export default function BrandStory() {
  return (
    <section id="about" className="brand-story">
      <div className="brand-story__media">
        <img
          src="https://images.unsplash.com/photo-1552334488-bec0803d3c5b?auto=format&fit=crop&w=1200&q=90"
          alt="Two friends in casual streetwear sharing a bench"
          loading="lazy"
        />
      </div>

      <div className="brand-story__content">
        <div className="brand-story__intro">
          <p className="eyebrow eyebrow--light">Our Story</p>
          <h2 className="section-heading section-heading--light">More Than Just Clothing</h2>
          <p className="brand-story__copy">
            We started NOVA with a simple belief — that what you wear should mean
            something. Our designs are inspired by real people, real stories and a
            better future.
          </p>
          <a href="#/about" className="btn btn--light">
            Our Journey <ArrowIcon />
          </a>
        </div>

        <div className="brand-story__stats">
          {STATS.map((stat) => (
            <div className="brand-story__stat" key={stat.label}>
              <p className="brand-story__stat-value">{stat.value}</p>
              <p className="brand-story__stat-label">{stat.label}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
