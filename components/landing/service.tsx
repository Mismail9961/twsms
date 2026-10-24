import React from "react";

/**
 * ServicesSection
 * - White section with five service cards (brand color #2c2772).
 * - Works from 320px (iPhone 5s) up. No flex `gap` and no clamp() because
 *   iOS 12 Safari (the last version the 5s runs) doesn't support them.
 * - No images needed: icons are inline SVG.
 */

type Service = { title: string; text: string; icon: React.ReactNode };

const svg = (children: React.ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    width="26"
    height="26"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const SERVICES: Service[] = [
  {
    title: "Customer Support",
    text: "Quarterly or annual support agreements with 24/7 or 8x5 response times. Next-business-day support, with on-call engineer visits as needed.",
    icon: svg(
      <>
        <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
        <path d="M4 14h3v5H4z" />
        <path d="M17 14h3v5h-3z" />
        <path d="M20 19v.5a2.5 2.5 0 0 1-2.5 2.5H14" />
      </>
    ),
  },
  {
    title: "Network Design & Services",
    text: "We are vendor-neutral, with deep expertise in designing and optimizing converged network infrastructures.",
    icon: svg(
      <>
        <circle cx="12" cy="5" r="2.2" />
        <circle cx="5" cy="19" r="2.2" />
        <circle cx="19" cy="19" r="2.2" />
        <path d="M12 7.2V12" />
        <path d="M12 12l-5.2 5.2" />
        <path d="M12 12l5.2 5.2" />
      </>
    ),
  },
  {
    title: "Network Migration",
    text: "We facilitate seamless migration of data and systems from legacy networks to modern infrastructure, minimizing downtime and risk.",
    icon: svg(
      <>
        <path d="M4 8h15" />
        <path d="M15 4l4 4-4 4" />
        <path d="M20 16H5" />
        <path d="M9 12l-4 4 4 4" />
      </>
    ),
  },
  {
    title: "Project Management",
    text: "Our senior consultants lead enterprise-level projects, ensuring quality delivery and timely implementation.",
    icon: svg(
      <>
        <path d="M9 4h6v3H9z" />
        <path d="M8 5.5H6a1 1 0 0 0-1 1V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6.5a1 1 0 0 0-1-1h-2" />
        <path d="M9 14l2 2 4-4" />
      </>
    ),
  },
  {
    title: "Audit Services",
    text: "We perform comprehensive network and security audits to detect vulnerabilities and ensure optimal performance, with corrective actions as needed.",
    icon: svg(
      <>
        <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
];

const BRAND = "#2c2772";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&display=swap');

.sv {
  --brand: ${BRAND};
  position: relative;
  width: 100%;
  overflow: hidden;
  color: var(--brand);
  font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  padding: 52px 16px 56px;
  background: #fff;
}
.sv *, .sv *::before, .sv *::after { box-sizing: border-box; }
.sv__inner { position: relative; max-width: 1240px; margin: 0 auto; }

/* ---------- heading ---------- */
.sv__head { max-width: 640px; margin: 0 auto 32px; text-align: center; }
.sv__title {
  margin: 0;
  font-size: 1.75rem;
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--brand);
}
.sv__title::after {
  content: "";
  display: block;
  width: 44px; height: 3px;
  margin: 16px auto 0;
  border-radius: 3px;
  background: var(--brand);
}
.sv__lede {
  margin: 16px auto 0;
  max-width: 46ch;
  font-size: .9375rem;
  line-height: 1.65;
  color: #54537a;
}

/* ---------- cards ---------- */
.sv__grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-gap: 12px;
  gap: 12px;
}
.sv__card {
  position: relative;
  overflow: hidden;
  background: #f7f7fc;
  color: var(--brand);
  border: 1px solid rgba(44,39,114,.10);
  border-radius: 18px;
  padding: 22px 20px 24px;
  box-shadow: 0 1px 2px rgba(44,39,114,.04);
  -webkit-transition: -webkit-transform .3s ease, box-shadow .3s ease, background-color .3s ease;
  transition: transform .3s cubic-bezier(.2,.7,.2,1), box-shadow .3s ease, background-color .3s ease;
}
.sv__card::after {
  content: "";
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 4px;
  background: linear-gradient(90deg, #2c2772, #5a54c4);
  -webkit-transform: scaleX(0);
  transform: scaleX(0);
  -webkit-transform-origin: left;
  transform-origin: left;
  -webkit-transition: -webkit-transform .4s ease;
  transition: transform .4s cubic-bezier(.2,.7,.2,1);
}
.sv__top {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: space-between;
  justify-content: space-between;
}
.sv__icon {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
  width: 52px; height: 52px;
  border-radius: 14px;
  color: #fff;
  background: linear-gradient(145deg, #3a339a 0%, #2c2772 60%, #1f1b5c 100%);
  box-shadow: 0 10px 18px -10px rgba(44,39,114,.8);
}
.sv__num {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: rgba(44,39,114,.14);
}
.sv__name {
  margin: 20px 0 0;
  font-size: 1.125rem;
  line-height: 1.25;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--brand);
}
.sv__name::after {
  content: "";
  display: block;
  width: 28px; height: 3px;
  margin-top: 12px;
  border-radius: 3px;
  background: rgba(44,39,114,.25);
}
.sv__text {
  margin: 14px 0 0;
  font-size: .9375rem;
  line-height: 1.65;
  color: #54537a;
}

@media (hover: hover) {
  .sv__card:hover {
    -webkit-transform: translateY(-4px);
    transform: translateY(-4px);
    background: #fff;
    box-shadow: 0 24px 40px -24px rgba(44,39,114,.30);
  }
  .sv__card:hover::after { -webkit-transform: scaleX(1); transform: scaleX(1); }
}

/* ---------- breakpoints ---------- */
@media (min-width: 640px) {
  .sv { padding: 72px 28px 80px; }
  .sv__title { font-size: 2.25rem; }
  .sv__lede { font-size: 1rem; }
  .sv__head { margin-bottom: 44px; }
  .sv__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-gap: 16px; gap: 16px; }
  .sv__card:last-child { grid-column: span 2; }
  .sv__card { padding: 26px 26px 28px; }
}
@media (min-width: 1024px) {
  .sv { padding: 96px 40px 104px; }
  .sv__title { font-size: 2.75rem; }
  .sv__head { margin-bottom: 56px; }
  .sv__grid { grid-template-columns: repeat(6, minmax(0, 1fr)); grid-gap: 20px; gap: 20px; }
  .sv__card { grid-column: span 2; padding: 32px 30px 34px; border-radius: 22px; }
  .sv__card:nth-child(4), .sv__card:nth-child(5) { grid-column: span 3; }
  .sv__card:last-child { grid-column: span 3; }
  .sv__name { font-size: 1.25rem; }
}
@media (prefers-reduced-motion: reduce) {
  .sv__card, .sv__card::after { -webkit-transition: none; transition: none; }
}
`;

export function ServicesSection() {
  return (
    <section id="services" className="sv scroll-mt-20" aria-labelledby="sv-title">
      <style>{css}</style>

      <div className="sv__inner">
        <header className="sv__head">
          <h2 id="sv-title" className="sv__title">
            Service portfolio
          </h2>
          <p className="sv__lede">
            End-to-end network and security services, from first design to
            ongoing support.
          </p>
        </header>

        <ul className="sv__grid">
          {SERVICES.map((s, i) => (
            <li className="sv__card" key={s.title}>
              <div className="sv__top">
                <span className="sv__icon">{s.icon}</span>
                <span className="sv__num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="sv__name">{s.title}</h3>
              <p className="sv__text">{s.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default ServicesSection;