import NewsletterForm from "./NewsletterForm.jsx";

export default function Newsletter() {
  return (
    <section className="newsletter">
      <img
        className="newsletter__image"
        src="https://picsum.photos/id/1018/1600/900"
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
