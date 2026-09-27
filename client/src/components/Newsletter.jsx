import NewsletterForm from "./NewsletterForm.jsx";

export default function Newsletter() {
  return (
    <section className="newsletter">
      <img
        className="newsletter__image"
        src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=85"
        alt="Mountains at sunset"
        loading="lazy"
      />
      <div className="newsletter__scrim" aria-hidden="true" />

      <div className="newsletter__content">
        <p className="eyebrow eyebrow--light">Join Our Community</p>
        <h2 className="section-heading section-heading--light">Be the First to Know</h2>
        <p className="newsletter__copy">
          Get exclusive offers, early access to new drops, and style inspiration
          straight to your inbox.
        </p>
        <NewsletterForm source="newsletter-section" variant="light" />
      </div>
    </section>
  );
}
