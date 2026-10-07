import { useEffect, useRef, useState } from "react";
import { fetchTestimonials } from "../api/api.js";
import { fallbackTestimonials } from "../data/testimonials.js";
import { ChevronIcon, StarIcon } from "./Icons.jsx";

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const trackRef = useRef(null);

  useEffect(() => {
    let active = true;
    fetchTestimonials()
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) setTestimonials(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const scroll = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: dir * (track.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section className="testimonials">
      <div className="section-header testimonials__intro">
        <div>
          <p className="eyebrow eyebrow--light reveal-up">Real Stories</p>
          <h2 className="section-heading section-heading--light reveal-up stagger-1">Loved by Our Community</h2>
        </div>
        <div className="testimonials__nav">
          <button aria-label="Previous testimonials" onClick={() => scroll(-1)}>
            <ChevronIcon direction="left" />
          </button>
          <button aria-label="Next testimonials" onClick={() => scroll(1)}>
            <ChevronIcon direction="right" />
          </button>
        </div>
      </div>

      <div className="testimonials__track reveal-up stagger-2" ref={trackRef}>
        {testimonials.map((t) => (
          <article className="testimonial-card" key={t._id}>
            <div className="testimonial-card__head">
              <img src={t.avatar} alt="" className="testimonial-card__avatar" />
              <div>
                <p className="testimonial-card__name">{t.name}</p>
                <div className="testimonial-card__meta">
                  <span className="testimonial-card__stars" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} filled={i < t.rating} />
                    ))}
                  </span>
                  {t.verified && <span className="testimonial-card__verified">Verified Buyer</span>}
                </div>
              </div>
            </div>
            <p className="testimonial-card__quote">&ldquo;{t.quote}&rdquo;</p>
            <p className="testimonial-card__time">— {t.postedAt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
