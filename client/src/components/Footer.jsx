import NewsletterForm from "./NewsletterForm.jsx";

const LINK_COLUMNS = [
  {
    title: "Shop",
    links: ["New Arrivals", "Men", "Women", "Accessories", "Sale"],
  },
  {
    title: "Support",
    links: ["Help Center", "Shipping Info", "Returns & Exchanges", "Size Guide", "Contact Us"],
  },
  {
    title: "About",
    links: ["Our Story", "Sustainability", "Careers", "Journal", "Press"],
  },
];

const LINK_PATHS = {
  "New Arrivals": "shop?edit=new-arrivals",
  Men: "shop?category=Men",
  Women: "shop?category=Women",
  Accessories: "shop?category=Accessories",
  Sale: "sale",
  "Help Center": "contact",
  "Shipping Info": "policy/shipping",
  "Returns & Exchanges": "policy/returns",
  "Size Guide": "shop",
  "Contact Us": "contact",
  "Our Story": "about",
  Sustainability: "about",
  Careers: "contact",
  Journal: "journal",
  Press: "journal",
};

const SOCIALS = [
  { label: "Instagram", path: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm5.6-1.1a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" },
  { label: "Facebook", path: "M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h2.5l.5-3H14V9Z" },
  { label: "Pinterest", path: "M12 2C6.5 2 3 5.9 3 10.2c0 2.6 1.4 4.8 3.5 5.7-.1-.5-.1-1.2 0-1.7l1-4.3s-.3-.6-.3-1.4c0-1.3.8-2.3 1.7-2.3.8 0 1.2.6 1.2 1.3 0 .8-.5 2-.8 3.1-.2 1 .5 1.7 1.4 1.7 1.7 0 3-1.8 3-4.4 0-2.3-1.6-3.9-4-3.9-2.7 0-4.3 2-4.3 4.1 0 .8.3 1.6.7 2.1.1.1.1.2 0 .3l-.3 1c0 .2-.1.2-.3.1-1.2-.6-2-2.3-2-3.8C4.5 6.8 7.2 4 11.7 4c3.7 0 6.5 2.6 6.5 6.1 0 3.6-2.3 6.6-5.5 6.6-1.1 0-2.1-.6-2.4-1.2l-.7 2.5c-.2 1-.9 2.2-1.4 3 .9.3 1.9.5 2.8.5 5.5 0 9-4.5 9-10S17.5 2 12 2Z" },
  { label: "YouTube", path: "M21.6 7.2s-.2-1.5-.8-2.1c-.8-.8-1.7-.8-2.1-.9C15.9 4 12 4 12 4h0s-3.9 0-6.7.2c-.4 0-1.3.1-2.1.9-.6.6-.8 2.1-.8 2.1S2.2 9 2.2 10.7v1.6c0 1.7.2 3.5.2 3.5s.2 1.5.8 2.1c.8.8 1.9.8 2.4.9C7.4 19 12 19 12 19s3.9 0 6.7-.2c.4-.1 1.3-.1 2.1-.9.6-.6.8-2.1.8-2.1s.2-1.7.2-3.5v-1.6c0-1.7-.2-3.5-.2-3.5ZM10 14.3V8.9l5.2 2.7-5.2 2.7Z" },
  { label: "TikTok", path: "M14.7 2h2.9c.2 1.6 1.2 3 2.8 3.6v3c-1.4 0-2.7-.4-3.8-1.1v6.8c0 3.1-2.5 5.7-5.7 5.7S5.2 17.4 5.2 14.3c0-3 2.3-5.4 5.2-5.6v2.9c-1.4.2-2.4 1.4-2.4 2.7 0 1.5 1.2 2.7 2.7 2.7s2.7-1.2 2.7-2.7V2Z" },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__brand">
          <p className="footer__logo">NOVA</p>
          <p className="footer__tagline">Better Style. A Brighter Tomorrow.</p>
          <div className="footer__socials">
            {SOCIALS.map((s) => (
              <a key={s.label} href="#top" aria-label={s.label} className="footer__social-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {LINK_COLUMNS.map((col) => (
          <nav className="footer__column" key={col.title} aria-label={col.title}>
            <p className="footer__column-title">{col.title}</p>
            <ul>
              {col.links.map((link) => (
                <li key={link}>
                  <a href={`#/${LINK_PATHS[link] || "shop"}`}>{link}</a>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="footer__newsletter">
          <p className="footer__column-title">Join our community</p>
          <p className="footer__newsletter-copy">Get exclusive updates and offers</p>
          <NewsletterForm source="footer" variant="dark" />
        </div>
      </div>

      <div className="footer__bottom">
        <p>© 2026 NOVA. All rights reserved.</p>
        <div className="footer__bottom-links">
          <a href="#/policy/privacy">Privacy Policy</a>
          <a href="#/policy/terms">Terms of Service</a>
          <a href="#/policy/cookies">Cookie Settings</a>
        </div>
        <span className="footer__lang" aria-label="Current language">English</span>
      </div>
    </footer>
  );
}
