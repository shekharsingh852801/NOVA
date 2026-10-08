const VALUES = [
  {
    title: "Timeless Design",
    description: "Classic pieces for a modern world.",
    icon: "spark",
  },
  {
    title: "Sustainable Choices",
    description: "Better materials. A healthier planet.",
    icon: "leaf",
  },
  {
    title: "Global Community",
    description: "Real people. Shared values.",
    icon: "people",
  },
  {
    title: "Higher Standards",
    description: "Quality in every detail.",
    icon: "star",
  },
];

function ValueIcon({ type }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (type) {
    case "spark":
      return (
        <svg {...commonProps}>
          <path d="M12 2.75v4.5M12 16.75v4.5M3.25 12h4.5M16.25 12h4.5M5.3 5.3l3.1 3.1M15.6 15.6l3.1 3.1M18.7 5.3l-3.1 3.1M8.4 15.6l-3.1 3.1" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...commonProps}>
          <path d="M18.5 5.5c-8.2 0-12 4.2-12 12 7.8 0 12-3.8 12-12Z" />
          <path d="M6.5 17.5c2.2-2.7 5-4.1 12-4.1" />
        </svg>
      );
    case "people":
      return (
        <svg {...commonProps}>
          <path d="M9.5 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-4.4 7c.3-2.7 2.3-4.5 5-4.5s4.7 1.8 5 4.5" />
          <path d="M15.5 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm4.3 7c-.1-2.1-1.8-3.7-4.3-3.9" />
        </svg>
      );
    case "star":
      return (
        <svg {...commonProps}>
          <path d="m12 2.75 2.5 5.1 5.6.8-4.1 4 1 5.6-5-2.7-5 2.7 1-5.6-4.1-4 5.6-.8L12 2.75Z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AboutPage({ onNavigate }) {
  const scrollToStory = () => {
    document.getElementById("nova-about-story")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <style>{`
        .nova-about-page {
          background: #f3efe9;
          color: #171611;
          font-family: var(--font-body);
        }

        .nova-about-page * {
          box-sizing: border-box;
        }

        .nova-about-page h1,
        .nova-about-page h2,
        .nova-about-page h3 {
          margin: 0;
          font-weight: 500;
          color: inherit;
        }

        .nova-about-page p {
          margin: 0;
        }

        .nova-about-page__hero {
          position: relative;
          min-height: 760px;
          background: #0b0d0c;
          overflow: hidden;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .nova-about-page__hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(7, 8, 9, 0.96) 0%, rgba(7, 8, 9, 0.8) 24%, rgba(7, 8, 9, 0.26) 60%, rgba(7, 8, 9, 0.12) 100%);
          z-index: 1;
        }

        .nova-about-page__hero-image {
          position: absolute;
          inset: 0;
          background-image: url("https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1400&q=80");
          background-size: cover;
          background-position: center center;
          filter: grayscale(1) contrast(1.12) brightness(0.7);
          transform: scale(1.06);
        }

        .nova-about-page__hero-inner {
          position: relative;
          z-index: 2;
          max-width: 1360px;
          margin: 0 auto;
          min-height: 760px;
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(200px, 0.35fr);
          gap: 30px;
          padding: 110px 42px 48px;
        }

        .nova-about-page__hero-copy {
          display: flex;
          flex-direction: column;
          justify-content: center;
          max-width: 650px;
          color: #f7f6f2;
          padding-top: 14px;
        }

        .nova-about-page__eyebrow,
        .nova-about-page__section-kicker {
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 18px;
        }

        .nova-about-page__hero .nova-about-page__eyebrow {
          color: rgba(247, 246, 242, 0.72);
        }

        .nova-about-page__headline {
          font-family: var(--font-display);
          font-weight: 500;
          line-height: 0.86;
          letter-spacing: -0.055em;
          font-size: clamp(4rem, 6vw, 8rem);
          margin-bottom: 26px;
          max-width: 560px;
          color: #ffffff;
        }

        .nova-about-page__text {
          max-width: 430px;
          color: rgba(247, 246, 242, 0.74);
          font-size: 13px;
          line-height: 1.7;
          margin-bottom: 30px;
        }

        .nova-about-page__cta {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 12px 18px 12px 16px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          background: rgba(255, 255, 255, 0.04);
          color: #f5f3ec;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 700;
          transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease;
          cursor: pointer;
        }

        .nova-about-page__cta:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.55);
        }

        .nova-about-page__hero-side {
          position: relative;
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
          padding-top: 120px;
          color: rgba(247, 246, 242, 0.8);
        }

        .nova-about-page__hero-side::before {
          content: "";
          position: absolute;
          left: 20px;
          top: 85px;
          width: 1px;
          height: 220px;
          background: linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.7), rgba(255,255,255,0));
        }

        .nova-about-page__meta {
          position: absolute;
          top: 0;
          right: 0;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(247, 246, 242, 0.72);
        }

        .nova-about-page__meta-stack {
          display: flex;
          flex-direction: column;
          gap: 14px;
          text-align: right;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          line-height: 1.6;
          padding-top: 70px;
        }

        .nova-about-page__story {
          background: #f3efe9;
          padding: 34px 42px 0;
          border-bottom: 1px solid rgba(23, 22, 17, 0.12);
        }

        .nova-about-page__story-inner {
          max-width: 1360px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 1.3fr) minmax(270px, 0.72fr);
          gap: 26px;
          align-items: center;
          background: #f3efe9;
        }

        .nova-about-page__story-image {
          height: 470px;
          background-image: url("https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80");
          background-size: cover;
          background-position: center center;
          border-radius: 4px 4px 0 0;
          filter: grayscale(0.35) contrast(1.05) brightness(0.94);
        }

        .nova-about-page__story-copy {
          padding: 28px 8px 8px;
          color: #171611;
        }

        .nova-about-page__section-kicker {
          color: rgba(23, 22, 17, 0.7);
          margin-bottom: 18px;
        }

        .nova-about-page__story-copy h2 {
          font-family: var(--font-display);
          font-size: clamp(2.3rem, 3.2vw, 4rem);
          line-height: 0.95;
          letter-spacing: -0.055em;
          margin-bottom: 20px;
        }

        .nova-about-page__story-copy p {
          max-width: 530px;
          color: rgba(23, 22, 17, 0.72);
          font-size: 13px;
          line-height: 1.8;
          margin-bottom: 12px;
        }

        .nova-about-page__story-copy .nova-about-page__cta {
          margin-top: 18px;
          background: transparent;
          color: #171611;
          border-color: rgba(23, 22, 17, 0.28);
        }

        .nova-about-page__values {
          border: 1px solid rgba(23, 22, 17, 0.12);
          background: rgba(255, 255, 255, 0.04);
          padding: 4px 0;
        }

        .nova-about-page__value {
          display: grid;
          grid-template-columns: 42px minmax(0, 1fr);
          gap: 14px;
          align-items: center;
          padding: 18px 18px 16px;
          border-bottom: 1px solid rgba(23, 22, 17, 0.12);
        }

        .nova-about-page__value:last-child {
          border-bottom: none;
        }

        .nova-about-page__value-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid rgba(23, 22, 17, 0.2);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #171611;
          background: rgba(255, 255, 255, 0.24);
        }

        .nova-about-page__value-icon svg {
          width: 18px;
          height: 18px;
        }

        .nova-about-page__value-title {
          font-size: 13px;
          letter-spacing: -0.02em;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .nova-about-page__value-copy {
          color: rgba(23, 22, 17, 0.68);
          line-height: 1.5;
          font-size: 12px;
        }

        .nova-about-page__stats {
          position: relative;
          min-height: 420px;
          background: #0c0d0b;
          color: #f5f1ea;
          overflow: hidden;
        }

        .nova-about-page__stats::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1800&q=80");
          background-size: cover;
          background-position: center center;
          filter: grayscale(0.7) contrast(1.18) brightness(0.54);
          transform: scale(1.09);
        }

        .nova-about-page__stats::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(10, 11, 11, 0.8) 0%, rgba(10, 11, 11, 0.72) 28%, rgba(10, 11, 11, 0.38) 100%);
        }

        .nova-about-page__stats-inner {
          position: relative;
          z-index: 1;
          max-width: 1360px;
          margin: 0 auto;
          min-height: 420px;
          padding: 42px 42px 50px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .nova-about-page__stats-head {
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(245, 241, 234, 0.72);
          margin-bottom: 18px;
        }

        .nova-about-page__stats h2 {
          font-family: var(--font-display);
          font-size: clamp(2.7rem, 4vw, 5rem);
          line-height: 0.9;
          letter-spacing: -0.06em;
          margin-bottom: 28px;
          max-width: 520px;
        }

        .nova-about-page__stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(110px, 1fr));
          gap: 18px;
          max-width: 1100px;
          width: 100%;
          align-items: flex-end;
        }

        .nova-about-page__stat {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 10px;
          letter-spacing: 0.02em;
          color: rgba(245, 241, 234, 0.78);
        }

        .nova-about-page__stat strong {
          display: block;
          font-family: var(--font-display);
          font-size: clamp(2.4rem, 3vw, 4rem);
          line-height: 0.9;
          font-weight: 500;
          letter-spacing: -0.05em;
          color: #f8f5ef;
          margin-bottom: 4px;
        }

        .nova-about-page__stats-quote {
          position: absolute;
          right: 64px;
          bottom: 18px;
          z-index: 1;
          color: rgba(245, 241, 234, 0.82);
          font-family: var(--font-display);
          font-style: italic;
          font-size: clamp(1.3rem, 2vw, 2.2rem);
          line-height: 1.1;
          letter-spacing: -0.04em;
          text-align: right;
          max-width: 260px;
        }

        .nova-about-page__mission {
          position: relative;
          background: #f3efe9;
          color: #171611;
          padding: 40px 42px 64px;
        }

        .nova-about-page__mission-inner {
          max-width: 1360px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.85fr) auto;
          gap: 28px;
          align-items: end;
          padding-top: 12px;
        }

        .nova-about-page__mission-header {
          position: relative;
          padding-left: 26px;
        }

        .nova-about-page__mission-header::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 8px;
          width: 1px;
          background: rgba(23, 22, 17, 0.28);
        }

        .nova-about-page__mission h2 {
          font-family: var(--font-display);
          font-size: clamp(2.5rem, 3.6vw, 5rem);
          line-height: 0.95;
          letter-spacing: -0.06em;
          margin-bottom: 0;
        }

        .nova-about-page__mission-copy {
          max-width: 510px;
          color: rgba(23, 22, 17, 0.72);
          font-size: 13px;
          line-height: 1.8;
          margin-top: 8px;
          padding-right: 20px;
        }

        .nova-about-page__mission-cta {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: #171611;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 700;
          border: none;
          background: transparent;
          padding: 0;
          cursor: pointer;
          white-space: nowrap;
        }

        .nova-about-page__mission-cta:hover {
          opacity: 0.78;
        }

        @media (max-width: 980px) {
          .nova-about-page__hero-inner {
            grid-template-columns: 1fr;
            padding-top: 110px;
          }

          .nova-about-page__hero-side {
            justify-content: flex-start;
            padding-top: 18px;
          }

          .nova-about-page__hero-side::before {
            display: none;
          }

          .nova-about-page__meta {
            position: static;
          }

          .nova-about-page__meta-stack {
            padding-top: 0;
            text-align: left;
          }

          .nova-about-page__story-inner {
            grid-template-columns: 1fr;
          }

          .nova-about-page__story-image {
            height: 420px;
          }

          .nova-about-page__stats-grid {
            grid-template-columns: repeat(2, minmax(110px, 1fr));
          }

          .nova-about-page__mission-inner {
            grid-template-columns: 1fr;
            align-items: start;
          }

          .nova-about-page__mission-cta {
            margin-left: 0;
          }
        }

        @media (max-width: 640px) {
          .nova-about-page__hero,
          .nova-about-page__hero-inner {
            min-height: 620px;
          }

          .nova-about-page__hero-inner,
          .nova-about-page__story,
          .nova-about-page__stats-inner,
          .nova-about-page__mission {
            padding-left: 22px;
            padding-right: 22px;
          }

          .nova-about-page__headline {
            max-width: 100%;
            letter-spacing: -0.05em;
          }

          .nova-about-page__story-image {
            height: 300px;
          }

          .nova-about-page__values {
            margin-top: 8px;
          }

          .nova-about-page__stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 18px 12px;
          }

          .nova-about-page__stats-quote {
            position: static;
            margin-top: 22px;
            text-align: left;
          }

          .nova-about-page__mission h2 {
            font-size: 2.7rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .nova-about-page__hero-image,
          .nova-about-page__stats::before {
            transform: none;
          }

          .nova-about-page__cta,
          .nova-about-page__mission-cta {
            transition: none;
          }
        }
      `}</style>

      <main className="nova-about-page">
        <section className="nova-about-page__hero" aria-label="About NOVA hero section">
          <div className="nova-about-page__hero-image" aria-hidden="true" />
          <div className="nova-about-page__hero-inner">
            <div className="nova-about-page__hero-copy">
              <p className="nova-about-page__eyebrow">About NOVA</p>
              <h1 className="nova-about-page__headline">More Than<br />Just Fashion</h1>
              <p className="nova-about-page__text">
                NOVA is a modern fashion brand built for dreamers, creators, and explorers. We design timeless pieces that blend comfort, quality, and purpose — because what you wear shapes how you move through the world.
              </p>
              <button type="button" className="nova-about-page__cta" onClick={scrollToStory}>
                Our Story <span aria-hidden="true">→</span>
              </button>
            </div>

            <div className="nova-about-page__hero-side" aria-hidden="true">
              <span className="nova-about-page__meta">Est. 2024</span>
              <div className="nova-about-page__meta-stack">
                <span>Timeless</span>
                <span>Pieces for</span>
                <span>A modern</span>
                <span>World.</span>
              </div>
            </div>
          </div>
        </section>

        <section id="nova-about-story" className="nova-about-page__story" aria-label="Our story section">
          <div className="nova-about-page__story-inner">
            <div className="nova-about-page__story-image" aria-label="NOVA story image" role="img" />

            <div className="nova-about-page__story-copy">
              <p className="nova-about-page__section-kicker">Our Story</p>
              <h2>Built on a Vision</h2>
              <p>
                NOVA started with a simple idea — to create fashion that feels as good as it looks. What began as a passion project has grown into a movement, driven by a community that values authenticity, quality, and conscious choices.
              </p>
              <p>
                We&apos;re not just making clothes.<br />
                We&apos;re building a lifestyle.
              </p>
              <button type="button" className="nova-about-page__cta" onClick={() => onNavigate("shop")}>
                Our Mission <span aria-hidden="true">→</span>
              </button>
            </div>

            <div className="nova-about-page__values" aria-label="Brand values">
              {VALUES.map((value) => (
                <div className="nova-about-page__value" key={value.title}>
                  <div className="nova-about-page__value-icon">
                    <ValueIcon type={value.icon} />
                  </div>
                  <div>
                    <div className="nova-about-page__value-title">{value.title}</div>
                    <div className="nova-about-page__value-copy">{value.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="nova-about-page__stats" aria-label="By the numbers section">
          <div className="nova-about-page__stats-inner">
            <div className="nova-about-page__stats-head">By the Numbers</div>
            <h2>A Growing Movement</h2>
            <div className="nova-about-page__stats-grid">
              <div className="nova-about-page__stat">
                <strong>50K+</strong>
                <span>Global Customers</span>
              </div>
              <div className="nova-about-page__stat">
                <strong>100+</strong>
                <span>Countries</span>
              </div>
              <div className="nova-about-page__stat">
                <strong>500+</strong>
                <span>Unique Designs</span>
              </div>
              <div className="nova-about-page__stat">
                <strong>4.8★</strong>
                <span>Customer Rating</span>
              </div>
            </div>
          </div>
          <div className="nova-about-page__stats-quote">Same values,<br />bigger dreams.</div>
        </section>

        <section className="nova-about-page__mission" aria-label="Our mission section">
          <div className="nova-about-page__mission-inner">
            <div className="nova-about-page__mission-header">
              <p className="nova-about-page__section-kicker">Our Mission</p>
              <h2>Better Choices.<br />A Brighter Future.</h2>
            </div>

            <p className="nova-about-page__mission-copy">
              We&apos;re on a mission to redefine modern fashion by creating high-quality, sustainable pieces that inspire a more conscious and connected world.
            </p>

            <button type="button" className="nova-about-page__mission-cta" onClick={() => onNavigate("shop")}>
              Join Our Journey <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
