import NewsletterForm from "./NewsletterForm.jsx";
import SplitHeading from "./SplitHeading.jsx";

export default function Newsletter({ content }) {
  return (
    <section className="newsletter">
      <img
        className="newsletter__image"
        src={content?.image || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=85"}
        alt={content?.alt || "Mountains at sunset"}
        loading="lazy"
      />
      <div className="newsletter__scrim" aria-hidden="true" />

      <div className="newsletter__content">
        <p className="eyebrow eyebrow--light reveal-up">{content?.eyebrow || "Join Our Community"}</p>
        <SplitHeading className="section-heading section-heading--light">{content?.heading || "Be the First to Know"}</SplitHeading>
        <p className="newsletter__copy reveal-up stagger-2">
          {content?.description || "Get exclusive offers, early access to new drops, and style inspiration straight to your inbox."}
        </p>
        <NewsletterForm source="newsletter-section" variant="light" />
      </div>
    </section>
  );
}
