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
          src="https://picsum.photos/id/1027/900/900"
          alt="Two NOVA customers sitting together outdoors, wearing hoodies"
          loading="lazy"
        />
      </div>

      <div className="brand-story__content">
        <p className="eyebrow eyebrow--light">Our Story</p>
        <h2 className="section-heading section-heading--light">More Than Just Clothing</h2>
        <p className="brand-story__copy">
          We started NOVA with a simple belief — that what you wear should mean
          something. Our designs are inspired by real people, real stories and a
          better future.
        </p>

        <div className="brand-story__stats">
          {STATS.map((stat) => (
            <div className="brand-story__stat" key={stat.label}>
              <p className="brand-story__stat-value">{stat.value}</p>
              <p className="brand-story__stat-label">{stat.label}</p>
            </div>
          ))}
        </div>

        <a href="#about" className="btn btn--light">
          Our Journey <ArrowIcon />
        </a>
      </div>
    </section>
  );
}
